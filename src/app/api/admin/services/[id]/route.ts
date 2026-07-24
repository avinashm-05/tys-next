import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { HttpError, validationError } from "@/lib/validation/errors";
import { serviceInput, UNIQUE_SYSTEM_NAME_MESSAGE } from "@/lib/validation/service";

type Ctx = { params: Promise<{ id: string }> };

async function findOr404(param: string) {
  const id = parseId(param);
  const row = id !== null ? await db.service.findUnique({ where: { id } }) : null;
  if (!row) throw new HttpError(404, "Service not found.");
  return row;
}

// JSON detail for the client-side dialog (Laravel returned modal HTML here).
export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  return Response.json(row);
});

export const PUT = adminRoute<Ctx>(async (req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  const data = serviceInput.parse(emptyStringsToNull(await req.json()));
  // system_name is NOT NULL in the DB — a nullish value on update keeps the
  // existing slug (the auto-slug hook only runs on create, R11).
  const systemName = data.system_name ?? row.systemName;
  const clash = await db.service.findFirst({
    where: { systemName, id: { not: row.id } },
    select: { id: true },
  });
  if (clash) return validationError({ system_name: [UNIQUE_SYSTEM_NAME_MESSAGE] });
  const updated = await db.service.update({
    where: { id: row.id },
    data: { name: data.name, systemName, status: data.status, updatedAt: new Date() },
  });
  return Response.json(updated);
});

// HARD delete — Laravel parity (no dependency check; vendor_services cascades).
export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  await db.service.delete({ where: { id: row.id } });
  return Response.json({ success: true });
});
