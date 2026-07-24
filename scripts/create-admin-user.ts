/**
 * Creates an admin user — replaces `php artisan app:create-admin-user`.
 * Writes the Laravel-compatible users row (user_type_id + bcrypt password,
 * so Laravel can still authenticate it during the overlap) AND the Better
 * Auth credential account row.
 *
 * Usage: npx tsx scripts/create-admin-user.ts <email> <password> <name> [admin|super-admin]
 */
import "./env";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

const [email, password, name, role = "admin"] = process.argv.slice(2);

if (!email || !password || !name || !["admin", "super-admin"].includes(role)) {
  console.error(
    "Usage: npx tsx scripts/create-admin-user.ts <email> <password> <name> [admin|super-admin]",
  );
  process.exit(1);
}

async function main() {
  if (await db.user.findUnique({ where: { email } })) {
    throw new Error(`A user with email ${email} already exists.`);
  }

  const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS ?? 12));
  const now = new Date();

  const userType = await db.userType.upsert({
    where: { slug: role },
    update: {},
    create: {
      name: role === "super-admin" ? "Super Admin" : "Admin",
      slug: role,
      createdAt: now,
      updatedAt: now,
    },
  });

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hash,
      userTypeId: userType.id,
      role,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

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

  console.log(`Created ${role} user #${user.id} (${email})`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
