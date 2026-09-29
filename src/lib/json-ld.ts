// JSON for <script type="application/ld+json">. JSON.stringify doesn't escape
// "<", so text an admin types (a blog title, an FAQ answer) containing
// "</script>" could close the tag and inject script into public pages
// (security audit 2026-09-30). Escaping "<" (and the two JS line separators)
// keeps the JSON identical to parsers while making break-out impossible.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replaceAll(LS, "\\u2028")
    .replaceAll(PS, "\\u2029");
}
