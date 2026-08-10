/**
 * Gives every pre-existing user a handle.
 *
 * New signups get one in the user.create hook (src/lib/auth.ts), but every
 * row that predates the username columns has NULL — and a NULL username can't
 * sign in by handle. Safe to re-run: rows that already have one are skipped,
 * so this can be run again after a restore or a later import.
 *
 * Usage: npx tsx scripts/backfill-usernames.ts
 */
import "./env";
import { db } from "../src/lib/db";
import { generateUniqueUsername } from "../src/lib/username";

async function main() {
  const pending = await db.user.findMany({
    where: { username: null },
    select: { id: true, name: true, email: true },
    orderBy: { id: "asc" },
  });

  if (pending.length === 0) {
    console.log("backfill-usernames: nothing to do — every user already has one.");
    return;
  }

  console.log(`backfill-usernames: ${pending.length} user(s) without a handle`);

  for (const user of pending) {
    // Sequential on purpose: generateUniqueUsername checks the table for
    // collisions, so running these in parallel would let two users in the
    // same batch pick the same handle and one of them would hit the unique
    // index instead of getting a suffix.
    const handle = await generateUniqueUsername(user.name, user.email);
    await db.user.update({
      where: { id: user.id },
      data: { username: handle, displayUsername: handle },
    });
    console.log(`  #${user.id} ${user.email} -> ${handle}`);
  }

  console.log("backfill-usernames: done");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
