/**
 * READ-ONLY diagnostic for "correct password but can't sign in".
 * Changes nothing — just reports the three things that block a login:
 *   1. does the user row exist at all
 *   2. is emailVerified true (auth.ts sets requireEmailVerification: true,
 *      so an unverified account is refused even with the right password)
 *   3. is the role actually admin/super-admin (a valid login still can't
 *      open /admin without it)
 * and whether the Better Auth credential row exists alongside the Laravel
 * users row — if the two are out of sync, the password check fails against
 * a row that looks fine in the database.
 *
 * Usage: npx tsx scripts/check-admin-user.ts <email>
 */
import "./env";
import { db } from "../src/lib/db";

const [email] = process.argv.slice(2);
if (!email) {
  console.error("Usage: npx tsx scripts/check-admin-user.ts <email>");
  process.exit(1);
}

async function main() {
  const user = await db.user.findUnique({
    where: { email },
    include: { userType: true, accounts: true },
  });

  if (!user) {
    console.log(`\n  ✗ No user row for ${email} — the account does not exist.`);
    console.log(`    Fix: npx tsx scripts/create-admin-user.ts ${email} '<password>' 'Your Name' super-admin\n`);
    return;
  }

  const credential = user.accounts.find((a) => a.providerId === "credential");
  const role = user.userType?.slug ?? "(none)";
  const isAdmin = role === "admin" || role === "super-admin";

  console.log(`\n  user id            : ${user.id}`);
  console.log(`  name               : ${user.name ?? "(none)"}`);
  console.log(`  role               : ${role} ${isAdmin ? "✓" : "✗  NOT an admin role — cannot open /admin"}`);
  console.log(`  emailVerified      : ${user.emailVerified ? "true ✓" : "FALSE ✗  <-- this alone blocks sign-in"}`);
  console.log(`  credential account : ${credential ? "present ✓" : "MISSING ✗  <-- no password row to check against"}`);
  console.log(`  password hash set  : ${credential?.password ? "yes ✓" : "NO ✗"}`);

  // Which algorithm wrote the stored hash. Never prints the hash itself —
  // only its format. bcrypt hashes start "$2a/$2b/$2y"; anything else came
  // from Better Auth's own scrypt (a web password reset writes scrypt, the
  // admin CLI scripts write bcrypt). auth.ts picks the verifier off this
  // prefix, so a mismatch between the two password columns is exactly the
  // kind of thing that makes a correct password look wrong.
  const fmt = (h?: string | null) =>
    !h ? "(empty)" : h.startsWith("$2") ? `bcrypt (${h.slice(0, 4)}…)` : `scrypt/other (${h.slice(0, 6)}…)`;
  console.log(`  accounts.password  : ${fmt(credential?.password)}`);
  console.log(`  users.password     : ${fmt(user.password)}`);
  const bothSet = !!credential?.password && !!user.password;
  const sameHash = bothSet && credential!.password === user.password;
  console.log(`  the two match      : ${!bothSet ? "n/a (one is empty)" : sameHash ? "yes ✓" : "NO ✗  <-- the two password columns disagree"}`);

  // How many credential rows exist. Better Auth verifies against ONE; a
  // duplicate left behind by a reset means it may be checking a stale row.
  const credentialRows = user.accounts.filter((a) => a.providerId === "credential").length;
  console.log(`  credential rows    : ${credentialRows}${credentialRows > 1 ? "  ✗ DUPLICATE — sign-in may check the wrong one" : ""}`);

  // Active sessions: if sign-in succeeds but /admin bounces back to /login,
  // sessions being created here proves the cookie is the problem, not auth.
  const sessions = await db.session.count({ where: { userId: user.id } });
  console.log(`  sessions on record : ${sessions}${sessions > 0 ? "  (logins ARE succeeding server-side)" : "  (no session ever created)"}`);

  const problems: string[] = [];
  if (!user.emailVerified) problems.push("emailVerified is false");
  if (!credential?.password) problems.push("no credential/password row");
  if (!isAdmin) problems.push(`role is "${role}", not admin/super-admin`);

  console.log(
    problems.length
      ? `\n  => Blocking issue(s): ${problems.join("; ")}\n`
      : `\n  => Account looks fine. If sign-in still fails the password itself is wrong:\n     npx tsx scripts/reset-admin-password.ts ${email} '<newPassword>'\n`,
  );
}

main()
  .catch((e) => {
    console.error("\n  Error:", e instanceof Error ? e.message : e, "\n");
    process.exit(1);
  })
  .finally(() => db.$disconnect());
