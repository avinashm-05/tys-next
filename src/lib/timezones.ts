// Curated, named-zone timezone list for the "best time to call back" picker
// — deliberately NOT the full ~400-entry IANA catalog. Staff read this value
// straight off the quote (see quote.timezone), so "Central Standard Time
// (UTC-6)" is what actually gets stored, not an opaque IANA id like
// "America/Chicago" they'd have to decode. Offsets are fixed at each zone's
// standard (winter, non-DST) offset on purpose — a stable label beats one
// that silently flips between "...Standard Time" and "...Daylight Time"
// depending on when the customer happens to submit the form.

export type TimezoneOption = { value: string; label: string; keywords: string; offsetMinutes: number };

const NAMED_ZONES = [
  { name: "Hawaii-Aleutian Standard Time", offsetMinutes: -600, abbr: "HST" },
  { name: "Alaska Standard Time", offsetMinutes: -540, abbr: "AKST" },
  { name: "Pacific Standard Time", offsetMinutes: -480, abbr: "PST PDT" },
  { name: "Mountain Standard Time", offsetMinutes: -420, abbr: "MST MDT" },
  { name: "Central Standard Time", offsetMinutes: -360, abbr: "CST CDT" },
  { name: "Eastern Standard Time", offsetMinutes: -300, abbr: "EST EDT" },
  { name: "Atlantic Standard Time", offsetMinutes: -240, abbr: "AST ADT" },
  { name: "Brasília Time", offsetMinutes: -180, abbr: "BRT" },
  { name: "Greenwich Mean Time", offsetMinutes: 0, abbr: "GMT UTC" },
  { name: "Central European Time", offsetMinutes: 60, abbr: "CET CEST" },
  { name: "Eastern European Time", offsetMinutes: 120, abbr: "EET EEST" },
  { name: "Moscow Standard Time", offsetMinutes: 180, abbr: "MSK" },
  { name: "Gulf Standard Time", offsetMinutes: 240, abbr: "GST" },
  { name: "Pakistan Standard Time", offsetMinutes: 300, abbr: "PKT" },
  { name: "India Standard Time", offsetMinutes: 330, abbr: "IST" },
  { name: "Bangladesh Standard Time", offsetMinutes: 360, abbr: "BST" },
  { name: "Indochina Time", offsetMinutes: 420, abbr: "ICT" },
  { name: "China Standard Time", offsetMinutes: 480, abbr: "CST" },
  { name: "Japan Standard Time", offsetMinutes: 540, abbr: "JST" },
  { name: "Australian Eastern Standard Time", offsetMinutes: 600, abbr: "AEST AEDT" },
  { name: "New Zealand Standard Time", offsetMinutes: 720, abbr: "NZST NZDT" },
] as const;

// Common IANA zones mapped straight to a named entry above, used only to
// preselect the picker for the visitor's own zone (detectTimezone() below
// still reads the browser's real IANA zone — this just translates it into
// one of our curated names rather than exposing the raw "America/Chicago").
const IANA_TO_NAMED_ZONE: Record<string, string> = {
  "Pacific/Honolulu": "Hawaii-Aleutian Standard Time",
  "America/Anchorage": "Alaska Standard Time",
  "America/Los_Angeles": "Pacific Standard Time",
  "America/Vancouver": "Pacific Standard Time",
  "America/Tijuana": "Pacific Standard Time",
  "America/Denver": "Mountain Standard Time",
  "America/Phoenix": "Mountain Standard Time",
  "America/Edmonton": "Mountain Standard Time",
  "America/Chicago": "Central Standard Time",
  "America/Mexico_City": "Central Standard Time",
  "America/Winnipeg": "Central Standard Time",
  "America/New_York": "Eastern Standard Time",
  "America/Detroit": "Eastern Standard Time",
  "America/Toronto": "Eastern Standard Time",
  "America/Halifax": "Atlantic Standard Time",
  "America/Sao_Paulo": "Brasília Time",
  "Europe/London": "Greenwich Mean Time",
  "Europe/Dublin": "Greenwich Mean Time",
  "Europe/Lisbon": "Greenwich Mean Time",
  "Europe/Berlin": "Central European Time",
  "Europe/Paris": "Central European Time",
  "Europe/Madrid": "Central European Time",
  "Europe/Rome": "Central European Time",
  "Europe/Athens": "Eastern European Time",
  "Europe/Helsinki": "Eastern European Time",
  "Europe/Moscow": "Moscow Standard Time",
  "Asia/Dubai": "Gulf Standard Time",
  "Asia/Karachi": "Pakistan Standard Time",
  "Asia/Kolkata": "India Standard Time",
  "Asia/Calcutta": "India Standard Time",
  "Asia/Dhaka": "Bangladesh Standard Time",
  "Asia/Bangkok": "Indochina Time",
  "Asia/Jakarta": "Indochina Time",
  "Asia/Shanghai": "China Standard Time",
  "Asia/Hong_Kong": "China Standard Time",
  "Asia/Singapore": "China Standard Time",
  "Asia/Tokyo": "Japan Standard Time",
  "Asia/Seoul": "Japan Standard Time",
  "Australia/Sydney": "Australian Eastern Standard Time",
  "Australia/Melbourne": "Australian Eastern Standard Time",
  "Australia/Brisbane": "Australian Eastern Standard Time",
  "Pacific/Auckland": "New Zealand Standard Time",
};

