import crypto from "node:crypto";
import zipcodes from "zipcodes";
import tzLookup from "tz-lookup";
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

// Bare numeric postal code (US 5-digit, optional +4; also covers most other
// countries' all-digit formats). Deliberately narrow — anything with a
// street name, city, or comma falls through to the free-text path below.
const BARE_POSTAL_CODE = /^\d{4,10}(-\d{3,4})?$/;
const US_ZIP = /^\d{5}(-\d{4})?$/;

async function fetchNominatim(params: Record<string, string>): Promise<Coordinates | null> {
  const res = await fetch(`${BASE_URL}/search?${new URLSearchParams({ format: "json", limit: "1", ...params })}`, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const results = (await res.json()) as Array<{ lat?: string; lon?: string }>;
  const hit = results?.[0];
  if (!hit?.lat || !hit?.lon) return null;
  const coords = { latitude: Number(hit.lat), longitude: Number(hit.lon) };
  return Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude) ? coords : null;
}

/**
 * `countryCode`, when passed, biases the search to that country (Nominatim's
 * `countrycodes`) — needed for bare postal codes like "10001", which are
 * valid in more than one country and otherwise resolve to whichever one
 * Nominatim's free-text search happens to rank first (confirmed: unbiased,
 * that exact ZIP landed in Algeria, not New York). Left unset for vendor
 * onboarding, where the address's own country field already disambiguates
 * it — only the map's pincode search needs the hint.
 *
 * A bare US ZIP is looked up in the bundled `zipcodes` package first — a
 * static USPS-derived table, instant, no network call, and correct for
 * EVERY assigned ZIP (including PO-Box-only ones like Atlanta's 30301,
 * which OpenStreetMap simply has no boundary for at all — confirmed: its
 * structured Nominatim search came back empty, and free-text search, even
 * with a country hint, matched it to Minnesota). Nominatim is the fallback
 * for anything the static table doesn't cover — a non-US postal code, or a
 * ZIP few enough people have queried that it's genuinely missing.
 */
export async function geocodeAddress(
  address: string,
  countryCode?: string,
): Promise<Coordinates | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;
  const cc = countryCode?.trim().toLowerCase();

  const cacheKey = `geocode:${cc ?? "any"}:${crypto.createHash("md5").update(trimmed).digest("hex")}`;
  const cached = await cacheGet<Coordinates>(cacheKey);
  if (cached) return cached;

  if (US_ZIP.test(trimmed) && (!cc || cc === "us")) {
    const hit = zipcodes.lookup(trimmed.slice(0, 5));
    if (hit) {
      const coords = { latitude: hit.latitude, longitude: hit.longitude };
      await cacheSet(cacheKey, coords, CACHE_TTL_SECONDS);
      return coords;
    }
  }

  if (BARE_POSTAL_CODE.test(trimmed) && cc) {
    try {
      const coords = await fetchNominatim({ postalcode: trimmed, countrycodes: cc });
      if (coords) await cacheSet(cacheKey, coords, CACHE_TTL_SECONDS);
      return coords;
    } catch {
      return null;
    }
  }

  const deadline = Date.now() + OVERALL_BUDGET_MS;
  for (const [i, q] of strategies(trimmed).entries()) {
    if (Date.now() >= deadline) break;
    if (i > 0) await sleep(1_000); // Nominatim etiquette: max 1 req/s
    try {
      const coords = await fetchNominatim({ q, ...(cc ? { countrycodes: cc } : {}) });
      if (!coords) continue;
      await cacheSet(cacheKey, coords, CACHE_TTL_SECONDS);
      return coords;
    } catch {
      // timeout / network error — fall through to the next strategy
    }
  }
  return null;
}

/**
 * Postal code → city, for the Get Rates form's auto-fill (server-side so the
 * browser never needs a third-party fetch host added to the CSP). Same
 * Nominatim host/User-Agent/cache pattern as geocodeAddress, just a
 * structured search instead of a free-text one.
 */
export async function lookupCityByPostalCode(
  postalCode: string,
  countryCode: string,
): Promise<string | null> {
  const trimmedZip = postalCode.trim();
  const cc = countryCode.trim().toUpperCase();
  if (!trimmedZip || !cc) return null;

  const cacheKey = `ziplookup:${cc}:${trimmedZip.toLowerCase()}`;
  const cached = await cacheGet<string>(cacheKey);
  if (cached !== null) return cached;

  try {
    const params = new URLSearchParams({
      postalcode: trimmedZip,
      countrycodes: cc,
      format: "json",
      addressdetails: "1",
      limit: "1",
    });
    const res = await fetch(`${BASE_URL}/search?${params}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{
      address?: Record<string, string>;
    }>;
    const address = results?.[0]?.address;
    const city =
      address?.city ?? address?.town ?? address?.village ?? address?.county ?? null;
    if (!city) return null;
    await cacheSet(cacheKey, city, CACHE_TTL_SECONDS);
    return city;
  } catch {
    return null;
  }
}

export type ZipInfo = { city: string; state: string | null; timezone: string | null };

/**
 * Postal code → city, state (or region), and IANA timezone, for the quote
 * detail editor's From/To "what time is it there" glance. US takes the
 * instant static-table path (same one geocodeAddress prefers); every other
 * country goes through one Nominatim structured search — a single call
 * returns both the address breakdown AND coordinates, so timezone (via
 * tz-lookup, offline) comes from that same response instead of a second
 * network round-trip. 30-day cache, same as the rest of this module.
 */
export async function lookupZipInfo(
  postalCode: string,
  countryCode: string,
): Promise<ZipInfo | null> {
  const trimmedZip = postalCode.trim();
  const cc = countryCode.trim().toUpperCase();
  if (!trimmedZip || !cc) return null;

  if (cc === "US" && US_ZIP.test(trimmedZip)) {
    const hit = zipcodes.lookup(trimmedZip.slice(0, 5));
    if (!hit) return null;
    let timezone: string | null = null;
    try {
      timezone = tzLookup(hit.latitude, hit.longitude);
    } catch {
      timezone = null;
    }
    return { city: hit.city, state: hit.state, timezone };
  }

  const cacheKey = `zipinfo:${cc}:${trimmedZip.toLowerCase()}`;
  const cached = await cacheGet<ZipInfo>(cacheKey);
  if (cached !== null) return cached;

  try {
    const params = new URLSearchParams({
      postalcode: trimmedZip,
      countrycodes: cc,
      format: "json",
      addressdetails: "1",
      limit: "1",
    });
    const res = await fetch(`${BASE_URL}/search?${params}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      address?: Record<string, string>;
    }>;
    const hit = results?.[0];
    const address = hit?.address;
    const city = address?.city ?? address?.town ?? address?.village ?? address?.county ?? null;
    if (!city) return null;
    const state = address?.state ?? address?.region ?? null;
    let timezone: string | null = null;
    if (hit?.lat && hit?.lon) {
      try {
        timezone = tzLookup(Number(hit.lat), Number(hit.lon));
      } catch {
        timezone = null;
      }
    }
    const info: ZipInfo = { city, state, timezone };
    await cacheSet(cacheKey, info, CACHE_TTL_SECONDS);
    return info;
  } catch {
    return null;
  }
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
