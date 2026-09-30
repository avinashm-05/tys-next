import { db } from "@/lib/db";

/**
 * Admin activity log (2026-09-30): who did what in the admin panel, and
 * staff sign-in events. Never throws; a failed log line must not fail the
 * action it describes. `path` is the pathname only (no query string, which
 * can carry search terms or personal data).
 */
export async function audit(entry: {
  userId?: string | number | bigint | null;
  action: string;
  method?: string;
  path?: string;
  statusCode?: number;
  ip?: string | null;
  detail?: string;
}) {
  try {
    await db.adminAuditLog.create({
      data: {
        userId: entry.userId != null && entry.userId !== "" ? BigInt(entry.userId) : null,
        action: entry.action.slice(0, 100),
        method: entry.method?.slice(0, 10),
        path: entry.path?.slice(0, 255),
        statusCode: entry.statusCode,
        ip: entry.ip?.slice(0, 45) ?? null,
        detail: entry.detail?.slice(0, 500),
      },
    });
  } catch (err) {
    console.error("[audit] write failed", err instanceof Error ? err.message : err);
  }
}
