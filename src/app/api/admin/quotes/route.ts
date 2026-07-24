import type { Prisma } from "@prisma/client";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { quoteStatus } from "@/lib/validation/quote";
import { packageTypeWhere, QUOTE_INCLUDE, serializeQuoteRow } from "./helpers";

// QuotesDataTable port (03-logic): filters status / package_type (FIND_IN_SET)
// / date range / from+to country. Search covers the denormalized contact.
export const GET = adminRoute(async (req) => {
  const p = parseListParams(req, {
    sortable: ["createdAt", "status", "estimatedCost", "totalChargeableWeight"],
    defaultSort: "createdAt",
  });
  const q = new URL(req.url).searchParams;

  const status = quoteStatus.safeParse(q.get("status"));
  const packageType = q.get("packageType");
  const fromCountry = q.get("fromCountry")?.trim();
  const toCountry = q.get("toCountry")?.trim();
  const fromDate = q.get("fromDate") ? new Date(`${q.get("fromDate")}T00:00:00Z`) : null;
  const toDate = q.get("toDate") ? new Date(`${q.get("toDate")}T23:59:59Z`) : null;

  const createdAt: Prisma.DateTimeFilter = {};
  if (fromDate && !Number.isNaN(fromDate.getTime())) createdAt.gte = fromDate;
  if (toDate && !Number.isNaN(toDate.getTime())) createdAt.lte = toDate;

  const where: Prisma.QuoteWhereInput = {
    ...(status.success ? { status: status.data } : {}),
    ...(packageType ? packageTypeWhere(packageType) : {}),
    ...(fromCountry ? { fromCountry: { contains: fromCountry } } : {}),
    ...(toCountry ? { toCountry: { contains: toCountry } } : {}),
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
