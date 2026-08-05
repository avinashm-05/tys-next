import { adminRoute } from "@/lib/auth";
import { lookupZipInfo } from "@/lib/geocoding";

// Quick zip → city/state/timezone glance for the quote detail editor's
// From/To cards. Works for any country — US via the instant static table,
// everything else via the same Nominatim geocoder already used for vendor
// addresses (cached 30 days either way).
export const GET = adminRoute(async (req) => {
  const { searchParams } = new URL(req.url);
  const zip = (searchParams.get("zip") ?? "").trim();
  const country = (searchParams.get("country") ?? "").trim();

  const info = zip && country ? await lookupZipInfo(zip, country) : null;
  return Response.json(info ?? { city: null, state: null, timezone: null });
});
