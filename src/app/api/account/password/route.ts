import { headers } from "next/headers";
import { z } from "zod";
import { auth, customerRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { HttpError, validationError } from "@/lib/validation/errors";

// "Set a password" for customers who signed up with Google or Microsoft
// and so have no password yet (2026-09-30). Better Auth's setPassword is
// server-only on purpose; this route is the customer-facing door to it,
// scoped to the session. Anyone who already has a password must use
// change-password (which checks the current one) instead.
const input = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export const POST = customerRoute(async (req, _ctx, session) => {
  const parsed = input.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return validationError({ newPassword: [parsed.error.issues[0]?.message ?? "Invalid password."] });

  const hasPassword = await db.account.findFirst({
    where: { userId: BigInt(session.user.id), providerId: "credential" },
    select: { id: true },
  });
  if (hasPassword) throw new HttpError(409, "You already have a password. Use Change password instead.");

  await auth.api.setPassword({ body: { newPassword: parsed.data.newPassword }, headers: await headers() });
  return Response.json({ ok: true });
});
