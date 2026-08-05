/**
 * Resets the password for an existing admin/super-admin user — companion to
 * create-admin-user.ts, for when the original password is lost (bcrypt is
 * one-way, so it can't be recovered, only replaced). Updates both the
 * Laravel-compatible users row and the Better Auth credential account row,
 * same as create-admin-user.ts does on creation.
 *
 * Usage: npx tsx scripts/reset-admin-password.ts <email> <newPassword>
 */
import "./env";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: npx tsx scripts/reset-admin-password.ts <email> <newPassword>");
  process.exit(1);
}

async function main() {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No user with email ${email}.`);

  const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS ?? 12));
  const now = new Date();

  await db.user.update({ where: { id: user.id }, data: { password: hash, updatedAt: now } });
  await db.account.updateMany({
    where: { userId: user.id, providerId: "credential" },
    data: { password: hash, updatedAt: now },
  });

  console.log(`Password reset for user #${user.id} (${email}).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
