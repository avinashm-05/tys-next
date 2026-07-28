"use client";

import Script from "next/script";

// Site-wide analytics — GA4, Google Tag Manager, and Microsoft Clarity.
// Each is independently env-gated and no-ops (renders nothing) when its ID
// isn't set, same pattern as google-ads-conversion.tsx. Public pages only —
// rendered from (public)/layout.tsx, never loaded on /admin.
export function AnalyticsScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)});`}
          </Script>
        </>
      )}
      {gtmId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
        </Script>
      )}
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

// GTM's <noscript> fallback pixel — Google's own guidance is to place this
// immediately after <body> opens. The root layout (src/app/layout.tsx) owns
// the actual <body> tag and is shared with /admin, so this renders instead
// as the first element of the public layout's wrapper — as close to "top of
// body" as achievable while staying scoped to public pages only.
export function GtmNoscript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
