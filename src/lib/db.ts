import { PrismaClient } from "@prisma/client";

// Every PK is MySQL BIGINT → JS BigInt, which JSON.stringify rejects. Ids fit
// well inside 2^53, so serialize as numbers — matches Laravel's JSON output.
(BigInt.prototype as unknown as { toJSON(): number }).toJSON = function () {
  return Number(this);
};

// Pool size comes from `connection_limit` in DATABASE_URL — keep it small,
// managed MySQL caps concurrent connections (ARCHITECTURE.md §4).
const createClient = () => {
  const base = new PrismaClient();

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
