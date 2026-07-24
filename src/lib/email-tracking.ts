import crypto from "node:crypto";
import { db } from "@/lib/db";

// Port of App\Services\EmailTrackingService.

/**
 * R23: 64 URL-safe chars. 48 random bytes → base64url is exactly 64 chars;
 * the slice is belt-and-braces against padding.
 */
export function generateTrackingToken(): string {
  return crypto.randomBytes(48).toString("base64url").slice(0, 64);
}

/**
 * R25: create the QuoteEmailStatistic row EXPLICITLY before send (not as a
 * render side effect). Reuses the existing row/token when present.
 */
export async function ensureTrackingToken(quoteId: bigint): Promise<string> {
  const existing = await db.quoteEmailStatistic.findUnique({
    where: { quoteId },
    select: { trackingToken: true },
  });
  if (existing) return existing.trackingToken;

  const now = new Date();
  const token = generateTrackingToken();
  await db.quoteEmailStatistic.create({
    data: { quoteId, trackingToken: token, openCount: 0, createdAt: now, updatedAt: now },
  });
  return token;
}

/** Full tracking URL — built from the APEX APP_URL (baked into sent emails). */
export function trackingUrl(token: string): string {
  return `${(process.env.APP_URL ?? "").replace(/\/+$/, "")}/email/track/${token}`;
}

/**
 * Port of QuoteEmailStatistic::markAsOpened — preserve the first
 * emailOpenedAt, always bump lastOpenedAt + openCount. No-op on unknown token.
 */
export async function recordEmailOpen(token: string): Promise<void> {
  const stat = await db.quoteEmailStatistic.findUnique({ where: { trackingToken: token } });
  if (!stat) return;
  const now = new Date();
  await db.quoteEmailStatistic.update({
    where: { id: stat.id },
    data: {
      emailOpenedAt: stat.emailOpenedAt ?? now,
      lastOpenedAt: now,
      openCount: (stat.openCount ?? 0) + 1,
      updatedAt: now,
    },
  });
}
