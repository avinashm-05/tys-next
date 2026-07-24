import { z } from "zod";
import { publicApiRoute } from "@/lib/public-route";
import { emptyStringsToNull } from "@/lib/validation/common";
import { FedExClient } from "@/lib/fedex/client";
import { validatePostalCode } from "@/lib/fedex/postal-validation";

// Public port of QuoteController@validatePostal (30/min, same-origin).
// Gated by FEDEX_POSTAL_VALIDATION_ENABLED (off in prod): when off it's a
// no-op that echoes the postal code back, and the client relies on its Step 1
// regex pre-check. The wizard never calls this — it's here for parity.
const validatePostalInput = z.object({
  country_code: z
    .string({ error: () => "Country code is required." })
    .length(2, "Country code must be a 2-letter ISO code."),
  postal_code: z
    .string({ error: () => "Postal code is required." })
    .min(3, "Postal code must be at least 3 characters.")
    .max(20, "Postal code must not exceed 20 characters."),
});

export const POST = publicApiRoute({ name: "quotes:validate-postal", limit: 30 }, async (req) => {
  const data = validatePostalInput.parse(emptyStringsToNull(await req.json()));

  // Feature flag mirrors config('fedex.postal_validation_enabled') (default off).
  if ((process.env.FEDEX_POSTAL_VALIDATION_ENABLED ?? "false").toLowerCase() !== "true") {
    return Response.json({ valid: true, cleaned_postal_code: data.postal_code, location: [] });
  }

  const result = await validatePostalCode(new FedExClient(), data.country_code, data.postal_code);
  if (!result.valid) {
    return Response.json({ valid: false, message: result.message }, { status: 422 });
  }
  return Response.json({
    valid: true,
    cleaned_postal_code: result.cleaned_postal_code,
    location: result.location_details,
  });
});
