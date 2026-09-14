import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

// Every PK is MySQL BIGINT → JS BigInt, which JSON.stringify rejects. Ids fit
// well inside 2^53, so serialize as numbers — matches Laravel's JSON output.
(BigInt.prototype as unknown as { toJSON(): number }).toJSON = function () {
  return Number(this);
};

// Connects through a driver adapter (pure-JS mariadb driver, wire-compatible
// with MySQL) rather than Prisma's Rust query engine.
//
// WHY: on 2026-09-14 production started failing with
//   PrismaClientRustPanicError: PANIC: timer has gone away
// on essentially every query — session lookups, rate-limit reads, the lot. A
// Rust panic is not catchable from JavaScript, so each one took the entire
// Node process down with it (6 restarts inside 16 minutes in the Hostinger
// runtime logs) and surfaced to users as 503s and an admin panel that could
// never load. Nothing in the app changed; it is the engine's internal timer
// thread being starved on shared hosting, which no amount of application code
// can prevent. Removing the Rust engine removes the failure mode outright
// instead of making it rarer.
//
// Pool size comes from `connection_limit` in DATABASE_URL — keep it small,
// managed MySQL caps concurrent connections (ARCHITECTURE.md §4). The adapter
// takes its own pool config, so that value is parsed out of the URL here
// rather than being silently ignored.
function makeAdapter() {
  const url = process.env.DATABASE_URL ?? "";
  const u = new URL(url);

  // Build the driver's pool config explicitly rather than handing it the raw
  // URL: `connection_limit` is Prisma's own query parameter and means nothing
  // to the mariadb driver, so passing the URL through would silently drop the
  // pool cap. Managed MySQL caps concurrent connections, so that cap matters.
  return new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    connectionLimit: Number(u.searchParams.get("connection_limit")) || 5,
  });
}

const createClient = () => {
  const base = new PrismaClient({ adapter: makeAdapter() });

  // Soft deletes (R13): VendorContact/VendorComment queries auto-filter
  // deletedAt, and delete becomes an update — deleted rows 404 like Laravel.
  // Callers can opt back in by passing an explicit `deletedAt` in `where`.
  const filtered = ({
    args,
    query,
  }: {
    args: { where?: Record<string, unknown> };
    query: (args: object) => Promise<unknown>;
  }) => {
    args.where = { deletedAt: null, ...args.where };
    return query(args);
  };
  const softDeleteHooks = (model: "vendorContact" | "vendorComment") => ({
    findUnique: filtered,
    findUniqueOrThrow: filtered,
    findFirst: filtered,
    findFirstOrThrow: filtered,
    findMany: filtered,
    count: filtered,
    update: filtered,
    updateMany: filtered,
    // ponytail: hard delete is intentionally unreachable through the client;
    // use $executeRaw if a real purge is ever needed.
    delete: ({ args }: { args: { where: object } }) =>
      (base[model] as unknown as { update: (a: object) => Promise<unknown> }).update({
        where: args.where,
        data: { deletedAt: new Date() },
      }),
    deleteMany: ({ args }: { args: { where?: object } }) =>
      (
        base[model] as unknown as { updateMany: (a: object) => Promise<unknown> }
      ).updateMany({ where: args.where, data: { deletedAt: new Date() } }),
  });

  return base.$extends({
    query: {
      vendorContact: softDeleteHooks("vendorContact"),
      vendorComment: softDeleteHooks("vendorComment"),
    },
  });
};

type Db = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as { prisma?: Db };

export const db: Db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
