import { Prisma } from "@prisma/client";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { emptyStringsToNull } from "@/lib/validation/common";
import { mapRadiusInput } from "@/lib/validation/vendor-map";
import { checkVendorTypeFilter, throttleOr429 } from "../../helpers";

type RadiusRow = {
  id: bigint;
  name: string;
  latitude: Prisma.Decimal;
  longitude: Prisma.Decimal;
  status: string;
  vendor_type: string;
  distance: number;
};

/**
 * searchByRadius (03-logic §VendorMapService): raw Haversine ordered by
 * distance, miles→km ×1.60934. Tagged-template $queryRaw only — every value
 * is a bound parameter, nothing is string-interpolated.
 */
export const POST = adminRoute(async (req, _ctx, session) => {
  await throttleOr429(`vendor-map:radius:${session.user.id}`, 60);
  const data = mapRadiusInput.parse(emptyStringsToNull(await req.json()));
  const invalid = await checkVendorTypeFilter(data.vendor_type_id);
  if (invalid) return invalid;

  const radiusKm = data.unit === "miles" ? data.radius * 1.60934 : data.radius;
  const statusSql =
    data.status && data.status !== "all"
      ? Prisma.sql`AND v.status = ${data.status}`
      : Prisma.empty;
  const typeSql =
    data.vendor_type_id != null
      ? Prisma.sql`AND v.vendor_type_id = ${BigInt(data.vendor_type_id)}`
      : Prisma.empty;

  const rows = await db.$queryRaw<RadiusRow[]>`
    SELECT v.id, v.name, v.latitude, v.longitude, v.status, vt.name AS vendor_type,
      (6371 * ACOS(
        COS(RADIANS(${data.lat})) * COS(RADIANS(v.latitude)) *
        COS(RADIANS(v.longitude) - RADIANS(${data.lng})) +
        SIN(RADIANS(${data.lat})) * SIN(RADIANS(v.latitude))
      )) AS distance
    FROM vendors v
    JOIN vendor_types vt ON vt.id = v.vendor_type_id
    WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL
      ${statusSql}
      ${typeSql}
    HAVING distance <= ${radiusKm}
    ORDER BY distance ASC
    LIMIT 500
  `;

  const kmPerUnit = data.unit === "miles" ? 1.60934 : 1;
  return Response.json({
    vendors: rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      status: r.status,
      vendorType: r.vendor_type,
      // Distance in the unit the caller asked in.
      distance: Math.round((r.distance / kmPerUnit) * 100) / 100,
    })),
    count: rows.length,
    unit: data.unit,
  });
});
