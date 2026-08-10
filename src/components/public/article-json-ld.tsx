// BlogPosting structured data for a blog post — gives search/AI answer
// engines the headline, author, and publish date directly instead of having
// to infer them from the page, and is what makes a post eligible for
// Google's article rich results.
export function ArticleJsonLd({
  headline,
  description,
  datePublished,
  slug,
  authorName = "Avinash",
}: {
  headline: string;
  description: string;
  datePublished: string;
  slug: string;
  authorName?: string;
}) {
  const siteUrl = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(/\/+$/, "");
  const url = `${siteUrl}/blog/${slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: new Date(datePublished).toISOString(),
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "TYS Global Logistics",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png`,
      },
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
