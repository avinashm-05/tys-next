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

    // Keep connections WARM rather than opening them on demand.
    //
    // 2026-09-14, after the Rust-engine fix: queries started failing with
    //   pool timeout: failed to retrieve a connection from pool after 10000ms
    //   (pool connections: active=0 idle=0 limit=5)
    // active=0 AND idle=0 is the tell — the pool was not exhausted by busy
    // queries (that would read active=5), it simply could not OPEN one. The
    // shared MySQL host intermittently refuses new connections, and because
    // the pool only connected on demand, a request arriving inside one of
    // those windows had nothing to fall back on and died after 10s.
    //
    // minimumIdle holds connections open through those windows: they get
    // established while the database is healthy and survive the bad patches,
    // so a request during one reuses an existing connection instead of
    // racing to create a new one. Deliberately 2, not connectionLimit —
    // shared MySQL caps concurrent connections per user, and squatting on
    // the whole budget permanently would be antisocial and risks tripping
    // that cap itself.
    minimumIdle: 2,
    // Recycle before MySQL's own wait_timeout (commonly 300s here) would
    // drop them server-side and leave the pool holding dead handles.
    idleTimeout: 180,
    // Validate a connection that has been sitting more than 5s before
    // handing it out — cheap, and stops a server-side-closed connection
    // being given to a request that then fails for no visible reason.
    minDelayValidation: 5000,
    // MySQL 8+'s default `caching_sha2_password` auth needs the server's RSA
    // public key when the connection isn't TLS. Prisma's Rust engine fetched
    // it implicitly, so this never came up before the adapter switch; the JS
    // driver refuses unless told ("RSA public key is not available client
    // side", found 2026-09-16 — local dev against Homebrew MySQL failed on
    // every query with the same active=0 idle=0 pool-timeout signature the
    // production outage had, which is this error being retried into silence).
    // Hostinger's MySQL authenticates without needing it and ignores it.
    allowPublicKeyRetrieval: true,
    // NOT shortened. Cutting these to 4s to "fail fast" broke the production
    // build on 2026-09-14: `next build` runs generateStaticParams() in
    // blog/[slug], which queries the database from Hostinger's build
    // container, and that container needs longer than 4s to establish a
    // connection ("pool timeout ... after 4000ms" — build log). Failing fast
    // also bought the visitor nothing: an error at 4s and an error at 10s are
    // both an error, while the shorter limit turns a merely-slow connection
    // into a failed one. The driver's defaults are deliberately left alone.
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
