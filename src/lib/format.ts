/**
 * Laravel's admin-list timestamp format `M d, Y H:i` in UTC (R17) —
 * e.g. "Jul 13, 2026 18:45". Timezone drift would silently change what
 * admins see vs. the old app, so UTC is explicit.
 */
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

// Accepts an ISO string (list APIs serialize dates to strings) or a Date
// (server components that call serializers on raw Prisma rows).
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${dateFmt.format(d)} ${timeFmt.format(d)}`;
}

/** Laravel's CSV-export timestamp format `Y-m-d H:i:s` in UTC (R17). */
export function formatCsvDateTime(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 19).replace("T", " ");
}

// Intl's own "short" timeZoneName is inconsistent for zones without a
// universally-recognized English abbreviation — Asia/Kolkata resolves to
// "GMT+5:30" rather than "IST" in most engines' CLDR data, even though IST
// is what everyone actually calls it. Only the zones worth special-casing
// go here; everything else (US zones, UTC, etc.) already gets a sensible
// native abbreviation (EST/PST/etc.) straight from Intl.
const TZ_ABBREVIATIONS: Record<string, string> = {
  "Asia/Kolkata": "IST",
  "Asia/Calcutta": "IST", // legacy IANA alias for the same zone
};

/**
 * Same timestamp, in whichever timezone the CALLER'S machine is actually
 * set to (only meaningful client-side — the browser's system clock, not the
 * server's), with a short zone abbreviation appended so "2:06 PM" doesn't
 * quietly mean something different to a teammate in another region. Use via
 * the <LocalDateTime> component, not directly, so the SSR/CSR mismatch is
 * handled in one place.
 */
export function formatLocalDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";

  const tz = TZ_ABBREVIATIONS[zone] ?? get("timeZoneName");
  return `${get("month")} ${get("day")}, ${get("year")} ${get("hour")}:${get("minute")} ${get("dayPeriod")} ${tz}`;
}
