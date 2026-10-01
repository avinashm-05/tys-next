import type { AppSession } from "@/lib/auth";
import { HttpError } from "@/lib/validation/errors";

/** Staff management is the owner's alone: admins (sales) get a plain 403. */
export function requireSuperAdmin(session: AppSession) {
  const role = (session.user as { role?: string | null }).role;
  if (role !== "super-admin") throw new HttpError(403, "Only the owner can manage staff.");
}