// ISO 3166-1 alpha-2 → a representative named zone, for defaulting the
// picker off the "Sending From" country (see quote-request-form.tsx) rather
// than the visitor's own browser zone — the two aren't the same thing when
// staff/agents submit on a customer's behalf, or the customer is just
// browsing from somewhere other than where the shipment originates. Covers
// the countries realistically selected as a shipment origin; anything not
// listed here falls back to detectTimezone() instead of guessing wrong.
// Multi-zone countries (US, CA, RU, AU, BR, ...) use their most common/
// capital-region zone — a customer can always correct it themselves.
const COUNTRY_TO_NAMED_ZONE: Record<string, string> = {
  US: "Eastern Standard Time",
  CA: "Eastern Standard Time",
  MX: "Central Standard Time",
  GT: "Central Standard Time",
  BZ: "Central Standard Time",
  SV: "Central Standard Time",
  HN: "Central Standard Time",
  NI: "Central Standard Time",
  CR: "Central Standard Time",
  PA: "Eastern Standard Time",
  CU: "Eastern Standard Time",
  JM: "Eastern Standard Time",
  HT: "Eastern Standard Time",
  BS: "Eastern Standard Time",
  DO: "Atlantic Standard Time",
  PR: "Atlantic Standard Time",
  TT: "Atlantic Standard Time",
  BB: "Atlantic Standard Time",
  BR: "Brasília Time",
  AR: "Brasília Time",
  UY: "Brasília Time",
  PY: "Brasília Time",
  CL: "Atlantic Standard Time",
  CO: "Eastern Standard Time",
  PE: "Eastern Standard Time",
  EC: "Eastern Standard Time",
  VE: "Atlantic Standard Time",
  BO: "Atlantic Standard Time",
  GY: "Atlantic Standard Time",

  GB: "Greenwich Mean Time",
  IE: "Greenwich Mean Time",
  PT: "Greenwich Mean Time",
  IS: "Greenwich Mean Time",
  MA: "Greenwich Mean Time",
  SN: "Greenwich Mean Time",
  CI: "Greenwich Mean Time",
  ML: "Greenwich Mean Time",
  BF: "Greenwich Mean Time",
  GH: "Greenwich Mean Time",

  FR: "Central European Time",
  DE: "Central European Time",
  ES: "Central European Time",
  IT: "Central European Time",
  NL: "Central European Time",
  BE: "Central European Time",
  CH: "Central European Time",
  AT: "Central European Time",
  PL: "Central European Time",
  CZ: "Central European Time",
  SK: "Central European Time",
  HU: "Central European Time",
  SE: "Central European Time",
  NO: "Central European Time",
  DK: "Central European Time",
  HR: "Central European Time",
  SI: "Central European Time",
  RS: "Central European Time",
  BA: "Central European Time",
  AL: "Central European Time",
  MK: "Central European Time",
  ME: "Central European Time",
  LU: "Central European Time",
  MT: "Central European Time",
  DZ: "Central European Time",
  TN: "Central European Time",
  NG: "Central European Time",
  CM: "Central European Time",
  AO: "Central European Time",
  CD: "Central European Time",
  NE: "Central European Time",
  TD: "Central European Time",

  GR: "Eastern European Time",
  RO: "Eastern European Time",
  BG: "Eastern European Time",
  FI: "Eastern European Time",
  EE: "Eastern European Time",
  LV: "Eastern European Time",
  LT: "Eastern European Time",
  UA: "Eastern European Time",
  MD: "Eastern European Time",
  CY: "Eastern European Time",
  IL: "Eastern European Time",
  EG: "Eastern European Time",
  LY: "Eastern European Time",
  SD: "Eastern European Time",
  ZA: "Eastern European Time",
  ZW: "Eastern European Time",
  ZM: "Eastern European Time",
  MZ: "Eastern European Time",

  RU: "Moscow Standard Time",
  TR: "Moscow Standard Time",
  IQ: "Moscow Standard Time",
  SA: "Moscow Standard Time",
  QA: "Moscow Standard Time",
  KW: "Moscow Standard Time",
  BH: "Moscow Standard Time",
  KE: "Moscow Standard Time",
  ET: "Moscow Standard Time",
  TZ: "Moscow Standard Time",
  UG: "Moscow Standard Time",

  AE: "Gulf Standard Time",
  OM: "Gulf Standard Time",
  AZ: "Gulf Standard Time",
  AM: "Gulf Standard Time",
  GE: "Gulf Standard Time",

  PK: "Pakistan Standard Time",
  UZ: "Pakistan Standard Time",
  TM: "Pakistan Standard Time",
  MV: "Pakistan Standard Time",

  IN: "India Standard Time",
  LK: "India Standard Time",
  NP: "India Standard Time",

  BD: "Bangladesh Standard Time",
  BT: "Bangladesh Standard Time",
  KG: "Bangladesh Standard Time",
  KZ: "Bangladesh Standard Time",

  TH: "Indochina Time",
  VN: "Indochina Time",
  ID: "Indochina Time",
  KH: "Indochina Time",
  LA: "Indochina Time",
  MM: "Indochina Time",

  CN: "China Standard Time",
  HK: "China Standard Time",
  TW: "China Standard Time",
  SG: "China Standard Time",
  MY: "China Standard Time",
  PH: "China Standard Time",
  BN: "China Standard Time",
  MN: "China Standard Time",

  JP: "Japan Standard Time",
  KR: "Japan Standard Time",

  AU: "Australian Eastern Standard Time",
  PG: "Australian Eastern Standard Time",
  GU: "Australian Eastern Standard Time",

  NZ: "New Zealand Standard Time",
  FJ: "New Zealand Standard Time",
};

