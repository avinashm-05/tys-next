// schema.org Service structured data for a /services/* page — makes the
import { SITE_URL } from "@/lib/seo";
import { jsonLd } from "@/lib/json-ld";
// service eligible for rich results and gives AI answer engines a clean,
// unambiguous "this is a named service, offered by this provider" fact
// instead of having to infer it from prose.
export function ServiceJsonLd({
  name,
  description,
  slug,
  domestic = false,
}: {
  name: string;
  description: string;
  slug: string;
  /** US-only services (domestic moving/shipping, piano moving). */
  domestic?: boolean;
}) {
  const siteUrl = SITE_URL;

  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${siteUrl}/services/${slug}`,
    // Points at the site-wide Organization node (organization-json-ld.tsx)
    // rather than restating a different @type for the same company.
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: domestic ? "US" : "Worldwide",
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
  );
}
