import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { validationError } from "@/lib/validation/errors";
import { UNIQUE_NAME_MESSAGE, vendorTypeInput } from "@/lib/validation/vendor-type";

export const GET = adminRoute(async (req) => {
  const p = parseListParams(req, {
    sortable: ["name", "status", "createdAt"],
    defaultSort: "createdAt",
  });
  const where = p.search ? { name: { contains: p.search } } : {};
  const [rows, total] = await db.$transaction([
    db.vendorType.findMany({
      where,
      orderBy: { [p.sort]: p.dir },
      skip: p.skip,
      take: p.take,
    }),
    db.vendorType.count({ where }),
  ]);
  return listResponse(rows, total, p);
});

export const POST = adminRoute(async (req) => {
  const data = vendorTypeInput.parse(emptyStringsToNull(await req.json()));
  if (await db.vendorType.findFirst({ where: { name: data.name }, select: { id: true } })) {
    return validationError({ name: [UNIQUE_NAME_MESSAGE] });
  }
  const now = new Date();
  const row = await db.vendorType.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    },
  });
  return Response.json(row, { status: 201 });
});
