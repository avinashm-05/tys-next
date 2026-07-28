import type { Prisma } from "@prisma/client";
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
  const search = p.search
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
  const q = new URL(req.url).searchParams;
  // Services filter (list page's "Services" checkbox dropdown) — ?serviceIds=1,2,3.
  const serviceIdsParam = q.get("serviceIds");
  const serviceIds = serviceIdsParam
    ? serviceIdsParam
        .split(",")
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n))
    : [];
  // Vendor type filter (list page's "Vendor Type" checkbox dropdown) — ?vendorTypeIds=1,2,3.
  const vendorTypeIdsParam = q.get("vendorTypeIds");
  const vendorTypeIds = vendorTypeIdsParam
    ? vendorTypeIdsParam
        .split(",")
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n))
    : [];
  const serviceFilter =
    serviceIds.length > 0
      ? { vendorServices: { some: { serviceId: { in: serviceIds.map((n) => BigInt(n)) } } } }
      : {};
  const vendorTypeIdFilter =
    vendorTypeIds.length > 0
      ? { vendorTypeId: { in: vendorTypeIds.map((n) => BigInt(n)) } }
      : {};
  // Per-column filter row under the table header (name/vendor type/services/
  // country/created by/status) — distinct from the checkbox dropdown filters.
  const nameFilter = q.get("name")?.trim();
  const vendorTypeFilter = q.get("vendorType")?.trim();
  const serviceNameFilter = q.get("serviceName")?.trim();
  const countryFilter = q.get("country")?.trim();
  const createdByFilter = q.get("createdBy")?.trim();
  const statusFilterRaw = q.get("status")?.trim();
  const statusFilter =
    statusFilterRaw === "active" || statusFilterRaw === "inactive" ? statusFilterRaw : undefined;
  const columnFilters: Prisma.VendorWhereInput = {
    ...(nameFilter ? { name: { contains: nameFilter } } : {}),
    ...(vendorTypeFilter ? { vendorType: { name: { contains: vendorTypeFilter } } } : {}),
    ...(serviceNameFilter
      ? { vendorServices: { some: { service: { name: { contains: serviceNameFilter } } } } }
      : {}),
    ...(countryFilter ? { country: { contains: countryFilter } } : {}),
    ...(createdByFilter ? { addedBy: { name: { contains: createdByFilter } } } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };
  const where = { ...search, ...serviceFilter, ...vendorTypeIdFilter, ...columnFilters };
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
