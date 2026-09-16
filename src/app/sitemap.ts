import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const siteUrl = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(
  /\/+$/,
  "",
);

// Real, public, indexable marketing routes only — /account/*, /thank-you,
// and everything under /admin + /api are excluded (see robots.ts).
//
// Also deliberately absent: /sitemap and /contact-us/pay. Both are thin by
// nature (31 and 24 words) and are now marked `robots: { index: false }` on
// the pages themselves — a URL we ask Google not to index should not also be
// advertised here, which would be a contradictory signal.
const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about-us", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  // /book-shipment temporarily excluded — see the matching note in
  // site-header.tsx. Re-add when the page is linked again.
  { path: "/carriers", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact-us", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact-us/support", priority: 0.4, changeFrequency: "monthly" },
  { path: "/destinations", priority: 0.7, changeFrequency: "monthly" },
  { path: "/destinations/moving", priority: 0.6, changeFrequency: "monthly" },
  // Per-country landing pages, added 2026-08-21 against the highest-volume
  // "ship to <country>" queries the keyword research surfaced.
  { path: "/destinations/canada", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/india", priority: 0.8, changeFrequency: "monthly" },
  { path: "/destinations/uk", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faqs", priority: 0.6, changeFrequency: "monthly" },
  // Brand defence — answers "is TYS Global Logistics legit", which people
  // search before paying a company they haven't used before.
  { path: "/is-tys-global-logistics-legit", priority: 0.5, changeFrequency: "yearly" },
  { path: "/locations", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  // Highest priority after the homepage: this is the landing page every paid
  // ad points at. It was missing from the sitemap entirely until 2026-08-21,
  // so Google had no way to discover it except by following an internal link.
  { path: "/quotes", priority: 1, changeFrequency: "weekly" },
  { path: "/resources", priority: 0.6, changeFrequency: "monthly" },
  { path: "/resources/customs-duty", priority: 0.5, changeFrequency: "monthly" },
  { path: "/resources/prohibited-items", priority: 0.5, changeFrequency: "monthly" },
  { path: "/resources/volumetric-weight", priority: 0.5, changeFrequency: "monthly" },
  { path: "/security", priority: 0.2, changeFrequency: "yearly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/shipping-rates", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/auto-transport", priority: 0.7, changeFrequency: "monthly" },
  // Highest-volume gap in the research (~70.5k/mo) with no competing page.
  { path: "/services/baggage-shipping", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/document-shipping", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/domestic-moving", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/domestic-shipping", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/freight-forwarding", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/global-shopper", priority: 0.7, changeFrequency: "monthly" },
  {
    path: "/services/international-relocation",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  { path: "/services/parcel-shipping", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/retailer-shipping", priority: 0.7, changeFrequency: "monthly" },
  { path: "/services/volume-shipping", priority: 0.7, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/tracking", priority: 0.7, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // The sitemap is prerendered at build time, so this query runs from
  // Hostinger's build container. The shared MySQL host intermittently
  // refuses connections (see db.ts), and on 2026-09-16 that failed the
  // whole deploy from here — the same way blog/[slug]'s
  // generateStaticParams did on 2026-09-14. A sitemap missing the blog
  // posts is a shortcoming; a build that can't ship a quote-form fix
  // because of it is an outage.
  let posts: { slug: string; updatedAt: Date | null }[] = [];
  try {
    posts = await db.post.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });
  } catch (err) {
    console.warn(
      "[build] Could not reach the database for sitemap blog entries; emitting static routes only:",
      err instanceof Error ? `${err.name}: ${err.message}` : err,
    );
  }
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
