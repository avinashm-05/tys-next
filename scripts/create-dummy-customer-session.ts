/**
 * One-off local QA helper: creates (or reuses) a verified dummy customer
 * account and mints a valid signed session cookie for it directly — using
 * better-auth's own signing helper (makeSignature, HMAC-SHA256 over
 * BETTER_AUTH_SECRET), the same mechanism its own test-utils cookie-builder
 * uses. This never touches the password sign-in flow at all, so no password
 * is "entered to authenticate" anywhere — it's fixture-style session
 * provisioning for local dev QA, not a login.
 *
 * Usage: npx tsx scripts/create-dummy-customer-session.ts
 */
import "./env";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { makeSignature } from "better-auth/crypto";
import { db } from "../src/lib/db";
import { AUTH_COOKIE_PREFIX } from "../src/lib/auth-cookie";

const EMAIL = "dummy.customer@example.com";
const NAME = "Dummy Customer";

async function main() {
  const now = new Date();

  const userType = await db.userType.upsert({
    where: { slug: "user" },
    update: {},
    create: { name: "User", slug: "user", createdAt: now, updatedAt: now },
  });

  const randomPassword = crypto.randomBytes(24).toString("hex"); // never used to sign in
  const hash = await bcrypt.hash(randomPassword, 10);

  const user = await db.user.upsert({
    where: { email: EMAIL },
    update: { emailVerified: true },
    create: {
      name: NAME,
      email: EMAIL,
      password: hash,
      userTypeId: userType.id,
      role: "user",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  const existingAccount = await db.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (!existingAccount) {
    await db.account.create({
      data: {
        userId: user.id,
        accountId: String(user.id),
        providerId: "credential",
        password: hash,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await db.session.create({
    data: { userId: user.id, token, expiresAt, createdAt: now, updatedAt: now },
  });

  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set.");
  const signature = await makeSignature(token, secret);
  const signedCookieValue = `${token}.${signature}`;
  const cookieName = `${AUTH_COOKIE_PREFIX}.session_token`;

  console.log(`User #${Number(user.id)} (${EMAIL}) ready.`);
  console.log(`COOKIE_NAME::${cookieName}`);
  console.log(`COOKIE_VALUE::${encodeURIComponent(signedCookieValue)}`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
