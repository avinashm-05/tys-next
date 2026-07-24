import { db } from "@/lib/db";

// MySQL-backed fixed-window rate limiter (app_rate_limits) — replaces Redis
// (ARCHITECTURE §7). Per-route limits are listed in migration/02-routes.md,
// e.g. rateLimit(`quotes.store:${ip}`, 10, 60).
//
// ponytail: fixed window (Laravel throttle semantics), not sliding — matches
// the app being replaced; revisit only if abuse shows up at window edges.

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const currentWindow = (key: string, windowSeconds: number) => {
  const now = Date.now();
  const window = Math.floor(now / (windowSeconds * 1000));
  return {
    now,
    rowKey: `${key}:${window}`,
    expiresAt: new Date((window + 1) * windowSeconds * 1000),
  };
};

/** Count-and-check in one step — Laravel's `throttle:X,1` (every request counts). */
export async function rateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const { now, rowKey, expiresAt } = currentWindow(key, windowSeconds);

  // Atomic upsert-increment — no read-modify-write race across processes.
  await db.$executeRaw`INSERT INTO app_rate_limits (\`key\`, \`count\`, expires_at) VALUES (${rowKey}, 1, ${expiresAt}) ON DUPLICATE KEY UPDATE \`count\` = \`count\` + 1`;
  const row = await db.rateLimit.findUnique({ where: { key: rowKey } });
  const count = row?.count ?? 1;

  // Opportunistic cleanup of expired windows (no cron on managed hosting).
  if (Math.random() < 0.01) {
    await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
  }

  return {
    allowed: count <= max,
    remaining: Math.max(0, max - count),
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}

// Laravel-RateLimiter-style primitives for the login flow (R33): peek before
// the attempt, hit only on FAILED attempts, clear on success.

/** Read the current window without consuming an attempt. */
export async function rateLimitPeek(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const { now, rowKey, expiresAt } = currentWindow(key, windowSeconds);
  const row = await db.rateLimit.findUnique({ where: { key: rowKey } });
  const count = row?.count ?? 0;
  return {
    allowed: count < max,
    remaining: Math.max(0, max - count),
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}

/** Count one failed attempt (Laravel's RateLimiter::hit). */
export async function rateLimitHit(key: string, windowSeconds: number): Promise<void> {
  const { rowKey, expiresAt } = currentWindow(key, windowSeconds);
  await db.$executeRaw`INSERT INTO app_rate_limits (\`key\`, \`count\`, expires_at) VALUES (${rowKey}, 1, ${expiresAt}) ON DUPLICATE KEY UPDATE \`count\` = \`count\` + 1`;
}

/** Forget the key after a success (Laravel's RateLimiter::clear). */
export async function rateLimitClear(key: string): Promise<void> {
  await db.rateLimit.deleteMany({ where: { key: { startsWith: `${key}:` } } });
}
