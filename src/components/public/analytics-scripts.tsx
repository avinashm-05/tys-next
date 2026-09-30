"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { NOT_LOCAL_HOST, NO_TRACKING_PATH } from "@/lib/tracking-guard";

// Site-wide analytics — GA4, Google Tag Manager, and Microsoft Clarity.
// Each is independently env-gated and no-ops (renders nothing) when its ID
// isn't set, same pattern as google-ads-conversion.tsx. Public pages only —
// rendered from (public)/layout.tsx, never loaded on /admin.
//
// Never on NO_TRACKING_PATH (account area, sign-in and password pages;
// privacy audit 2026-09-30). A visit that STARTS on one of those never loads
// the tags at all. A visit that starts on a public page and then navigates
// in-app to /account keeps the already-loaded scripts, so GA4/Ads hits are
// switched off with Google's documented `window['ga-disable-<ID>']` flag
// while there, and the account area is wrapped in data-clarity-mask so
// Clarity records no text from it.
export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const pathname = usePathname() ?? "";
  const blocked = NO_TRACKING_PATH.test(pathname);
  // Once the tags have been rendered, keep them mounted (unmounting a
  // next/script doesn't unload it; re-mounting could run it twice).
  const [loaded, setLoaded] = useState(!blocked);
  if (!blocked && !loaded) setLoaded(true);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    for (const id of [gaId, adsId]) if (id) w[`ga-disable-${id}`] = blocked;
  }, [blocked, gaId, adsId]);

  if (blocked && !loaded) return null;

  return (
    <>
      {/* ONE gtag.js load, configuring every Google product we use.
          gtag.js is a single library — the id in its URL only picks which
          container it bootstraps with, and every additional `config` call
          registers another destination on the same loaded script. We used to
          load it twice (once for GA4, once for Ads), which fetched the same
          ~100KB library again for no benefit and is what makes Tag Assistant
          report the same tag installed more than once. Verified live
          2026-08-21: three gtag.js requests were going out per page load. */}
      {/* Never on a local host (see lib/tracking-guard.ts): the gtag.js
          library itself is injected from inside the guard too. */}
      {(gaId || adsId) && (
        <Script id="gtag-init" strategy="afterInteractive">
          {`if (${NOT_LOCAL_HOST}) {
window.dataLayer = window.dataLayer || [];
window.gtag = function(){dataLayer.push(arguments);};
gtag('js', new Date());
${gaId ? `gtag('config', ${JSON.stringify(gaId)});` : ""}
${adsId ? `gtag('config', ${JSON.stringify(adsId)});` : ""}
var s = document.createElement('script'); s.async = true;
s.src = ${JSON.stringify(`https://www.googletagmanager.com/gtag/js?id=${gaId || adsId}`)};
document.head.appendChild(s);
}`}
        </Script>
      )}
      {/* The Google Ads base tag is configured by the single gtag block
          above, not by a second gtag.js load of its own. It still needs to be
          site-wide (not just the thank-you page) for remarketing/audience
          signals, and GoogleAdsConversion's thank-you-page event continues to
          reuse the gtag() global set up above.

          A second gtag/js?id=AW-...&gtm=... request appears in the network
          panel. That is NOT a duplicate installation: `&gtm=` is gtag.js's
          own version stamp and the request is gtag loading its Ads
          destination config, which happens with or without Tag Manager.
          Confirmed 2026-08-21 by reading the published GTM container
          directly (googletagmanager.com/gtm.js?id=GTM-K9W2ZDK2): its "tags"
          and "rules" arrays are both literally [] — container version 1,
          nothing configured — so GTM cannot be loading anything at all. */}
      {/* Google Tag Manager is NOT loaded here any more. It moved to the
          root layout (src/app/layout.tsx) so its snippet can sit in <head>
          where Google's install instructions require it — a nested layout
          cannot put anything there, whatever next/script strategy is used.
          Loading it in both places would install the container twice. */}
      {clarityId && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`if (${NOT_LOCAL_HOST}) (function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script",${JSON.stringify(clarityId)});`}
        </Script>
      )}
    </>
  );
}

// Pushes a GTM-visible conversion event on the thank-you page — separate
// from GoogleAdsConversion (which fires Ads' own gtag conversion directly).
// This just drops an event into the dataLayer so any tag/trigger configured
// in the GTM container (Meta Pixel, LinkedIn, a second Ads account, etc.)
// can react to it without another code change. No-ops if GTM isn't
// configured. `transactionId` (the quote id) lets a GTM trigger dedupe the
// same lead on an accidental page refresh, same as the Ads conversion does.
export function GtmConversionEvent({ transactionId }: { transactionId?: string }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) return null;
  return (
    <Script id="gtm-conversion-event" strategy="afterInteractive">
      {`if (${NOT_LOCAL_HOST}) {
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: 'generate_lead', transaction_id: ${JSON.stringify(transactionId ?? "")} });
}`}
    </Script>
  );
}
