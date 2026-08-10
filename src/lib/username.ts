import { db } from "@/lib/db";

/**
 * Handle rules, deliberately narrower than what Better Auth's username plugin
 * would accept: lowercase a-z, 0-9 and underscore only. No dots (they read as
 * file extensions in a URL and invite homograph lookalikes), no leading digit
 * strictly required — the derived base already starts from a name or an email
 * local part.
 */
const MAX_LENGTH = 30;
const MIN_LENGTH = 3;

/** Strips a display name or email local part down to a legal handle body. */
export function normalizeUsername(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD") // "José" -> "Jose" once the combining marks below go
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, MAX_LENGTH);
}

/**
 * Best base for a handle: the person's name if it yields something usable,
 * otherwise the email's local part. Falls back to "user" so the caller always
 * gets a suffixable stem rather than an empty string.
 */
export function baseUsername(name: string | null, email: string | null): string {
  const fromName = normalizeUsername(name ?? "");
  if (fromName.length >= MIN_LENGTH) return fromName;

  const fromEmail = normalizeUsername((email ?? "").split("@")[0] ?? "");
  if (fromEmail.length >= MIN_LENGTH) return fromEmail;

  return "user";
}

/**
 * Resolves a base to a handle nothing else is using yet.
 *
 * The uniqueness check here is advisory, not the guarantee — two signups can
 * race between the SELECT and the INSERT. `users_username_unique` is what
 * actually enforces it; this just keeps the common case collision-free and
 * readable ("ravikumar", then "ravikumar2") instead of always tacking on
 * noise. After a few sequential attempts it switches to a random suffix so a
 * popular name can't walk the integers forever.
 */
export async function generateUniqueUsername(
  name: string | null,
  email: string | null,
): Promise<string> {
  const base = baseUsername(name, email);

  const candidates = [base, ...Array.from({ length: 8 }, (_, i) => `${base}${i + 2}`)];
  for (const candidate of candidates) {
    const trimmed = candidate.slice(0, MAX_LENGTH);
    const taken = await db.user.findFirst({ where: { username: trimmed }, select: { id: true } });
    if (!taken) return trimmed;
  }

  // Crowded stem — stop guessing sequentially. Trim the base so the suffix
  // always survives the length cap.
  const stem = base.slice(0, MAX_LENGTH - 5);
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${stem}${Math.floor(1000 + Math.random() * 9000)}`;
    const taken = await db.user.findFirst({ where: { username: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }

  // Vanishingly unlikely; let the unique index be the backstop.
  return `${stem}${Date.now().toString().slice(-5)}`;
}
