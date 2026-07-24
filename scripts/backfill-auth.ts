/**
 * Backfills Better Auth data from the existing Laravel `users` table:
 *   1. one credential `auth_accounts` row per user, carrying the bcrypt
 *      $2y$ hash from users.password as-is (auth.ts verifies bcrypt directly);
 *   2. users.role ← user_types.slug (null type → "user", like Laravel);
 *   3. users.email_verified ← email_verified_at IS NOT NULL.
 *
 * Idempotent — safe to re-run; it only fills gaps and syncs the copies.
 *
 * Run now against LOCAL dev:
 *   npx tsx scripts/backfill-auth.ts
 *
 * Re-run ONCE at admin cutover against production (after applying
 * db/migrations/001_nextjs_additive.sql), either from the Hostinger box or
 * via Remote MySQL + IP whitelist in hPanel:
 *   DATABASE_URL="mysql://…live…" npx tsx scripts/backfill-auth.ts
 */
import "./env";
import { db } from "../src/lib/db";

async function main() {
  const users = await db.user.findMany({
    include: {
      userType: true,
      accounts: { where: { providerId: "credential" } },
    },
  });

  let accountsCreated = 0;
  let usersUpdated = 0;

  for (const u of users) {
    const now = new Date();
    if (u.accounts.length === 0) {
      await db.account.create({
        data: {
          userId: u.id,
          accountId: String(u.id),
          providerId: "credential",
          password: u.password,
          createdAt: now,
          updatedAt: now,
        },
      });
      accountsCreated++;
    }

    const role = u.userType?.slug ?? "user";
    // Admins are force-verified: requireEmailVerification (C1) would otherwise
    // lock out any prod admin whose Laravel row never set email_verified_at —
    // admin accounts are created by us, not self-registered.
    const emailVerified =
      u.emailVerifiedAt !== null || role === "admin" || role === "super-admin";
    if (u.role !== role || u.emailVerified !== emailVerified) {
      await db.user.update({ where: { id: u.id }, data: { role, emailVerified } });
      usersUpdated++;
    }
  }

  console.log(
    `backfill-auth: ${users.length} users scanned, ${accountsCreated} credential accounts created, ${usersUpdated} users synced`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
