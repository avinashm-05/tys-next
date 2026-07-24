/** RFC-4180 CSV: quote fields containing commas, quotes or newlines. */
export function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  return (
    [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n") + "\r\n"
  );
}
