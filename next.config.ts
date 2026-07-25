import type { NextConfig } from "next";

// Google Ads/Analytics hosts used by GoogleAdsConversion (src/components/
// public/google-ads-conversion.tsx) — inert until NEXT_PUBLIC_GOOGLE_ADS_ID
// is set, but allowed here so the CSP doesn't silently break it once it is.
const GOOGLE_AD_HOSTS =
  "https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.g.doubleclick.net https://www.google.com https://*.googleadservices.com";

// Dev needs 'unsafe-eval' for webpack HMR; production doesn't. script-src
// keeps 'unsafe-inline' for next/script's inline gtag bootstrap snippet — a
// nonce-based CSP would drop that too, but touches proxy.ts + the root
// layout and is a follow-up, not part of this pass.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}${GOOGLE_AD_HOSTS}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://tile.openstreetmap.org ${GOOGLE_AD_HOSTS}`,
  "font-src 'self' data:",
  `connect-src 'self' ${GOOGLE_AD_HOSTS}`,
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
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Only takes effect over HTTPS (production) — harmless no-op on local HTTP.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Standalone output: `next build` also emits .next/standalone, a
  // self-contained server (server.js + only the production node_modules it
  // actually needs) — the whole point being a manual-upload deploy target
  // that doesn't need `npm install` or a Git connection on the host at all.
  // Doesn't affect `next dev` or a normal `next start` deploy either.
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
