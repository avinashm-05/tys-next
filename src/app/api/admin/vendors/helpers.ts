import type { Prisma, Vendor } from "@prisma/client";
import { db } from "@/lib/db";
import { ADDRESS_FIELDS, fullAddress, geocodeAddress } from "@/lib/geocoding";
import { parseId } from "@/lib/list-query";
import { rateLimit } from "@/lib/ratelimit";
import { HttpError, validationError } from "@/lib/validation/errors";
import {
  vendorCommentCategory,
  vendorCommentPriority,
} from "@/lib/validation/vendor-comment";
import {
  UNIQUE_EIN_MESSAGE,
  UNIQUE_EMAIL_MESSAGE,
  UNIQUE_SSN_MESSAGE,
  VENDOR_TYPE_INACTIVE_MESSAGE,
  type VendorInput,
} from "@/lib/validation/vendor";
import { hashSsn } from "@/lib/pii";

export const VENDOR_INCLUDE = {
  vendorType: { select: { id: true, name: true } },
  addedBy: { select: { id: true, name: true } },
  // First couple of assigned services, for the list's "Services" column —
  // a vendor can have many; showing all would need its own cell layout.
  vendorServices: {
    take: 2,
    orderBy: { assignedAt: "asc" },
    select: { service: { select: { name: true } } },
  },
  // Dependent-row counts for the delete confirmation. This nested _count does
  // NOT pass through the soft-delete extension, so it includes trashed
  // contacts/comments — correct: a vendor hard-delete cascades them all away.
  _count: { select: { contacts: true, comments: true, vendorServices: true } },
} satisfies Prisma.VendorInclude;

// Author relations shown by the contact/comment lists ("recorded by").
export const AUDIT_INCLUDE = {
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
} as const;

/** Comment category/priority filters shared by the list and CSV export ("all"/absent = no filter). */
export function commentFilters(url: string) {
  const q = new URL(url).searchParams;
  const category = vendorCommentCategory.safeParse(q.get("category"));
  const priority = vendorCommentPriority.safeParse(q.get("priority"));
  return {
    ...(category.success ? { category: category.data } : {}),
    ...(priority.success ? { priority: priority.data } : {}),
  };
}

/** The 6-column map resource (VendorMapResource, 03-logic). */
export const MAP_SELECT = {
  id: true,
  name: true,
  latitude: true,
  longitude: true,
  status: true,
  vendorType: { select: { id: true, name: true } },
} satisfies Prisma.VendorSelect;

type MapVendorRow = {
  id: bigint;
  name: string;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  status: string;
  vendorType: { id: bigint; name: string };
};

export function serializeMapVendor(v: MapVendorRow) {
  return {
    id: Number(v.id),
    name: v.name,
    latitude: Number(v.latitude),
    longitude: Number(v.longitude),
    status: v.status,
    vendorType: v.vendorType.name,
  };
}

// Separate from MAP_SELECT/serializeMapVendor on purpose: bounds/search
// return dozens of vendors at once just to place markers, so they stay
// lean. Only the single-vendor popup (map-details) needs contact info, so
// only it pays for the extra columns.
export const MAP_DETAIL_SELECT = {
  ...MAP_SELECT,
  email: true,
  phoneNumber: true,
  countryCode: true,
} satisfies Prisma.VendorSelect;

type MapVendorDetailRow = MapVendorRow & {
  email: string;
  phoneNumber: string;
  countryCode: string;
};

export function serializeMapVendorDetail(v: MapVendorDetailRow) {
  return {
    ...serializeMapVendor(v),
    email: v.email,
    phone: `${v.countryCode} ${v.phoneNumber}`.trim(),
  };
}

/** Shared by bounds/radius: 422 when the optional vendor_type_id doesn't exist. */
export async function checkVendorTypeFilter(
  vendorTypeId: number | null | undefined,
): Promise<Response | null> {
  if (vendorTypeId == null) return null;
  const exists = await db.vendorType.findUnique({
    where: { id: BigInt(vendorTypeId) },
    select: { id: true },
  });
  return exists ? null : validationError({ vendor_type_id: ["The selected vendor type is invalid."] });
}

/** Laravel's `throttle:max,1` on the assignment writes — 429 like Laravel. */
export async function throttleOr429(key: string, max: number): Promise<void> {
  const { allowed } = await rateLimit(key, max, 60);
  if (!allowed) throw new HttpError(429, "Too Many Attempts.");
}

/** Parent guard for the nested sub-resources (contacts/comments/services). */
export async function findVendorOr404(param: string): Promise<bigint> {
  const id = parseId(param);
  const row =
    id !== null
      ? await db.vendor.findUnique({ where: { id }, select: { id: true } })
      : null;
  if (!row) throw new HttpError(404, "Vendor not found.");
  return row.id;
}

