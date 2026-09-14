/**
 * Marks an admin account's email as verified.
 *
 * Why this exists: auth.ts sets requireEmailVerification: true, so an account
 * with emailVerified = false is refused at sign-in even when the password is
 * correct — and (before the 2026-09-14 fix) that refusal waited on an SMTP
 * send first, so it presented as "login hangs forever" rather than as any
 * kind of error. create-admin-user.ts sets emailVerified: true on creation,
 * so an admin that ISN'T verified was created some other way (self-signup,
 * an older migration, or the standalone script).
 *
 * Run check-admin-user.ts first to confirm that's actually the problem.
 *
 * Usage: npx tsx scripts/verify-admin-email.ts <email>
 */
import "./env";
import { db } from "../src/lib/db";

const [email] = process.argv.slice(2);
if (!email) {
  console.error("Usage: npx tsx scripts/verify-admin-email.ts <email>");
  process.exit(1);
}

async function main() {
  const user = await db.user.findUnique({
    where: { email },
    include: { userType: true },
  });
  if (!user) throw new Error(`No user with email ${email}.`);

  if (user.emailVerified) {
    console.log(`\n  ${email} is already verified — this is not what's blocking sign-in.`);
    console.log(`  Re-run scripts/check-admin-user.ts to see what else is off.\n`);
    return;
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: true, updatedAt: new Date() },
  });

  const role = user.userType?.slug ?? "(none)";
  console.log(`\n  ✓ ${email} marked verified.`);
  console.log(`    role: ${role}${role === "admin" || role === "super-admin" ? " ✓" : "  ✗ NOT an admin role — sign-in will work but /admin will not"}`);
  console.log(`\n  Try signing in again at https://tysgloballogistics.com/login\n`);
}

main()
  .catch((e) => {
    console.error("\n  Error:", e instanceof Error ? e.message : e, "\n");
    process.exit(1);
  })
  .finally(() => db.$disconnect());
