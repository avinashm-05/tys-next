import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { emptyStringsToNull } from "@/lib/validation/common";
import { mapSearchInput } from "@/lib/validation/vendor-map";
import { MAP_SELECT, serializeMapVendor, throttleOr429 } from "../../helpers";

/** searchByName (03-logic): LIKE %q%, geocoded only, limit 10 — autocomplete. */
export const POST = adminRoute(async (req, _ctx, session) => {
  await throttleOr429(`vendor-map:search:${session.user.id}`, 60);
  const { query } = mapSearchInput.parse(emptyStringsToNull(await req.json()));
  // Neutralize LIKE metacharacters (step 0) — matched literally.
  const term = query.replace(/[%_\\]/g, "").trim();

  const vendors = term
    ? await db.vendor.findMany({
        where: {
          name: { contains: term },
          latitude: { not: null },
          longitude: { not: null },
        },
        select: MAP_SELECT,
        orderBy: { name: "asc" },
        take: 10,
      })
    : [];

  return Response.json({ vendors: vendors.map(serializeMapVendor) });
});
