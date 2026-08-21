// Site-wide Organization/LocalBusiness structured data — helps search and AI
// answer engines resolve who TYS Global Logistics is, where it's based, and
// how to contact it, independent of whatever page a crawler lands on first.
// Only verified facts (real address/phone/social links already live in the
// footer and /locations) — nothing fabricated (no ratings, hours, etc.).
export function OrganizationJsonLd() {
  const siteUrl = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(/\/+$/, "");

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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
