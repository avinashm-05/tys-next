import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { HttpError } from "@/lib/validation/errors";

type Ctx = { params: Promise<{ id: string }> };

// Sign out ONE of your own devices from My profile (2026-10-05). Scoped to
// the signed-in user on the server: a session id belonging to anyone else
// simply matches nothing. The current device is signed out via Sign out.
export const DELETE = adminRoute<Ctx>(async (_req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  if (id === null) throw new HttpError(404, "Session not found.");
  const currentToken = (session.session as { token?: string }).token;
  const { count } = await db.session.deleteMany({
    where: { id, userId: BigInt(session.user.id), NOT: { token: currentToken ?? "" } },
  });
  if (count === 0) throw new HttpError(404, "Session not found.");
  return Response.json({ success: true });
});