/**
 * SSN never leaves the API (R-PII): the serializer strips ciphertext + hash
 * and exposes only hasSsn (the edit form's "on file" hint). Lat/lng Decimals
 * go out as numbers — Laravel cast them to float, so consumers expect numbers
 * (the money decimal-as-string contract R3 does not apply to coordinates).
 */
type VendorCounts = { contacts: number; comments: number; vendorServices: number };
type VendorAddedBy = { id: bigint; name: string };
type VendorServiceName = { service: { name: string } };

export function serializeVendor<
  T extends Vendor & {
    _count?: VendorCounts;
    addedBy?: VendorAddedBy;
    vendorServices?: VendorServiceName[];
  },
>(row: T) {
  const { ssnNumber, ssnNumberHash: _hash, latitude, longitude, _count, addedBy, vendorServices, ...rest } =
    row;
  return {
    ...rest,
    latitude: latitude == null ? null : Number(latitude),
    longitude: longitude == null ? null : Number(longitude),
    hasSsn: ssnNumber != null,
    ...(addedBy ? { createdByName: addedBy.name } : {}),
    ...(vendorServices
      ? { serviceNames: vendorServices.map((vs) => vs.service.name) }
      : {}),
    ...(_count
      ? {
          counts: {
            contacts: _count.contacts,
            comments: _count.comments,
            services: _count.vendorServices,
          },
        }
      : {}),
  };
}

/**
 * The async rules from VendorStore/UpdateRequest (04-validation): vendor type
 * must exist AND be active; email / EIN / SSN(hash) unique, ignoring self on
 * update. Returns the 422 response, or null when everything passes.
 */
export async function checkVendorRules(
  data: VendorInput,
  ignoreId?: bigint,
): Promise<Response | null> {
  const notSelf = ignoreId !== undefined ? { id: { not: ignoreId } } : {};

  const type = await db.vendorType.findUnique({
    where: { id: BigInt(data.vendor_type_id) },
    select: { status: true },
  });
  if (!type || type.status !== "active") {
    return validationError({ vendor_type_id: [VENDOR_TYPE_INACTIVE_MESSAGE] });
  }

  if (
    await db.vendor.findFirst({ where: { email: data.email, ...notSelf }, select: { id: true } })
  ) {
    return validationError({ email: [UNIQUE_EMAIL_MESSAGE] });
  }

  if (
    data.ein_number &&
    (await db.vendor.findFirst({
      where: { einNumber: data.ein_number, ...notSelf },
      select: { id: true },
    }))
  ) {
    return validationError({ ein_number: [UNIQUE_EIN_MESSAGE] });
  }

  if (
    data.ssn_number &&
    (await db.vendor.findFirst({
      where: { ssnNumberHash: hashSsn(data.ssn_number), ...notSelf },
      select: { id: true },
    }))
  ) {
    return validationError({ ssn_number: [UNIQUE_SSN_MESSAGE] });
  }

  return null;
}

/** snake_case request fields → Prisma columns (SSN handled by the caller). */
export function vendorData(data: VendorInput) {
  return {
    name: data.name,
    vendorTypeId: BigInt(data.vendor_type_id),
    email: data.email,
    phoneNumber: data.phone_number,
    countryCode: data.country_code,
    website: data.website ?? null,
    einNumber: data.ein_number ?? null,
    addressLine1: data.address_line_1,
    addressLine2: data.address_line_2 ?? null,
    addressLine3: data.address_line_3 ?? null,
    city: data.city,
    state: data.state,
    country: data.country,
    postalCode: data.postal_code,
    status: data.status,
  };
}

export function addressChanged(next: ReturnType<typeof vendorData>, current: Vendor): boolean {
  return ADDRESS_FIELDS.some((f) => (next[f] ?? null) !== (current[f] ?? null));
}

/**
 * The VendorObserver port (R9): geocode full_address and write lat/lng +
 * geocoded_at in a second write, like Laravel's updateQuietly. Fail-open —
 * any failure is logged and the vendor keeps its previous coordinates
 * (null on create), exactly like the observer.
 */
export async function geocodeVendorRow(id: bigint): Promise<void> {
  try {
    const vendor = await db.vendor.findUniqueOrThrow({ where: { id } });
    const coords = await geocodeAddress(fullAddress(vendor));
    if (!coords) {
      console.error("[geocode] no result for vendor", Number(id));
      return;
    }
    await db.vendor.update({
      where: { id },
      data: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        geocodedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("[geocode] failed for vendor", Number(id), e);
  }
}
