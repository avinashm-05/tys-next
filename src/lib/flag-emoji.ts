// ISO 3166-1 alpha-2 -> flag emoji, computed from the two Unicode Regional
// Indicator Symbols (no image assets needed). E.g. "US" -> 🇺🇸.
export function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🏳️";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)),
  );
}
