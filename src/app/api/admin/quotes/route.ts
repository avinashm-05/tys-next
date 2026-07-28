import type { Prisma } from "@prisma/client";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { quoteStatus } from "@/lib/validation/quote";
import { packageTypeWhere, QUOTE_INCLUDE, serializeQuoteRow } from "./helpers";

// QuotesDataTable port (03-logic): filters status / package_type (FIND_IN_SET)
// / date range / domestic-vs-international route. Search covers the
// denormalized contact.
export const GET = adminRoute(async (req) => {
  const p = parseListParams(req, {
    sortable: ["createdAt", "status", "estimatedCost", "totalChargeableWeight"],
    defaultSort: "createdAt",
  });
  const q = new URL(req.url).searchParams;

  // Comma-separated for the checkbox status filter (e.g. "pending,quoted") —
  // same shape as Vendors' serviceIds/vendorTypeIds. Unknown values are
  // dropped rather than rejected, so a stale filter chip never 400s the list.
  const statusValues = (q.get("status") ?? "")
    .split(",")
    .map((s) => quoteStatus.safeParse(s.trim()))
    .filter((r) => r.success)
    .map((r) => r.data);
  const packageType = q.get("packageType");
  // Raw from/to-country text boxes asked for exact ISO codes to be typed in
  // — not something a support exec would do day to day. The real question
  // they care about is domestic vs. international (which is also what
  // drives auto-rating elsewhere), so that's the filter now.
  const route = q.get("route"); // "domestic" | "international" | null
  const fromDate = q.get("fromDate") ? new Date(`${q.get("fromDate")}T00:00:00Z`) : null;
  const toDate = q.get("toDate") ? new Date(`${q.get("toDate")}T23:59:59Z`) : null;

  const createdAt: Prisma.DateTimeFilter = {};
  if (fromDate && !Number.isNaN(fromDate.getTime())) createdAt.gte = fromDate;
  if (toDate && !Number.isNaN(toDate.getTime())) createdAt.lte = toDate;

  const where: Prisma.QuoteWhereInput = {
    ...(statusValues.length ? { status: { in: statusValues } } : {}),
    ...(packageType ? packageTypeWhere(packageType) : {}),
    ...(route === "domestic" ? { fromCountry: "US", toCountry: "US" } : {}),
    ...(route === "international" ? { NOT: { fromCountry: "US", toCountry: "US" } } : {}),
    ...(Object.keys(createdAt).length ? { createdAt } : {}),
    ...(p.search
      ? {
          OR: [
            { name: { contains: p.search } },
            { email: { contains: p.search } },
            { mobileNumber: { contains: p.search } },
            { contacts: { some: { OR: [{ name: { contains: p.search } }, { email: { contains: p.search } }] } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await db.$transaction([
    db.quote.findMany({
      where,
      include: QUOTE_INCLUDE,
      orderBy: { [p.sort]: p.dir },
      skip: p.skip,
      take: p.take,
    }),
    db.quote.count({ where }),
  ]);
  return listResponse(rows.map(serializeQuoteRow), total, p);
});
