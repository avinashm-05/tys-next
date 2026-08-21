"use client";

import Script from "next/script";

// Site-wide analytics — GA4, Google Tag Manager, and Microsoft Clarity.
// Each is independently env-gated and no-ops (renders nothing) when its ID
// isn't set, same pattern as google-ads-conversion.tsx. Public pages only —
// rendered from (public)/layout.tsx, never loaded on /admin.
export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

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
      {(gaId || adsId) && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId || adsId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gaId ? `gtag('config', ${JSON.stringify(gaId)});` : ""}
${adsId ? `gtag('config', ${JSON.stringify(adsId)});` : ""}`}
          </Script>
        </>
      )}
      {/* The Google Ads base tag is configured by the single gtag block
          above, not by a second gtag.js load of its own. It still needs to be
          site-wide (not just the thank-you page) for remarketing/audience
          signals, and GoogleAdsConversion's thank-you-page event continues to
          reuse the gtag() global set up above.

          NOTE: the GTM container ALSO loads this same Ads ID (observed live
          as gtag/js?id=AW-...&gtm=4e68j0). That is a genuine duplicate
          installation and needs resolving in ONE of the two places — either
          remove the Google Ads tag from the GTM container, or drop adsId
          here and let GTM own it entirely. It can't be fixed from code alone
          without knowing which the container is configured to do. */}
      {/* Google Tag Manager is NOT loaded here any more. It moved to the
          root layout (src/app/layout.tsx) so its snippet can sit in <head>
          where Google's install instructions require it — a nested layout
          cannot put anything there, whatever next/script strategy is used.
          Loading it in both places would install the container twice. */}
      {clarityId && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
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
      {`window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: 'generate_lead', transaction_id: ${JSON.stringify(transactionId ?? "")} });`}
    </Script>
  );
}
