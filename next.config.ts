import type { NextConfig } from "next";

// Google Ads/Analytics hosts used by GoogleAdsConversion (src/components/
// public/google-ads-conversion.tsx) — inert until NEXT_PUBLIC_GOOGLE_ADS_ID
// is set, but allowed here so the CSP doesn't silently break it once it is.
const GOOGLE_AD_HOSTS =
  "https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.g.doubleclick.net https://www.google.com https://*.googleadservices.com";

// Microsoft Clarity (src/components/public/analytics-scripts.tsx) was never
// added here — its script-src was silently blocked by the CSP the whole
// time (confirmed live, 2026-08-06: "violates ... script-src directive ...
// The action has been blocked", browser console). *.clarity.ms is needed
// too — Clarity's own event-collection requests (not just the initial tag
// script) go out over rotating subdomains, not just www.
const CLARITY_HOSTS = "https://www.clarity.ms https://*.clarity.ms";

// Dev needs 'unsafe-eval' for webpack HMR; production doesn't. script-src
// keeps 'unsafe-inline' for next/script's inline gtag bootstrap snippet — a
// nonce-based CSP would drop that too, but touches proxy.ts + the root
// layout and is a follow-up, not part of this pass.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}${GOOGLE_AD_HOSTS} ${CLARITY_HOSTS}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://tile.openstreetmap.org ${GOOGLE_AD_HOSTS}`,
  "font-src 'self' data:",
  // api.zippopotam.us backs the zip/postal-code suggestions under the quote
  // form's From/To Zip fields (postal-code-input.tsx). It was never in
  // connect-src, so every lookup was blocked outright ("Refused to connect
  // because it violates the document's Content Security Policy"). The field
  // degrades silently by design — it's a confirmation aid, not a validation
  // gate — which is why this went unnoticed until the console was read
  // directly, 2026-08-16.
  `connect-src 'self' https://api.zippopotam.us ${GOOGLE_AD_HOSTS} ${CLARITY_HOSTS}`,
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Only takes effect over HTTPS (production) — harmless no-op on local HTTP.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Flagged by Lighthouse Best Practices ("Ensure proper origin isolation
  // with COOP" — no header found). same-origin-allow-popups (not the
  // stricter same-origin) since nothing here relies on cross-origin popup
  // communication today, but this still isolates the tab from any
  // cross-origin opener reaching in.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

// Flagged by Lighthouse ("Use efficient cache lifetimes" — Est savings 988
// KiB, every /frontend/* asset shows "Cache TTL: None"). These are static,
// filename-stable assets (not the hashed /_next/static/* chunks, which Next
// already long-caches by default) — the deploy workflow already manually
// purges the Hostinger CDN cache after every deploy (see
// project_hostinger_deploy_gotchas memory), so a stale asset never lingers
// past a deploy; immutable long-cache just formalizes that.
const staticAssetCacheHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

// Microsoft Clarity session replays were rendering the public pages with no
// layout at all (reported 2026-08-09). Clarity replays the captured DOM from
// clarity.microsoft.com and pulls the stylesheets back off this origin — a
// cross-origin read, and confirmed live that /_next/static/chunks/*.css came
// back 200 with no Access-Control-Allow-Origin, so the replayer can't read
// them and falls back to unstyled markup. These are hashed, public, static
// build assets with no user data and no cookies involved, so a wildcard ACAO
// gives away nothing that a plain GET didn't already. Applied to the fonts
// too, which need CORS for the same reason in any cross-origin context.
const crossOriginReadableHeaders = [{ key: "Access-Control-Allow-Origin", value: "*" }];

// Never let a CDN or proxy store anything behind authentication.
//
// Hostinger's CDN (server: hcdn) applies `s-maxage=31536000` to PAGE
// responses by default — confirmed live on /login, 2026-09-14 — and its
// `Vary` is only `Accept-Encoding`, so it does NOT differentiate by cookie.
// That combination broke admin sign-in outright: the CDN cached the
// anonymous `/admin` → `/login` 307, then replayed that same redirect to a
// signed-in admin, who bounced back to the login page forever while the
// server was happily creating sessions (30 of them, in the reported case).
//
// The redirect being cached is the visible symptom; the real hazard is the
// same mechanism caching an authenticated admin PAGE and serving its HTML —
// quotes, customer contact details, shipment data — to whoever asks next.
//
// `private` bars shared caches outright, `no-store` bars storing the body at
// all, and `Vary: Cookie` is belt-and-braces for any intermediary that
// honours Vary but ignores the rest. Applied to the admin surfaces and to
// every auth endpoint, never to the public marketing pages, which SHOULD
// stay CDN-cached.
const noStoreHeaders = [
  { key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" },
  { key: "Vary", value: "Cookie" },
  // None of these (staff pages, sign-in pages, account area, APIs) belong in
  // search results. A header, not robots.txt: listing staff paths in
  // robots.txt would advertise them.
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  // Standalone output: `next build` also emits .next/standalone, a
  // self-contained server (server.js + only the production node_modules it
  // actually needs) — the whole point being a manual-upload deploy target
  // that doesn't need `npm install` or a Git connection on the host at all.
  // Doesn't affect `next dev` or a normal `next start` deploy either.
  //
  // Skipped on Vercel: Vercel builds Next with its own serverless adapter and
  // standalone fights it. `VERCEL=1` is set by their build environment, so
  // Hostinger (the real deploy target) is unaffected.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  // Hostinger builds on a shared plan whose 120-process cap is shared by all
  // 10 sites (see memory: hostinger max processes). Turbopack's production
  // build spawns helper Node processes (e.g. for PostCSS) and died with
  // "node process exited before we could connect to it" on 2026-09-30, twice.
  // So `npm run build` uses webpack (package.json, --webpack), which runs
  // PostCSS in-process, and page generation is capped at 2 workers instead
  // of one per CPU. `next dev` still uses Turbopack locally.
  experimental: { cpus: 2 },
  images: {
    // Default is 60s — these source assets barely ever change and the CDN
    // cache is purged manually on every deploy anyway, so there's no need
    // for next/image's own optimizer cache to expire this fast.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Order matters: these come before the static-asset rules so nothing
      // downstream can re-cache an admin surface.
      { source: "/admin/:path*", headers: noStoreHeaders },
      { source: "/admin", headers: noStoreHeaders },
      { source: "/login", headers: noStoreHeaders },
      { source: "/forgot-password", headers: noStoreHeaders },
      { source: "/reset-password", headers: noStoreHeaders },
      { source: "/two-step", headers: noStoreHeaders },
      { source: "/api/auth/:path*", headers: noStoreHeaders },
      { source: "/api/admin/:path*", headers: noStoreHeaders },
      { source: "/account/:path*", headers: noStoreHeaders },
      { source: "/account", headers: noStoreHeaders },
      // Session-dependent (privacy audit 2026-09-30): renders differently
      // for a signed-in customer; account APIs are session-scoped.
      { source: "/book-shipment", headers: noStoreHeaders },
      { source: "/api/account/:path*", headers: noStoreHeaders },
      { source: "/frontend/:path*", headers: staticAssetCacheHeaders },
      { source: "/_next/static/:path*", headers: crossOriginReadableHeaders },
      { source: "/frontend/:path*", headers: crossOriginReadableHeaders },
    ];
  },
};

export default nextConfig;
