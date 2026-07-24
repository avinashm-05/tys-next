import { FedExError, type FedExRequester } from "@/lib/fedex/client";

// Port of App\Services\FedEx\FedExPostalValidationService. Only used when
// FEDEX_POSTAL_VALIDATION_ENABLED is on (off in prod); the wizard never calls
// it (its Step 1 zip check is the client regex). ponytail: the original also
// ran a local per-country PostalCodeFormat pre-check — skipped here (a big
// per-country regex table for a gated-off feature); FedEx validates server-side
// anyway. Add the local pre-check if the feature is turned on and needs it.

export type PostalValidationResult =
  | { valid: true; cleaned_postal_code: string; location_details: unknown }
  | { valid: false; message: string };

type Json = Record<string, unknown>;

function resolveResponseErrors(response: Json): string | null {
  for (const error of (response.errors as { message?: string }[] | undefined) ?? []) {
    if (error?.message) return error.message;
  }
  const output = (response.output as Json | undefined) ?? {};
  for (const alert of (output.alerts as { alertType?: string; message?: string }[] | undefined) ?? []) {
    if (alert?.alertType === "ERROR" && alert.message) return alert.message;
  }
  return null;
}

export async function validatePostalCode(
  client: FedExRequester,
  countryCode: string,
  postalCode: string,
): Promise<PostalValidationResult> {
  // shipDate = now + 10 days (UTC), YYYY-MM-DD (matches the original).
  const shipDate = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);
  const payload = {
    carrierCode: process.env.FEDEX_CARRIER_CODE ?? "FDXG",
    countryCode,
    stateOrProvinceCode: "",
    postalCode,
    shipDate,
  };

  try {
    const response = await client.request("POST", "country/v1/postal/validate", payload, {
      "X-locale": process.env.FEDEX_LOCALE ?? "en_US",
    });
    const formatError = resolveResponseErrors(response);
    if (formatError !== null) return { valid: false, message: formatError };

    const output = (response.output as Json | undefined) ?? {};
    const cleaned = String(output.cleanedPostalCode ?? "").trim();
    if (cleaned === "") {
      return { valid: false, message: "Invalid postal code for the selected country." };
    }
    return {
      valid: true,
      cleaned_postal_code: cleaned,
      location_details: output.locationDetail ?? output.locationDetails ?? [],
    };
  } catch (e) {
    if (e instanceof FedExError) {
      return { valid: false, message: resolveResponseErrors(e.errorBody) ?? e.message };
    }
    throw e;
  }
}
