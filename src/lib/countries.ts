// Port of App\Services\CountryListService code normalization, hardened for the
// domestic-US gate. Quotes store ISO alpha-2 codes (the wizard's country select
// posts `$code`), but we also fold the common full-name / long-code US and UK
// variants so a US quote can NEVER be misread as international.
const US_VARIANTS = new Set([
  "US",
  "USA",
  "U.S.",
  "U.S.A.",
  "UNITED STATES",
  "UNITED STATES OF AMERICA",
]);

export function normalizeCode(code: string | null | undefined): string {
  if (code == null) return "";
  const c = code.toUpperCase().trim();
  if (c === "") return "";
  if (US_VARIANTS.has(c)) return "US";
  switch (c) {
    case "UK":
    case "UNITED KINGDOM":
      return "GB";
    case "INDIA":
    case "IND":
      return "IN";
    default:
      return c; // ISO alpha-2 codes pass through (the stored format)
  }
}

export function isUnitedStates(code: string | null | undefined): boolean {
  return normalizeCode(code) === "US";
}
