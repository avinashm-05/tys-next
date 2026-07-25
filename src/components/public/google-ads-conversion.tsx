"use client";

import Script from "next/script";

// Fires a Google Ads "lead submitted" conversion once the thank-you page
// mounts, so Ads can attribute a submitted quote back to the campaign/keyword
// that drove it. No-ops entirely when the env vars aren't set (e.g. local
// dev) — gtag.js never loads, so nothing breaks. `transactionId` (the quote
// id) dedupes an accidental page refresh from double-counting the same lead.
export function GoogleAdsConversion({ transactionId }: { transactionId?: string }) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (!adsId || !label) return null;

  const sendTo = `${adsId}/${label}`;
  const eventParams: Record<string, string> = { send_to: sendTo };
  if (transactionId) eventParams.transaction_id = transactionId;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`} strategy="afterInteractive" />
      <Script id="google-ads-conversion" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(adsId)});
gtag('event', 'conversion', ${JSON.stringify(eventParams)});`}
      </Script>
    </>
  );
}
