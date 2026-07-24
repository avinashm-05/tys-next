import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import { formatCsvDateTime } from "@/lib/format";
import { commentFilters, findVendorOr404 } from "../../../helpers";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Port of VendorCommentController@export (03-logic): filtered CSV, filename
 * vendor_comments_{id}_{Y-m-d_H-i-s}.csv, timestamps Y-m-d H:i:s UTC (R17).
 * Filters: category / priority ("all" = no filter) + from_date / to_date.
 */
export const GET = adminRoute<Ctx>(async (req, ctx) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  const q = new URL(req.url).searchParams;
  const from = q.get("from_date") ? new Date(`${q.get("from_date")}T00:00:00Z`) : null;
  const to = q.get("to_date") ? new Date(`${q.get("to_date")}T23:59:59Z`) : null;

  const rows = await db.vendorComment.findMany({
    where: {
      vendorId,
      ...commentFilters(req.url),
      ...(from && !Number.isNaN(from.getTime()) ? { createdAt: { gte: from } } : {}),
      ...(to && !Number.isNaN(to.getTime())
        ? { createdAt: { ...(from ? { gte: from } : {}), lte: to } }
        : {}),
    },
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    ["ID", "Title", "Content", "Category", "Priority", "Created By", "Created At"],
    rows.map((r) => [
      Number(r.id),
      r.title,
      r.content,
      r.category,
      r.priority,
      r.createdBy?.name ?? "",
      formatCsvDateTime(r.createdAt),
    ]),
  );

  const stamp = formatCsvDateTime(new Date()).replace(" ", "_").replaceAll(":", "-");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vendor_comments_${Number(vendorId)}_${stamp}.csv"`,
    },
  });
});
