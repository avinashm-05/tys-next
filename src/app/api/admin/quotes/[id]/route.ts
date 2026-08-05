import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { adminQuoteDetailInput } from "@/lib/validation/admin-quote-detail";
import { HttpError } from "@/lib/validation/errors";
import { QUOTE_DETAIL_INCLUDE, serializeQuoteDetail } from "../helpers";

type Ctx = { params: Promise<{ id: string }> };

// Detail read + the admin editor's Save/Save & Exit.
export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const id = parseId((await ctx.params).id);
  const row =
    id !== null
      ? await db.quote.findUnique({ where: { id }, include: QUOTE_DETAIL_INCLUDE })
      : null;
  if (!row) throw new HttpError(404, "Quote not found.");
  return Response.json(serializeQuoteDetail(row));
});

// Saves the whole QuoteDetailEditor form: route, the primary contact, and
// the package rows (staff fill these in after calling the customer — the
// public single-page form never collects them, see quote-request-form.tsx).
// Package rows are reconciled by id: negative ids are client-generated temp
// ids for a row added in this session (create), positive ids are real
// PackageDetail rows (update), and any existing row not present in the
// submitted list was removed in the editor (delete).
export const PATCH = adminRoute<Ctx>(async (req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const existing =
    id !== null
      ? await db.quote.findUnique({
          where: { id },
          include: { contacts: { orderBy: { id: "asc" } }, packages: true },
        })
      : null;
  if (!existing) throw new HttpError(404, "Quote not found.");

  const data = adminQuoteDetailInput.parse(emptyStringsToNull(await req.json()));
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: existing.id },
      data: {
        fromCountry: data.from_country,
        fromZip: data.from_zip ?? "",
        toCountry: data.to_country,
        toZip: data.to_zip ?? "",
        isResidence: data.is_residence,
        name: data.contact.name ?? null,
        email: data.contact.email ?? null,
        mobileNumber: `${data.contact.country_code ?? ""} ${data.contact.phone ?? ""}`.trim() || null,
        updatedAt: now,
      },
    });

    const firstContact = existing.contacts[0];
    const contactData = {
      name: data.contact.name ?? "",
      email: data.contact.email ?? "",
      countryCode: data.contact.country_code ?? "",
      phone: data.contact.phone ?? "",
    };
    if (firstContact) {
      await tx.quoteContact.update({ where: { id: firstContact.id }, data: { ...contactData, updatedAt: now } });
    } else if (contactData.name || contactData.email) {
      await tx.quoteContact.create({
        data: { ...contactData, quoteId: existing.id, createdAt: now, updatedAt: now },
      });
    }

    const keepIds = new Set(data.packages.filter((p) => p.id > 0).map((p) => BigInt(p.id)));
    const toDelete = existing.packages.filter((p) => !keepIds.has(p.id));
    if (toDelete.length > 0) {
      await tx.packageDetail.deleteMany({ where: { id: { in: toDelete.map((p) => p.id) } } });
    }

    for (const p of data.packages) {
      const rowData = {
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
        updatedAt: now,
      };
      if (p.id > 0) {
        await tx.packageDetail.update({ where: { id: BigInt(p.id) }, data: rowData });
      } else {
        await tx.packageDetail.create({ data: { ...rowData, quoteId: existing.id, createdAt: now } });
      }
    }
  });

  console.info(`[audit] quote ${Number(existing.id)} detail edited by user ${session.user.id}`);

  const row = await db.quote.findUnique({ where: { id: existing.id }, include: QUOTE_DETAIL_INCLUDE });
  return Response.json(serializeQuoteDetail(row!));
});
