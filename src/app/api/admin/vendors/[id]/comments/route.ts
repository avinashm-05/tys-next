import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { vendorCommentInput } from "@/lib/validation/vendor-comment";
import { AUDIT_INCLUDE, commentFilters, findVendorOr404 } from "../../helpers";

type Ctx = { params: Promise<{ id: string }> };

export const GET = adminRoute<Ctx>(async (req, ctx) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  const p = parseListParams(req, {
    sortable: ["title", "category", "priority", "createdAt"],
    defaultSort: "createdAt",
  });
  const where = {
    vendorId,
    ...commentFilters(req.url),
    ...(p.search
      ? { OR: [{ title: { contains: p.search } }, { content: { contains: p.search } }] }
      : {}),
  };
  const rows = await db.vendorComment.findMany({
    where,
    include: AUDIT_INCLUDE,
    orderBy: { [p.sort]: p.dir },
    skip: p.skip,
    take: p.take,
  });
  const total = await db.vendorComment.count({ where });
  return listResponse(rows, total, p);
});

export const POST = adminRoute<Ctx>(async (req, ctx, session) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  const data = vendorCommentInput.parse(emptyStringsToNull(await req.json()));
  const userId = BigInt(session.user.id);
  const now = new Date();
  const row = await db.vendorComment.create({
    data: {
      vendorId,
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
      createdById: userId,
      updatedById: userId,
      createdAt: now,
      updatedAt: now,
    },
    include: AUDIT_INCLUDE,
  });
  return Response.json(row, { status: 201 });
});
