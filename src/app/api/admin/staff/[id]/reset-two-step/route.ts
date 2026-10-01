import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { HttpError } from "@/lib/validation/errors";
import { requireSuperAdmin } from "../../guard";

type Ctx = { params: Promise<{ id: string }> };

// Lost phone: clears the staff member's 2-step and signs them out
// everywhere. Their next sign-in (password, or a saved backup code isn't
// needed any more) walks them through the 3-step setup again.
export const POST = adminRoute<Ctx>(async (_req, ctx, session) => {
  requireSuperAdmin(session);
  const id = parseId((await ctx.params).id);
  const user = id !== null ? await db.user.findUnique({ where: { id }, select: { id: true, role: true } }) : null;
  if (!user || !["admin", "super-admin"].includes(user.role ?? "")) throw new HttpError(404, "Staff member not found.");
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false, updatedAt: new Date() } }),
    db.twoFactor.deleteMany({ where: { userId: user.id } }),
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);
  console.info(`[audit] staff ${Number(user.id)} 2-step reset by user ${session.user.id}`);
  return Response.json({ ok: true });
});
