/**
 * Log-safe email (privacy audit 2026-09-30): server logs are read by more
 * people and tools than the database, so they get "pr***@gmail.com", never
 * the full address. Enough for staff to recognise which send it was.
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "(none)";
  return email
    .split(",")
    .map((e) => {
      const [user, domain] = e.trim().split("@");
      if (!domain) return "***";
      return `${user.slice(0, 2)}***@${domain}`;
    })
    .join(", ");
}

/** Masks any email addresses inside free text (e.g. an SMTP error message). */
export function maskEmailsIn(text: string): string {
  return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (m) => maskEmail(m));
}
