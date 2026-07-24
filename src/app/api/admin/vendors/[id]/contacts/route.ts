import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { validationError } from "@/lib/validation/errors";
import {
  UNIQUE_CONTACT_EMAIL_MESSAGE,
  vendorContactInput,
} from "@/lib/validation/vendor-contact";
import { AUDIT_INCLUDE, findVendorOr404 } from "../../helpers";

type Ctx = { params: Promise<{ id: string }> };

// The soft-delete extension (db.ts) auto-filters deletedAt: null on every
// vendorContact query in this file — trashed contacts are invisible (R13).
export const GET = adminRoute<Ctx>(async (req, ctx) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  const p = parseListParams(req, {
    sortable: ["name", "email", "city", "status", "createdAt"],
    defaultSort: "createdAt",
  });
  const where = {
    vendorId,
    ...(p.search
      ? {
          OR: [
            { name: { contains: p.search } },
            { title: { contains: p.search } },
            { email: { contains: p.search } },
            { city: { contains: p.search } },
            { state: { contains: p.search } },
          ],
        }
      : {}),
  };
  // Not $transaction: the soft-delete extension wraps these queries, and both
  // must go through it. Two reads are fine here.
  const rows = await db.vendorContact.findMany({
    where,
    include: AUDIT_INCLUDE,
    orderBy: { [p.sort]: p.dir },
    skip: p.skip,
    take: p.take,
  });
  const total = await db.vendorContact.count({ where });
  return listResponse(rows, total, p);
});

export const POST = adminRoute<Ctx>(async (req, ctx, session) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  const data = vendorContactInput.parse(emptyStringsToNull(await req.json()));

  // UniqueVendorContactEmail: within-vendor, live rows only. The utf8mb4_ci
  // collation makes plain equality case-insensitive. A collision with a
  // SOFT-DELETED row passes here and 422s via the P2002 net instead (R7).
  const clash = await db.vendorContact.findFirst({
    where: { vendorId, email: data.email },
    select: { id: true },
  });
  if (clash) return validationError({ email: [UNIQUE_CONTACT_EMAIL_MESSAGE] });

  const userId = BigInt(session.user.id);
  const now = new Date();
  const row = await db.vendorContact.create({
    data: {
      vendorId,
      name: data.name,
      title: data.title ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      email: data.email,
      workPhone: data.work_phone ?? null,
      cellPhone: data.cell_phone ?? null,
      status: data.status,
      createdById: userId,
      updatedById: userId,
      createdAt: now,
      updatedAt: now,
    },
    include: AUDIT_INCLUDE,
  });
  return Response.json(row, { status: 201 });
});
