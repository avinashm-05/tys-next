import { clientIp } from "@/lib/client-ip";

// Health check — same URL Laravel exposed (02-routes). Deliberately does not
// touch the DB so a DB blip can't make the host restart-loop the app.
//
// `?ipcheck` (2026-09-30): echoes the caller's OWN forwarding headers and the
// IP the rate limiters would bucket them under, so TRUSTED_PROXY_HOPS can be
// verified against the real CDN chain in production (see src/lib/client-ip).
// It reveals nothing beyond what the caller already sent plus our proxies'
// appended hops; no-store so the CDN never caches one visitor's answer.
export function GET(req: Request) {
  if (new URL(req.url).searchParams.has("ipcheck")) {
    return Response.json(
      {
        xForwardedFor: req.headers.get("x-forwarded-for"),
        xRealIp: req.headers.get("x-real-ip"),
        trustedProxyHops: process.env.TRUSTED_PROXY_HOPS ?? "(unset, defaults to 1)",
        bucketedAs: clientIp(req),
        // Names only (2026-09-30): does the CDN add any location headers
        // (city/region/country)? If so, Clarity could get a city tag with no
        // third-party IP lookup. Values are the caller's own anyway.
        geoHeaders: [...req.headers.keys()].filter((k) => /geo|country|city|region|ipcountry|cf-|x-hcdn|x-hostinger/i.test(k)),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
  return new Response("OK");
}
