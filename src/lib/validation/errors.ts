import { z } from "zod";
import { Prisma } from "@prisma/client";

/** Thrown by guards (requireAdmin & co); converted by toErrorResponse. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * The Laravel error contract every consumer expects (ARCHITECTURE §6):
 * validation failures are HTTP 422 with { message, errors: { field: [msgs] } }.
 * The top-level message mirrors Laravel's ValidationException: first message
 * plus "(and N more errors)".
 */
export type ValidationErrors = Record<string, string[]>;

export function validationError(errors: ValidationErrors): Response {
  const all = Object.values(errors).flat();
  let message = all[0] ?? "The given data was invalid.";
  if (all.length > 1) {
    message += ` (and ${all.length - 1} more ${all.length === 2 ? "error" : "errors"})`;
  }
  return Response.json({ message, errors }, { status: 422 });
}

export function zodTo422(error: z.ZodError): Response {
  const errors: ValidationErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    (errors[path] ??= []).push(issue.message);
  }
  return validationError(errors);
}

/**
 * Catch-all for route handlers:
 *   try { ... } catch (e) { return toErrorResponse(e); }
 * ZodError → 422 contract; HttpError (requireAdmin & co) → its status;
 * anything else rethrows so Next logs a real 500.
 */
export function toErrorResponse(e: unknown): Response {
  if (e instanceof z.ZodError) return zodTo422(e);
  if (e instanceof HttpError) {
    return Response.json({ message: e.message }, { status: e.status });
  }
  // Race safety net (A2 review): two concurrent writes can both pass the
  // app-level findFirst uniqueness check; the loser hits the DB unique index.
  // The friendly per-field message comes from the findFirst path — this just
  // keeps the race a 422 instead of a 500.
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return validationError({ _: ["This value is already in use."] });
  }
  // req.json() on a malformed body throws SyntaxError — that's a client
  // error, not a 500 (A3.3 review).
  if (e instanceof SyntaxError) {
    return Response.json({ message: "Invalid request body." }, { status: 400 });
  }
  throw e;
}
