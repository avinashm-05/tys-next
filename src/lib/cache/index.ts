import { db } from "@/lib/db";

// MySQL-backed cache (app_cache table) — replaces Redis on managed hosting
// (ARCHITECTURE §7). Values are JSON. Will hold the FedEx OAuth token,
// geocode results, and the country list in later phases.

export async function cacheGet<T>(key: string): Promise<T | null> {
  const row = await db.cacheEntry.findUnique({ where: { key } });
  if (!row) return null;
  if (row.expiresAt <= new Date()) {
    await db.cacheEntry.deleteMany({ where: { key } }); // deleteMany: no throw if a racer got there first
    return null;
  }
  return JSON.parse(row.value) as T;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  const payload = {
    value: JSON.stringify(value),
    expiresAt: new Date(Date.now() + ttlSeconds * 1000),
  };
  await db.cacheEntry.upsert({
    where: { key },
    create: { key, ...payload },
    update: payload,
  });
}

export async function cacheDelete(key: string): Promise<void> {
  await db.cacheEntry.deleteMany({ where: { key } });
}

/** get-or-compute with TTL — the shape the FedEx token / country list will use. */
export async function cacheRemember<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const value = await compute();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

/**
 * Single-flight lock (R14): serializes concurrent sections via a lock row +
 * SELECT ... FOR UPDATE. Concurrent callers block until the holder commits,
 * then run in turn — so use the double-check pattern inside `fn`:
 *
 *   const hit = await cacheGet(key); if (hit) return hit;
 *   return withLock(`lock:${key}`, 30, async () => {
 *     const again = await cacheGet(key); if (again) return again;
 *     const fresh = await fetchIt(); await cacheSet(key, fresh, ttl); return fresh;
 *   });
 *
 * The row lock is transaction-scoped — released on commit/rollback/connection
 * death, so no stale-lock cleanup is needed (locked_until is observability only).
 * ponytail: fn runs inside an open transaction and holds one pooled connection
 * for its duration — fine for a FedEx token refresh, not for long sections.
 */
export async function withLock<T>(
  key: string,
  timeoutSeconds: number,
  fn: () => Promise<T>,
): Promise<T> {
  const until = new Date(Date.now() + timeoutSeconds * 1000);
  // Ensure the lock row exists in autocommit BEFORE the transaction —
  // concurrent inserts inside the transaction deadlock on MySQL gap locks.
  await db.$executeRaw`INSERT IGNORE INTO app_cache_locks (\`key\`, locked_until) VALUES (${key}, ${until})`;

  const run = () =>
    db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT \`key\` FROM app_cache_locks WHERE \`key\` = ${key} FOR UPDATE`;
        return fn();
      },
      { timeout: timeoutSeconds * 1000 },
    );

  try {
    return await run();
  } catch (e) {
    // MySQL picked us as a deadlock victim (1213) — the other holder rolled
    // us back cleanly, so one retry is safe.
    if (e instanceof Error && e.message.includes("1213")) return run();
    throw e;
  }
}
