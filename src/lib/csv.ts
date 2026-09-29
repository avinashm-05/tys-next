/** RFC-4180 CSV: quote fields containing commas, quotes or newlines.
 *  Cells starting with = + - @ (or a tab/CR) get a leading apostrophe so
 *  Excel and Sheets show them as text instead of running them as formulas
 *  (CSV injection; security audit 2026-09-30). Customer-typed names, emails
 *  and notes all end up in these exports. */
export function csvEscape(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return (
    [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n") + "\r\n"
  );
}
