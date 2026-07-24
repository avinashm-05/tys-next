import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { emptyStringsToNull } from "@/lib/validation/common";
import { mapBoundsInput } from "@/lib/validation/vendor-map";
import {
  checkVendorTypeFilter,
  MAP_SELECT,
  serializeMapVendor,
  throttleOr429,
} from "../../helpers";

/** getVendorsInBounds (03-logic): viewport query, limit 500, geocoded only. */
export const POST = adminRoute(async (req, _ctx, session) => {
  await throttleOr429(`vendor-map:bounds:${session.user.id}`, 60);
  const data = mapBoundsInput.parse(emptyStringsToNull(await req.json()));
  const invalid = await checkVendorTypeFilter(data.vendor_type_id);
  if (invalid) return invalid;

  const { sw, ne } = data.bounds;
  // Longitude wrap-around (Vendor.php:244-251): when the viewport crosses the
  // antimeridian (sw.lng > ne.lng) the filter is an OR of the two half-ranges.
  // SQL comparisons exclude NULL coords by themselves.
  const lngFilter =
    sw.lng <= ne.lng
      ? { longitude: { gte: sw.lng, lte: ne.lng } }
      : { OR: [{ longitude: { gte: sw.lng } }, { longitude: { lte: ne.lng } }] };

  const vendors = await db.vendor.findMany({
    where: {
      AND: [
        { latitude: { gte: sw.lat, lte: ne.lat } },
        lngFilter,
        ...(data.status && data.status !== "all" ? [{ status: data.status }] : []),
        ...(data.vendor_type_id != null
          ? [{ vendorTypeId: BigInt(data.vendor_type_id) }]
          : []),
      ],
    },
    select: MAP_SELECT,
    take: 500,
  });

  return Response.json({ vendors: vendors.map(serializeMapVendor), count: vendors.length });
});
