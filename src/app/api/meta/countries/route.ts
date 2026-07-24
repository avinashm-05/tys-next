import { COUNTRY_LIST } from "@/lib/countries-list";

// Public country list for the Step 1 selects (ISO alpha-2 code + English name),
// cached forever — the list is static (ported from the original umpirsky data,
// via CountryListService). The wizard renders it at build time from the same
// module; this endpoint exists for parity / any client that wants it fresh.
const BODY = JSON.stringify({
  countries: COUNTRY_LIST.map(([code, name]) => ({ code, name })),
});

export function GET() {
  return new Response(BODY, {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
