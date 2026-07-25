// Plain-CommonJS twin of create-admin-user.ts, for use against a
// `.next/standalone` build (no tsx/dev tooling there — see next.config.ts's
// `output: "standalone"`). Copy this file into the standalone folder
// alongside server.js before running it; it uses only packages already
// present in that folder's own node_modules (@prisma/client, bcryptjs,
// @next/env).
//
// Usage: node create-admin-standalone.js <email> <password> <name> [admin|super-admin]

require("@next/env").loadEnvConfig(__dirname);
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const [email, password, name, role = "admin"] = process.argv.slice(2);

if (!email || !password || !name || !["admin", "super-admin"].includes(role)) {
  console.error("Usage: node create-admin-standalone.js <email> <password> <name> [admin|super-admin]");
  process.exit(1);
}

const db = new PrismaClient();

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
