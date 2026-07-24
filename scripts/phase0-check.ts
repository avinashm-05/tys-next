/**
 * Phase 0 self-check — the one runnable proof that the foundation works.
 * Run against LOCAL dev (never production):  npm run phase0:check
 *
 * Verifies: bcrypt $2y$ login through Better Auth (after a real backfill run),
 * requireAdmin, cache + single-flight lock, rate limiter, soft deletes,
 * the 422 contract, and decimal-as-string serialization.
 */
import "./env";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "../src/lib/db";
import { auth, requireAdmin, isAdmin, type AppSession } from "../src/lib/auth";
import { cacheGet, cacheSet, cacheDelete, withLock } from "../src/lib/cache";
import {
  rateLimit,
  rateLimitPeek,
  rateLimitHit,
  rateLimitClear,
} from "../src/lib/ratelimit";
import { encryptSsn, decryptSsn, hashSsn } from "../src/lib/pii";
import { validationError, HttpError } from "../src/lib/validation/errors";
import { emptyStringsToNull } from "../src/lib/validation/common";
import { decimal2 } from "../src/lib/serialize";

const ADMIN_EMAIL = "phase0-admin@example.test";
const USER_EMAIL = "phase0-user@example.test";
const PASSWORD = "correct horse battery staple";

/** What Laravel writes: a $2y$-prefixed bcrypt hash (same algorithm as $2b$). */
async function laravelHash(password: string): Promise<string> {
  return (await bcrypt.hash(password, 12)).replace(/^\$2b\$/, "$2y$");
}

async function seedLaravelStyleUsers() {
  const now = new Date();
  const adminType = await db.userType.upsert({
    where: { slug: "admin" },
    update: {},
    create: { name: "Admin", slug: "admin", createdAt: now, updatedAt: now },
  });
  const userType = await db.userType.upsert({
    where: { slug: "user" },
    update: {},
    create: { name: "User", slug: "user", createdAt: now, updatedAt: now },
  });

  // Pure-Laravel rows: bcrypt $2y$ in users.password, NO role/accounts yet —
  // the backfill has to do its job for login to work.
  for (const [email, typeId] of [
    [ADMIN_EMAIL, adminType.id],
    [USER_EMAIL, userType.id],
  ] as const) {
    const password = await laravelHash(PASSWORD);
    // emailVerifiedAt set: prod-realistic, and REQUIRED since C1 — the global
    // requireEmailVerification flag would otherwise block these logins (the
    // backfill maps email_verified_at → emailVerified).
    const user = await db.user.upsert({
      where: { email },
      update: {
        password,
        userTypeId: typeId,
        role: null,
        emailVerified: false,
        emailVerifiedAt: now,
      },
      create: {
        email,
        password,
        userTypeId: typeId,
        emailVerifiedAt: now,
        name: email.split("@")[0],
        createdAt: now,
        updatedAt: now,
      },
    });
    await db.account.deleteMany({ where: { userId: user.id } });
    await db.session.deleteMany({ where: { userId: user.id } });
  }
}

