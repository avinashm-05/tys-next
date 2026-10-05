// The quote number customers and staff see (owner, 2026-10-05): the quote's
// id × 100, at least 6 digits, so quote 58 is #005800 and quote 68 is
// #006800. One format everywhere: admin, emails, PDF, WhatsApp, the portal
// and the thank-you page. The database id itself is unchanged.

export function quoteRef(id: number | bigint): string {
  return String(Number(id) * 100).padStart(6, "0");
}

/** "#005800", "005800" or a plain id like "58" → 58 (for search). */
export function parseQuoteRef(input: string): number | null {
  const digits = input.trim().replace(/^#/, "");
  if (!/^\d{1,12}$/.test(digits)) return null;
  const n = Number(digits);
  if (digits.length >= 6 && n % 100 === 0) return n / 100;
  return n > 0 ? n : null;
}
