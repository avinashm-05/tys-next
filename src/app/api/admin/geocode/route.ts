import { adminRoute } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocoding";
import { emptyStringsToNull } from "@/lib/validation/common";
import { geocodeInput } from "@/lib/validation/vendor-map";
import { throttleOr429 } from "../vendors/helpers";

/**
 * geocodeAddress (03-logic): powers the map's pincode/address search. Saves
 * nothing. Throttled 10/min like Laravel — Nominatim's usage policy is
 * strict. Biased to the US: every vendor in this system is domestic, and a
 * bare pincode (the map's primary use case) is otherwise ambiguous across
 * countries — see geocodeAddress's own comment for the Algeria mix-up this
 * fixes.
 */
export const POST = adminRoute(async (req, _ctx, session) => {
  await throttleOr429(`geocode:${session.user.id}`, 10);
  const { address } = geocodeInput.parse(emptyStringsToNull(await req.json()));

  const coords = await geocodeAddress(address, "us");
  if (!coords) {
    return Response.json(
      { success: false, message: "Couldn't find that address. Try a more specific one." },
      { status: 422 },
    );
  }
  return Response.json({
    success: true,
    latitude: coords.latitude,
    longitude: coords.longitude,
  });
});