async function main() {
  // ---- backfill: creates credential accounts + copies roles ----------------
  await seedLaravelStyleUsers();
  execFileSync("npx", ["tsx", "scripts/backfill-auth.ts"], { stdio: "inherit" });

  const admin = await db.user.findUniqueOrThrow({
    where: { email: ADMIN_EMAIL },
    include: { accounts: true },
  });
  assert.equal(admin.role, "admin", "backfill copies user_types.slug to role");
  assert.equal(admin.accounts.length, 1, "backfill creates one credential account");
  assert.match(admin.accounts[0].password ?? "", /^\$2y\$/, "bcrypt hash carried as-is");

  // ---- login with the Laravel bcrypt password (direct verify, no rehash) ---
  const signIn = await auth.api.signInEmail({
    body: { email: ADMIN_EMAIL, password: PASSWORD },
  });
  assert.equal(signIn.user.email, ADMIN_EMAIL, "login with $2y$ bcrypt password works");
  const sessions = await db.session.findMany({ where: { userId: admin.id } });
  assert.equal(sessions.length, 1, "DB-backed session row created");

  let unauthorized = false;
  try {
    await auth.api.signInEmail({ body: { email: ADMIN_EMAIL, password: "wrong" } });
  } catch {
    unauthorized = true;
  }
  assert.ok(unauthorized, "wrong password is rejected");

  // ---- bcrypt $2y$ verify hook — self-contained (independent of seed state) --
  // A throwaway user with a KNOWN Laravel-style hash proves the compat path
  // deterministically, even if other tests (e.g. the A1 reset flow) re-hash
  // the seed admin's credential to scrypt.
  {
    const email = `phase0-bcrypt-${Date.now()}@example.test`;
    const throwawayPassword = "phase0 throwaway pass";
    const hash = await laravelHash(throwawayPassword);
    const seeded = new Date();
    const throwaway = await db.user.create({
      data: {
        email,
        name: "phase0-bcrypt",
        password: hash,
        role: "user",
        // C1's requireEmailVerification blocks unverified sign-in — this test
        // is about the bcrypt verify hook, so the throwaway is pre-verified.
        emailVerified: true,
        createdAt: seeded,
        updatedAt: seeded,
      },
    });
    await db.account.create({
      data: {
        userId: throwaway.id,
        accountId: String(throwaway.id),
        providerId: "credential",
        password: hash,
        createdAt: seeded,
        updatedAt: seeded,
      },
    });
    const ok = await auth.api.signInEmail({ body: { email, password: throwawayPassword } });
    assert.equal(ok.user.email, email, "verify hook accepts a known $2y$ bcrypt hash");
    let wrongRejected = false;
    try {
      await auth.api.signInEmail({ body: { email, password: "not the password" } });
    } catch {
      wrongRejected = true;
    }
    assert.ok(wrongRejected, "verify hook rejects the wrong password for a $2y$ hash");
    await db.session.deleteMany({ where: { userId: throwaway.id } });
    await db.account.deleteMany({ where: { userId: throwaway.id } });
    await db.user.delete({ where: { id: throwaway.id } });
  }

  // ---- requireAdmin ---------------------------------------------------------
  const fakeSession = (role: string | null) =>
    ({ user: { role }, session: {} }) as unknown as AppSession;
  assert.ok(isAdmin(fakeSession("super-admin")) && isAdmin(fakeSession("admin")));
  assert.ok(!isAdmin(fakeSession("staff")) && !isAdmin(fakeSession("user")));
  assert.throws(
    () => requireAdmin(fakeSession("user")),
    (e: unknown) => e instanceof HttpError && e.status === 403,
  );
  assert.throws(
    () => requireAdmin(null),
    (e: unknown) => e instanceof HttpError && e.status === 401,
  );

  // ---- cache ---------------------------------------------------------------
  await cacheSet("phase0:key", { hello: "world" }, 60);
  assert.deepEqual(await cacheGet("phase0:key"), { hello: "world" });
  await cacheSet("phase0:expired", "x", -1);
  assert.equal(await cacheGet("phase0:expired"), null, "expired entries read as null");
  await cacheDelete("phase0:key");
  assert.equal(await cacheGet("phase0:key"), null);

  // ---- single-flight lock (R14): concurrent sections serialize -------------
  let inFlight = 0;
  let maxInFlight = 0;
  const section = () =>
    withLock("phase0:lock", 10, async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 150));
      inFlight--;
    });
  await Promise.all([section(), section(), section()]);
  assert.equal(maxInFlight, 1, "withLock serializes concurrent sections");

  // ---- rate limiter ---------------------------------------------------------
  const rlKey = `phase0:rl:${Date.now()}`;
  for (let i = 0; i < 3; i++) {
    assert.ok((await rateLimit(rlKey, 3, 60)).allowed, `attempt ${i + 1} allowed`);
  }
  const blocked = await rateLimit(rlKey, 3, 60);
  assert.ok(!blocked.allowed && blocked.retryAfterSeconds >= 1, "4th attempt blocked");

  // ---- login-limiter primitives (peek/hit/clear — Laravel semantics, R33) ---
  const loginKey = `phase0:login:${Date.now()}`;
  await rateLimitPeek(loginKey, 5, 60);
  assert.ok((await rateLimitPeek(loginKey, 5, 60)).allowed, "peek does not consume");
  for (let i = 0; i < 5; i++) await rateLimitHit(loginKey, 60);
  assert.ok(!(await rateLimitPeek(loginKey, 5, 60)).allowed, "5 failures lock the key");
  await rateLimitClear(loginKey);
  assert.ok((await rateLimitPeek(loginKey, 5, 60)).allowed, "clear resets on success");

  // ---- soft deletes (R13) ----------------------------------------------------
  const now = new Date();
  const vt = await db.vendorType.upsert({
    where: { name: "phase0-check" },
    update: {},
    create: { name: "phase0-check", createdAt: now, updatedAt: now },
  });
  const vendor = await db.vendor.upsert({
    where: { email: "phase0-vendor@example.test" },
    update: {},
    create: {
      name: "Phase0 Vendor",
      vendorTypeId: vt.id,
      email: "phase0-vendor@example.test",
      phoneNumber: "5551234567",
      countryCode: "+1",
      addressLine1: "1 Test St",
      city: "Boston",
      state: "MA",
      country: "US",
      postalCode: "02110",
      addedById: admin.id,
      createdAt: now,
      updatedAt: now,
    },
  });
  const comment = await db.vendorComment.create({
    data: {
      vendorId: vendor.id,
      title: "t",
      content: "c",
      createdAt: now,
      updatedAt: now,
    },
  });
  await db.vendorComment.delete({ where: { id: comment.id } });
  assert.equal(
    await db.vendorComment.findFirst({ where: { id: comment.id } }),
    null,
    "soft-deleted comment is invisible by default",
  );
  const trashed = await db.vendorComment.findFirst({
    where: { id: comment.id, deletedAt: { not: null } },
  });
  assert.ok(trashed?.deletedAt, "delete became a soft delete (row kept, deletedAt set)");
  await db.$executeRaw`DELETE FROM vendor_comments WHERE id = ${comment.id}`;

  // ---- SSN encryption at rest (R-PII) ---------------------------------------
  const ssn = "123-45-6789";
  const enc = encryptSsn(ssn);
  assert.equal(decryptSsn(enc), ssn, "encrypt/decrypt round-trips");
  assert.notEqual(enc, encryptSsn(ssn), "random IV — ciphertexts differ");
  assert.equal(hashSsn(ssn), hashSsn(ssn), "hash is deterministic (unique index)");
  await db.vendor.update({
    where: { id: vendor.id },
    data: { ssnNumber: enc, ssnNumberHash: hashSsn(ssn) },
  });
  const byHash = await db.vendor.findUniqueOrThrow({
    where: { ssnNumberHash: hashSsn(ssn) },
  });
  assert.equal(decryptSsn(byHash.ssnNumber!), ssn, "lookup by hash + decrypt works");
  await db.vendor.update({
    where: { id: vendor.id },
    data: { ssnNumber: null, ssnNumberHash: null },
  });

  // ---- 422 contract + decimal strings (R3) -----------------------------------
  const res = validationError({
    email: ["Please enter a valid email address."],
    name: ["Required."],
  });
  assert.equal(res.status, 422);
  const body = (await res.json()) as {
    message: string;
    errors: Record<string, string[]>;
  };
  assert.equal(body.message, "Please enter a valid email address. (and 1 more error)");
  assert.deepEqual(body.errors.email, ["Please enter a valid email address."]);
  assert.deepEqual(emptyStringsToNull({ a: "", b: ["", "x"], c: { d: "" } }), {
    a: null,
    b: [null, "x"],
    c: { d: null },
  });
  assert.equal(decimal2(new Prisma.Decimal("120.5")), "120.50");
  assert.equal(decimal2(null), null);

  console.log("\nphase0-check: ALL CHECKS PASSED");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
