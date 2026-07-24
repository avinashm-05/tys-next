import { z } from "zod";

// Shared Zod building blocks (migration/04-validation.md). Per-endpoint
// schemas arrive with their phases; custom messages are copied verbatim from
// the FormRequests — front-end tests assert exact strings.

export const weightUnit = z.enum(["lb", "kg"]);

export const activeInactive = z.enum(["active", "inactive"]);

/** Laravel's `regex:/\S/` "not just whitespace" pattern. */
export const nonBlank = (msg: string, maxMsg?: string) =>
  z.string().max(255, maxMsg).regex(/\S/, msg);

/** Strict US format used by vendor contacts: (XXX) XXX-XXXX. */
export const usPhone = z
  .string()
  .regex(
    /^\(\d{3}\) \d{3}-\d{4}$/,
    "Please enter a valid phone number in the format (XXX) XXX-XXXX.",
  );

/** International phone used by the quote contact. */
export const intlPhone = z
  .string()
  .min(7)
  .max(20)
  .regex(/^[0-9\s\-()]+$/);

/**
 * Laravel's ConvertEmptyStringsToNull middleware, as a pre-parse transform:
 * run request bodies through this before Zod so `""` behaves like null
 * everywhere, matching the old validation semantics.
 */
export function emptyStringsToNull(input: unknown): unknown {
  if (input === "") return null;
  if (Array.isArray(input)) return input.map(emptyStringsToNull);
  if (input !== null && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, emptyStringsToNull(v)]),
    );
  }
  return input;
}
