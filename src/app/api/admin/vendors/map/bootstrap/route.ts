import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";

// VendorMapController@index data (03-logic): all vendor types + default
// bounds from AVG/MIN/MAX over geocoded vendors; center-of-US fallback.
// notMapped tells the UI how many vendors are invisible (null coords).
export const GET = adminRoute(async () => {
  const geocoded = { latitude: { not: null }, longitude: { not: null } };
  const [types, agg, notMapped] = await db.$transaction([
    db.vendorType.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.vendor.aggregate({
      where: geocoded,
      _avg: { latitude: true, longitude: true },
      _min: { latitude: true, longitude: true },
      _max: { latitude: true, longitude: true },
    }),
    db.vendor.count({ where: { OR: [{ latitude: null }, { longitude: null }] } }),
  ]);

  const hasGeocoded = agg._min.latitude !== null;
  const defaultBounds = hasGeocoded
    ? {
        center: { lat: Number(agg._avg.latitude), lng: Number(agg._avg.longitude) },
        zoom: null,
        bounds: {
          sw: { lat: Number(agg._min.latitude), lng: Number(agg._min.longitude) },
          ne: { lat: Number(agg._max.latitude), lng: Number(agg._max.longitude) },
        },
      }
    : {
        // Center of the US (VendorMapService.getDefaultBounds fallback).
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 4,
        bounds: null,
      };

  return Response.json({
    vendorTypes: types.map((t) => ({ id: Number(t.id), name: t.name })),
    defaultBounds,
    notMapped,
  });
});
