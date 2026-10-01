import { z } from "zod";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { HttpError, validationError } from "@/lib/validation/errors";
import { requireSuperAdmin } from "../guard";

type Ctx = { params: Promise<{ id: string }> };

const patchInput = z.object({ role: z.enum(["admin", "super-admin"]) });

async function loadStaff(idRaw: string) {
  const id = parseId(idRaw);
  const user = id !== null ? await db.user.findUnique({ where: { id }, select: { id: true, role: true, email: true } }) : null;
  if (!user || !["admin", "super-admin"].includes(user.role ?? "")) throw new HttpError(404, "Staff member not found.");
  return user;
}

/** True if removing/demoting this user would leave zero super-admins. */
async function lastSuperAdmin(userId: bigint) {
  const others = await db.user.count({ where: { role: "super-admin", id: { not: userId } } });
  return others === 0;
}

// Change a staff member's role. Your own account and the last super-admin
// are protected, so the owner can't lock everyone out.
export const PATCH = adminRoute<Ctx>(async (req, ctx, session) => {
  requireSuperAdmin(session);
  const user = await loadStaff((await ctx.params).id);
  if (user.id === BigInt(session.user.id)) return validationError({ _: ["You can't change your own role."] });
  const data = patchInput.parse(await req.json());
  if (user.role === "super-admin" && data.role !== "super-admin" && (await lastSuperAdmin(user.id))) {
    return validationError({ _: ["There must always be at least one owner account."] });
  }
  const userType = await db.userType.findUnique({ where: { slug: data.role } });
  await db.user.update({
    where: { id: user.id },
    data: { role: data.role, userTypeId: userType?.id, updatedAt: new Date() },
  });
  console.info(`[audit] staff ${Number(user.id)} role -> ${data.role} by user ${session.user.id}`);
  return Response.json({ ok: true });
});

// Remove admin access: the account becomes an ordinary customer account
// (role "user"), every session is signed out, and 2-step is cleared so a
// later re-add starts fresh. Nothing is deleted.
export const DELETE = adminRoute<Ctx>(async (_req, ctx, session) => {
  requireSuperAdmin(session);
  const user = await loadStaff((await ctx.params).id);
  if (user.id === BigInt(session.user.id)) return validationError({ _: ["You can't remove your own access."] });
  if (user.role === "super-admin" && (await lastSuperAdmin(user.id))) {
    return validationError({ _: ["There must always be at least one owner account."] });
  }
  const userType = await db.userType.upsert({
    where: { slug: "user" },
    update: {},
    create: { name: "User", slug: "user", createdAt: new Date(), updatedAt: new Date() },
  });
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { role: "user", userTypeId: userType.id, twoFactorEnabled: false, updatedAt: new Date() } }),
    db.twoFactor.deleteMany({ where: { userId: user.id } }),
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);
  console.info(`[audit] staff ${Number(user.id)} access removed by user ${session.user.id}`);
  return Response.json({ ok: true });
});
