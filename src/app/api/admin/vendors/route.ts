import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { vendorInput } from "@/lib/validation/vendor";
import { encryptSsn, hashSsn } from "@/lib/pii";
import {
  checkVendorRules,
  geocodeVendorRow,
  serializeVendor,
  vendorData,
  VENDOR_INCLUDE,
} from "./helpers";

export const GET = adminRoute(async (req) => {
  const p = parseListParams(req, {
    sortable: ["name", "email", "status", "city", "createdAt"],
    defaultSort: "createdAt",
  });
  // Search follows VendorsDataTable's column search (03-logic): name,
  // contact info (email|phone), address (city|state|country|line1), type name.
  const where = p.search
    ? {
        OR: [
          { name: { contains: p.search } },
          { email: { contains: p.search } },
          { phoneNumber: { contains: p.search } },
          { city: { contains: p.search } },
          { state: { contains: p.search } },
          { country: { contains: p.search } },
          { addressLine1: { contains: p.search } },
          { vendorType: { name: { contains: p.search } } },
        ],
      }
    : {};
  const [rows, total] = await db.$transaction([
    db.vendor.findMany({
      where,
      include: VENDOR_INCLUDE,
      orderBy: { [p.sort]: p.dir },
      skip: p.skip,
      take: p.take,
    }),
    db.vendor.count({ where }),
  ]);
  return listResponse(rows.map(serializeVendor), total, p);
});

export const POST = adminRoute(async (req, _ctx, session) => {
  const data = vendorInput.parse(emptyStringsToNull(await req.json()));
  const invalid = await checkVendorRules(data);
  if (invalid) return invalid;

  const now = new Date();
  const created = await db.vendor.create({
    data: {
      ...vendorData(data),
      ...(data.ssn_number
        ? { ssnNumber: encryptSsn(data.ssn_number), ssnNumberHash: hashSsn(data.ssn_number) }
        : {}),
      addedById: BigInt(session.user.id),
      createdAt: now,
      updatedAt: now,
    },
  });

  // Observer 'created' (R9) — inline, fail-open, never blocks the save.
  await geocodeVendorRow(created.id);

  const row = await db.vendor.findUniqueOrThrow({
    where: { id: created.id },
    include: VENDOR_INCLUDE,
  });
  return Response.json(serializeVendor(row), { status: 201 });
});
