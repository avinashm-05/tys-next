// schema.org Service structured data for a /services/* page — makes the
// service eligible for rich results and gives AI answer engines a clean,
// unambiguous "this is a named service, offered by this provider" fact
// instead of having to infer it from prose.
export function ServiceJsonLd({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  const siteUrl = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(/\/+$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${siteUrl}/services/${slug}`,
    provider: {
      "@type": "MovingCompany",
      name: "TYS Global Logistics",
      url: siteUrl,
    },
    areaServed: "Worldwide",
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
