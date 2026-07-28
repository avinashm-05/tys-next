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
 *
 * Optimization: HAVING distance <= radius can't use an index — MySQL still
 * has to compute the trig expression for every row matching status/type
 * before it can filter, which gets slow as the vendor table grows. A
 * bounding-box WHERE clause (cheap min/max lat/lng around the search point)
 * lets it use idx_vendors_coordinates as a range scan first, so the
 * expensive Haversine math only ever runs on the small set of vendors that
 * could plausibly be in range — the box is a superset of the real circle
 * (wider at the corners), so the exact HAVING check afterward still trims it
 * to the true radius. Longitude degrees shrink toward the poles, hence the
 * cos(latitude) term; clamped away from 0 so a search near the equator can't
 * divide by (near) zero.
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

  const KM_PER_DEGREE_LAT = 111.045;
  const latDelta = radiusKm / KM_PER_DEGREE_LAT;
  const lngDelta =
    radiusKm / (KM_PER_DEGREE_LAT * Math.max(Math.cos((data.lat * Math.PI) / 180), 0.01));

  const rows = await db.$queryRaw<RadiusRow[]>`
    SELECT v.id, v.name, v.latitude, v.longitude, v.status, vt.name AS vendor_type,
      (6371 * ACOS(
        LEAST(1, GREATEST(-1,
          COS(RADIANS(${data.lat})) * COS(RADIANS(v.latitude)) *
          COS(RADIANS(v.longitude) - RADIANS(${data.lng})) +
          SIN(RADIANS(${data.lat})) * SIN(RADIANS(v.latitude))
        ))
      )) AS distance
    FROM vendors v
    JOIN vendor_types vt ON vt.id = v.vendor_type_id
    WHERE v.latitude BETWEEN ${data.lat - latDelta} AND ${data.lat + latDelta}
      AND v.longitude BETWEEN ${data.lng - lngDelta} AND ${data.lng + lngDelta}
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
