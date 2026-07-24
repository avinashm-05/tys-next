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
