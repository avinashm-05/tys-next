// Site-wide WebSite structured data — one of the signals Google uses when
import { SITE_URL } from "@/lib/seo";
import { jsonLd } from "@/lib/json-ld";
// deciding whether to show sitelinks under the main search result. No
// SearchAction here: that specifically powers the sitelinks *search box*
// variant, which requires a real on-site search results page to point at —
// this site doesn't have one, so adding a SearchAction would describe a
// feature that doesn't exist. Plain sitelinks (the sub-link rows, no search
// box) don't need SearchAction at all — they come from clean site structure,
// BreadcrumbList markup, and real navigational authority over time.
export function WebsiteJsonLd() {
  const siteUrl = SITE_URL;

  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TYS Global Logistics",
    url: siteUrl,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
  );
}
