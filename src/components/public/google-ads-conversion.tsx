"use client";

import Script from "next/script";

// Fires a Google Ads "lead submitted" conversion once the thank-you page
// mounts, so Ads can attribute a submitted quote back to the campaign/keyword
// that drove it. Reuses the gtag() global already set up site-wide by
// AnalyticsScripts's Google Ads base tag — no-ops entirely when the
// conversion label isn't set (e.g. local dev). `transactionId` (the quote
// id) dedupes an accidental page refresh from double-counting the same lead.
export function GoogleAdsConversion({ transactionId }: { transactionId?: string }) {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (!adsId || !label) return null;

  const sendTo = `${adsId}/${label}`;
  const eventParams: Record<string, string> = { send_to: sendTo };
  if (transactionId) eventParams.transaction_id = transactionId;

  return (
    <Script id="google-ads-conversion" strategy="afterInteractive">
      {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('event', 'conversion', ${JSON.stringify(eventParams)});`}
    </Script>
  );
}
