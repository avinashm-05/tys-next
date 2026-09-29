// Site-wide Organization/LocalBusiness structured data — helps search and AI
import { SITE_URL } from "@/lib/seo";
import { jsonLd } from "@/lib/json-ld";
// answer engines resolve who TYS Global Logistics is, where it's based, and
// how to contact it, independent of whatever page a crawler lands on first.
// Only verified facts (real address/phone/social links already live in the
// footer and /locations) — nothing fabricated (no ratings, hours, etc.).
export function OrganizationJsonLd() {
  const siteUrl = SITE_URL;

  const data = {
    "@context": "https://schema.org",
    // ["Organization", "LocalBusiness"], not "MovingCompany" (changed
    // 2026-08-21). MovingCompany told Google to rank this against local
    // household movers, when the business is primarily international
    // shipping and freight forwarding — the wrong competitive set entirely.
    // LocalBusiness is kept alongside Organization so the Atlanta address
    // still counts for local search, which is the one area a
    // freight-forwarder competitor can't structurally out-rank.
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${siteUrl}/#organization`,
    name: "TYS Global Logistics",
    url: siteUrl,
    logo: `${siteUrl}/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png`,
    telephone: "+1-404-793-8759",
    address: {
      "@type": "PostalAddress",
      streetAddress: "6111 Morgan Pl Ct NE",
      addressLocality: "Atlanta",
      addressRegion: "GA",
      postalCode: "30324",
      addressCountry: "US",
    },
    // Second office (India), added 2026-09-29. `address` above stays the US
    // head office; both offices are listed as locations.
    location: [
      {
        "@type": "Place",
        name: "TYS Global Logistics, US head office",
        address: {
          "@type": "PostalAddress",
          streetAddress: "6111 Morgan Pl Ct NE",
          addressLocality: "Atlanta",
          addressRegion: "GA",
          postalCode: "30324",
          addressCountry: "US",
        },
      },
      {
        "@type": "Place",
        name: "TYS Global Logistics, India office",
        address: {
          "@type": "PostalAddress",
          streetAddress: "406, Devashish Business Park, Premchand Nagar Rd, opposite Krishna Complex, Bodakdev",
          addressLocality: "Ahmedabad",
          addressRegion: "Gujarat",
          postalCode: "380015",
          addressCountry: "IN",
        },
      },
    ],
    areaServed: "US",
    // Tells answer engines what this business actually does, now that the
    // @type no longer says "mover".
    knowsAbout: [
      "International shipping",
      "Freight forwarding",
      "Parcel shipping",
      "Document shipping",
      "Package forwarding",
    ],
    sameAs: [
      "https://www.linkedin.com/company/tys-global-logistics/",
      "https://www.instagram.com/tysgloballogistics",
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
  );
}
