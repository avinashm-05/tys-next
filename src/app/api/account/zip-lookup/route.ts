import { customerRoute } from "@/lib/auth";
import { lookupZipInfo } from "@/lib/geocoding";

// Customer-facing counterpart to the admin's zip-lookup route — used by the
// Profile form to auto-fill City/State once a zip/postal code + country are
// entered. Same lookupZipInfo() helper (US via the instant static table,
// everything else via the cached Nominatim geocoder).
export const GET = customerRoute(async (req) => {
  const { searchParams } = new URL(req.url);
  const zip = (searchParams.get("zip") ?? "").trim();
  const country = (searchParams.get("country") ?? "").trim();

  const info = zip && country ? await lookupZipInfo(zip, country) : null;
  return Response.json(info ? { city: info.city, state: info.state } : { city: null, state: null });
});
