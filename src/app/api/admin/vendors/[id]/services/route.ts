import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseListParams } from "@/lib/list-query";
import { serviceStatus } from "@/lib/validation/service";
import { findVendorOr404 } from "../../helpers";

type Ctx = { params: Promise<{ id: string }> };

/**
 * The service picker (VendorServiceController@index/@search, 03-logic):
 * paginated services each carrying `is_assigned` for THIS vendor, plus
 * summary counts. Filters: sanitized search, status, assignment.
 */
export const GET = adminRoute<Ctx>(async (req, ctx) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  const p = parseListParams(req, {
    sortable: ["name", "systemName", "status", "createdAt"],
    defaultSort: "name",
    defaultDir: "asc",
  });
  const q = new URL(req.url).searchParams;
  // Laravel sanitizes the term to [a-zA-Z0-9\s\-_\.]+ — it deliberately
  // strips %/_ LIKE metacharacters and HTML.
  const search = p.search.replace(/[^a-zA-Z0-9\s\-_.]+/g, "").trim();
  const status = serviceStatus.safeParse(q.get("status"));
  const assignment = q.get("assignment");

  const where = {
    ...(search
      ? { OR: [{ name: { contains: search } }, { systemName: { contains: search } }] }
      : {}),
    ...(status.success ? { status: status.data } : {}),
    ...(assignment === "assigned" ? { vendorServices: { some: { vendorId } } } : {}),
    ...(assignment === "unassigned" ? { vendorServices: { none: { vendorId } } } : {}),
  };

  const [rows, total, totalServices, assignedRows] = await db.$transaction([
    db.service.findMany({ where, orderBy: { [p.sort]: p.dir }, skip: p.skip, take: p.take }),
    db.service.count({ where }),
    db.service.count(),
    db.vendorService.findMany({ where: { vendorId }, select: { serviceId: true } }),
  ]);
  const assignedIds = new Set(assignedRows.map((r) => r.serviceId));

  return Response.json({
    rows: rows.map((r) => ({ ...r, is_assigned: assignedIds.has(r.id) })),
    total,
    page: p.page,
    pageSize: p.pageSize,
    summary: {
      total: totalServices,
      assigned: assignedIds.size,
      unassigned: totalServices - assignedIds.size,
    },
  });
});
