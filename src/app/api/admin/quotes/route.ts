import type { Prisma } from "@prisma/client";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { adminQuoteDetailInput } from "@/lib/validation/admin-quote-detail";
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

// Admin "New Quote" — staff building a quote from scratch (phone-in lead,
// no public submission to convert). Same shape as the detail editor's PATCH,
// plus a fresh Quote row and package_type recomputed from whatever package
// rows were added (there's no original customer selection to preserve here,
// unlike an edit — see PATCH /api/admin/quotes/[id]).
export const POST = adminRoute(async (req, _ctx, session) => {
  const data = adminQuoteDetailInput.parse(emptyStringsToNull(await req.json()));
  const now = new Date();
  const packageType = [...new Set(data.packages.map((p) => p.package_type))].join(",");

  const created = await db.$transaction(async (tx) => {
    const quote = await tx.quote.create({
      data: {
        fromCountry: data.from_country,
        fromZip: data.from_zip ?? "",
        toCountry: data.to_country,
        toZip: data.to_zip ?? "",
        isResidence: data.is_residence,
        packageType,
        name: data.contact.name ?? null,
        email: data.contact.email ?? null,
        mobileNumber: `${data.contact.country_code ?? ""} ${data.contact.phone ?? ""}`.trim() || null,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      },
    });

    if (data.contact.name || data.contact.email) {
      await tx.quoteContact.create({
        data: {
          quoteId: quote.id,
          name: data.contact.name ?? "",
          email: data.contact.email ?? "",
          countryCode: data.contact.country_code ?? "",
          phone: data.contact.phone ?? "",
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    for (const p of data.packages) {
      await tx.packageDetail.create({
        data: {
          quoteId: quote.id,
          packageType: p.package_type,
          quantity: p.quantity,
          weight: p.weight ?? null,
          weightUnit: p.weight_unit ?? null,
          length: p.length ?? null,
          width: p.width ?? null,
          height: p.height ?? null,
          brandName: p.brand_name ?? null,
          tvModel: p.tv_model ?? null,
          carModel: p.car_model ?? null,
          carYear: p.car_year ?? null,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return quote;
  });

  console.info(`[audit] quote ${Number(created.id)} created from admin by user ${session.user.id}`);
  return Response.json({ id: Number(created.id) }, { status: 201 });
});
