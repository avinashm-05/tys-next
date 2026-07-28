// schema.org BreadcrumbList — tells Google the page's position in the site
// hierarchy (Home > Services > Auto Transport). One of the structural
// signals behind Google generating sitelinks for a site, alongside WebSite
// markup and clean internal linking.
export type Crumb = { name: string; path: string };

export function BreadcrumbJsonLd({ crumbs }: { crumbs: readonly Crumb[] }) {
  const siteUrl = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(/\/+$/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteUrl}${c.path}`,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
