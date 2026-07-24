import { db } from "@/lib/db";

// Laravel's Setting::get/set over the key/value `settings` table.
// DOMESTIC (US↔US) markup keeps the original Laravel key; INTERNATIONAL is a
// new key added in A4.2 (applied to staff-entered retail on non-US quotes in
// A4.3 — stored now, not yet wired into rating).
export const FEDEX_MARKUP_KEY = "fedex_markup_percentage";
export const FEDEX_MARKUP_INTL_KEY = "fedex_markup_percentage_international";

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const now = new Date();
  await db.setting.upsert({
    where: { key },
    update: { value, updatedAt: now },
    create: { key, value, createdAt: now, updatedAt: now },
  });
}

/** Markup defaults to 0 when unset or unreadable — fail-open, R22. */
export async function getFedexMarkupPercentage(): Promise<number> {
  const value = Number((await getSetting(FEDEX_MARKUP_KEY)) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

/** International markup (US↔non-US). Fail-open 0. Applied in A4.3. */
export async function getFedexMarkupInternationalPercentage(): Promise<number> {
  const value = Number((await getSetting(FEDEX_MARKUP_INTL_KEY)) ?? 0);
  return Number.isFinite(value) ? value : 0;
}
