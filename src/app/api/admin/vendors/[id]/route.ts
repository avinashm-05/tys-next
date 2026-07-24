import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { HttpError } from "@/lib/validation/errors";
import { vendorInput } from "@/lib/validation/vendor";
import { encryptSsn, hashSsn } from "@/lib/pii";
import {
  addressChanged,
  checkVendorRules,
  geocodeVendorRow,
  serializeVendor,
  vendorData,
  VENDOR_INCLUDE,
} from "../helpers";

type Ctx = { params: Promise<{ id: string }> };

async function findOr404(param: string) {
  const id = parseId(param);
  const row =
    id !== null
      ? await db.vendor.findUnique({ where: { id }, include: VENDOR_INCLUDE })
      : null;
  if (!row) throw new HttpError(404, "Vendor not found.");
  return row;
}

export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  return Response.json(serializeVendor(row));
});

export const PUT = adminRoute<Ctx>(async (req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  const data = vendorInput.parse(emptyStringsToNull(await req.json()));
  const invalid = await checkVendorRules(data, row.id);
  if (invalid) return invalid;

  const mapped = vendorData(data);
  const needsGeocode = addressChanged(mapped, row);

  await db.vendor.update({
    where: { id: row.id },
    data: {
      ...mapped,
      // Blank SSN keeps the stored value (the edit form never shows it);
      // a new value re-encrypts. Clearing an SSN is intentionally not a thing.
      ...(data.ssn_number
        ? { ssnNumber: encryptSsn(data.ssn_number), ssnNumberHash: hashSsn(data.ssn_number) }
        : {}),
      updatedAt: new Date(),
    },
  });

  // Observer 'updated': geocode only when an address field changed (R9).
  if (needsGeocode) await geocodeVendorRow(row.id);

  const updated = await db.vendor.findUniqueOrThrow({
    where: { id: row.id },
    include: VENDOR_INCLUDE,
  });
  return Response.json(serializeVendor(updated));
});

// Laravel VendorController@destroy: hard delete; contacts/comments/service
// assignments go with it via FK CASCADE (the dependency check was an
// unimplemented TODO in Laravel — ported as-is, 03-logic).
export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  await db.vendor.delete({ where: { id: row.id } });
  return Response.json({ success: true });
});
