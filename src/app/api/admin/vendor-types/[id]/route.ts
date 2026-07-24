import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { HttpError, validationError } from "@/lib/validation/errors";
import { UNIQUE_NAME_MESSAGE, vendorTypeInput } from "@/lib/validation/vendor-type";

type Ctx = { params: Promise<{ id: string }> };

async function findOr404(param: string) {
  const id = parseId(param);
  const row = id !== null ? await db.vendorType.findUnique({ where: { id } }) : null;
  if (!row) throw new HttpError(404, "Vendor type not found.");
  return row;
}

export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  return Response.json(row);
});

export const PUT = adminRoute<Ctx>(async (req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  const data = vendorTypeInput.parse(emptyStringsToNull(await req.json()));
  const clash = await db.vendorType.findFirst({
    where: { name: data.name, id: { not: row.id } },
    select: { id: true },
  });
  if (clash) return validationError({ name: [UNIQUE_NAME_MESSAGE] });
  const updated = await db.vendorType.update({
    where: { id: row.id },
    data: {
      name: data.name,
      description: data.description ?? null,
      status: data.status,
      updatedAt: new Date(),
    },
  });
  return Response.json(updated);
});

export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  // Laravel's guard (VendorTypeController:116-119): never delete a type that
  // vendors still reference.
  const vendors = await db.vendor.count({ where: { vendorTypeId: row.id } });
  if (vendors > 0) {
    throw new HttpError(
      409,
      `This vendor type is assigned to ${vendors} vendor${vendors === 1 ? "" : "s"} and can't be deleted. Reassign those vendors first.`,
    );
  }
  await db.vendorType.delete({ where: { id: row.id } });
  return Response.json({ success: true });
});
