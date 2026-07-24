import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { slugify } from "@/lib/slug";
import { emptyStringsToNull } from "@/lib/validation/common";
import { validationError } from "@/lib/validation/errors";
import { serviceInput, UNIQUE_SYSTEM_NAME_MESSAGE } from "@/lib/validation/service";

export const GET = adminRoute(async (req) => {
  const p = parseListParams(req, {
    sortable: ["name", "systemName", "status", "createdAt"],
    defaultSort: "createdAt",
  });
  const where = p.search
    ? { OR: [{ name: { contains: p.search } }, { systemName: { contains: p.search } }] }
    : {};
  const [rows, total] = await db.$transaction([
    db.service.findMany({ where, orderBy: { [p.sort]: p.dir }, skip: p.skip, take: p.take }),
    db.service.count({ where }),
  ]);
  return listResponse(rows, total, p);
});

/** The Service `creating` hook (R11): slug from name, suffixed until unique. */
async function uniqueSystemName(base: string): Promise<string> {
  let candidate = base;
  for (let i = 2; ; i++) {
    const clash = await db.service.findFirst({
      where: { systemName: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${base}-${i}`;
  }
}

export const POST = adminRoute(async (req) => {
  const data = serviceInput.parse(emptyStringsToNull(await req.json()));
  let systemName: string;
  if (data.system_name == null) {
    systemName = await uniqueSystemName(slugify(data.name));
  } else {
    const clash = await db.service.findFirst({
      where: { systemName: data.system_name },
      select: { id: true },
    });
    if (clash) return validationError({ system_name: [UNIQUE_SYSTEM_NAME_MESSAGE] });
    systemName = data.system_name;
  }
  const now = new Date();
  const row = await db.service.create({
    data: { name: data.name, systemName, status: data.status, createdAt: now, updatedAt: now },
  });
  return Response.json(row, { status: 201 });
});
