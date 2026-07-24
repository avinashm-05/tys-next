// Quote package_type is a CSV of single types (R1), e.g. "box,television".
// Display maps each member to a Title-case label; aliases fold to the
// canonical label (envelop→Envelope, tv→Television, boxes→Box) — matches the
// wizard's store-time normalization (03-logic).
const LABELS: Record<string, string> = {
  box: "Box",
  boxes: "Box",
  television: "Television",
  tv: "Television",
  auto: "Auto",
  envelope: "Envelope",
  envelop: "Envelope",
  furniture: "Furniture",
};

function label(type: string): string {
  const t = type.trim().toLowerCase();
  return LABELS[t] ?? (t ? t[0].toUpperCase() + t.slice(1) : t);
}

/** "box,television" → "Box, Television". */
export function formatPackageTypes(csv: string | null | undefined): string {
  if (!csv) return "—";
  return csv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map(label)
    .join(", ");
}

/** Selectable filter values in the admin list (canonical types). */
export const PACKAGE_TYPE_OPTIONS = [
  "box",
  "television",
  "auto",
  "envelope",
  "furniture",
] as const;