/** A representative named zone for a "Sending From" ISO country code, if known. */
export function timezoneForCountry(iso: string | undefined | null): string | undefined {
  return iso ? COUNTRY_TO_NAMED_ZONE[iso.toUpperCase()] : undefined;
}

function formatUtcOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${m.toString().padStart(2, "0")}`;
}

/** The curated list, sorted west→east by standard UTC offset. */
export function getTimezoneOptions(): TimezoneOption[] {
  return NAMED_ZONES.map((z) => ({
    value: z.name,
    label: `${z.name} (${formatUtcOffset(z.offsetMinutes)})`,
    keywords: z.abbr,
    offsetMinutes: z.offsetMinutes,
  })).sort((a, b) => a.offsetMinutes - b.offsetMinutes);
}

function offsetMinutesFor(tz: string, date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  return Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
}

/**
 * The visitor's own zone translated into one of the curated named zones
 * above, used to preselect the picker. Known IANA zones map directly;
 * anything else falls back to the nearest curated zone by its January
 * (standard-time) UTC offset — close enough for a sensible default, and the
 * customer can always pick a different one themselves.
 */
export function detectTimezone(): string {
  let iana = "UTC";
  try {
    iana = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "Greenwich Mean Time";
  }
  if (IANA_TO_NAMED_ZONE[iana]) return IANA_TO_NAMED_ZONE[iana];

  const winterRef = new Date(Date.UTC(new Date().getFullYear(), 0, 15, 12));
  const standardOffset = offsetMinutesFor(iana, winterRef);
  const nearest = [...NAMED_ZONES].sort(
    (a, b) => Math.abs(a.offsetMinutes - standardOffset) - Math.abs(b.offsetMinutes - standardOffset),
  )[0];
  return nearest?.name ?? "Greenwich Mean Time";
}
