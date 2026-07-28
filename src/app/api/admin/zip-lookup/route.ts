import { z } from "zod";
import { adminRoute } from "@/lib/auth";
import { lookupCityByPostalCode } from "@/lib/geocoding";
import { emptyStringsToNull } from "@/lib/validation/common";
import { throttleOr429 } from "../vendors/helpers";

const zipLookupInput = z.object({
  postal_code: z.string().min(1).max(20),
  country: z.string().min(2).max(2),
});

/**
 * Get Rates' zip → city auto-fill. Server-side so the browser never needs a
 * third-party host added to the CSP — same Nominatim provider and rate-limit
 * pattern as /api/admin/geocode.
 */
export const POST = adminRoute(async (req, _ctx, session) => {
  await throttleOr429(`zip-lookup:${session.user.id}`, 20);
  const { postal_code, country } = zipLookupInput.parse(emptyStringsToNull(await req.json()));

  const city = await lookupCityByPostalCode(postal_code, country);
  return Response.json({ city });
});
