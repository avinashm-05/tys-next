import crypto from "node:crypto";
import { cacheGet, cacheSet } from "@/lib/cache";

/**
 * Port of Laravel's GeocodingService (03-logic): OpenStreetMap Nominatim —
 * free, no API key. Usage-policy compliance is mandatory: custom User-Agent
 * ("{APP_NAME} Vendor Management"), 1 request/second spacing, 30-day cache
 * (key geocode:md5(address)).
 *
 * Runs INLINE in vendor create/update (R9) and is fail-open by design: any
 * error/timeout returns null, the caller logs and saves without coordinates.
 * A hard overall budget keeps a slow geocoder from hanging the save.
 *
 * ponytail: Laravel's extra 3-retries-with-backoff ladder per strategy is
 * dropped (it could stall a save for minutes); the 4 fallback strategies and
 * cache remain. Upgrade path if coverage suffers: queue geocoding (R9).
 */

// Overridable for tests / a future paid-geocoder swap.
const BASE_URL = process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";
const USER_AGENT = `${process.env.APP_NAME ?? "TYS Global Logistics"} Vendor Management`;
const CACHE_TTL_SECONDS = 30 * 24 * 3600; // 30 days, like Laravel
const FETCH_TIMEOUT_MS = 4_000;
const OVERALL_BUDGET_MS = 9_000;

export type Coordinates = { latitude: number; longitude: number };

/** Laravel's 4 fallback strategies: full → drop 1st part (if >3) → last 4 → last 2. */
function strategies(address: string): string[] {
  const parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const candidates = [
    parts.join(", "),
    parts.length > 3 ? parts.slice(1).join(", ") : "",
    parts.slice(-4).join(", "),
    parts.slice(-2).join(", "),
  ];
  return [...new Set(candidates.filter(Boolean))];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const cacheKey = `geocode:${crypto.createHash("md5").update(trimmed).digest("hex")}`;
  const cached = await cacheGet<Coordinates>(cacheKey);
  if (cached) return cached;

  const deadline = Date.now() + OVERALL_BUDGET_MS;
  for (const [i, q] of strategies(trimmed).entries()) {
    if (Date.now() >= deadline) break;
    if (i > 0) await sleep(1_000); // Nominatim etiquette: max 1 req/s
    try {
      const params = new URLSearchParams({ q, format: "json", limit: "1" });
      const res = await fetch(`${BASE_URL}/search?${params}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) continue;
      const results = (await res.json()) as Array<{ lat?: string; lon?: string }>;
      const hit = results?.[0];
      if (!hit?.lat || !hit?.lon) continue;
      const coords = { latitude: Number(hit.lat), longitude: Number(hit.lon) };
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) continue;
      await cacheSet(cacheKey, coords, CACHE_TTL_SECONDS);
      return coords;
    } catch {
      // timeout / network error — fall through to the next strategy
    }
  }
  return null;
}

/** The 7 address fields the VendorObserver watches (Vendor.php full_address). */
export const ADDRESS_FIELDS = [
  "addressLine1",
  "addressLine2",
  "addressLine3",
  "city",
  "state",
  "country",
  "postalCode",
] as const;

type Addressable = Record<(typeof ADDRESS_FIELDS)[number], string | null>;

export function fullAddress(v: Addressable): string {
  return ADDRESS_FIELDS.map((f) => v[f])
    .filter(Boolean)
    .join(", ");
}
