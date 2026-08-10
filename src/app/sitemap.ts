import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const siteUrl = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(
  /\/+$/,
  "",
);

// Real, public, indexable marketing routes only — /account/*, /thank-you,
// and everything under /admin + /api are excluded (see robots.ts).
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
  { path: "/contact-us/pay", priority: 0.3, changeFrequency: "yearly" },
  { path: "/contact-us/support", priority: 0.4, changeFrequency: "monthly" },
  { path: "/destinations", priority: 0.7, changeFrequency: "monthly" },
  { path: "/destinations/moving", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faqs", priority: 0.6, changeFrequency: "monthly" },
  { path: "/locations", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/resources", priority: 0.6, changeFrequency: "monthly" },
  { path: "/resources/customs-duty", priority: 0.5, changeFrequency: "monthly" },
  { path: "/resources/prohibited-items", priority: 0.5, changeFrequency: "monthly" },
  { path: "/resources/volumetric-weight", priority: 0.5, changeFrequency: "monthly" },
  { path: "/security", priority: 0.2, changeFrequency: "yearly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services/auto-transport", priority: 0.7, changeFrequency: "monthly" },
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
  { path: "/sitemap", priority: 0.2, changeFrequency: "yearly" },
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

  const posts = await db.post.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
  });
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
