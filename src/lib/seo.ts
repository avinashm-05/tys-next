import type { Metadata } from "next";

// One place that knows the site's public origin, so canonical URLs can never
// drift from what the sitemap and JSON-LD emit. Mirrors sitemap.ts exactly.
// Production serves the bare domain (src/proxy.ts 308s www to it), so the
// default is the apex too: a build without APP_URL must never emit
// canonicals that point at a redirect. Everything else imports this.
export const SITE_URL = (
  process.env.APP_URL ?? "https://tysgloballogistics.com"
).replace(/\/+$/, "");

/**
 * Builds a page's `Metadata` with a self-referencing canonical attached.
 *
 * Every public page needed one and none had one (audited 2026-08-21). Without
 * a canonical, each URL variation — a trailing slash, `?utm_source=...`, www
 * vs bare — reads to a crawler as a separate page competing with the original.
 * That matters most the day paid traffic starts, because every ad click
 * arrives carrying UTM parameters, so the ad landing page would otherwise
 * fragment into as many "pages" as there are campaigns.
 *
 * `path` is the route as it appears in the URL, leading slash included ("/"
 * for the homepage). Next resolves `alternates.canonical` against
 * metadataBase, so this stays correct if the domain ever changes.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
  ...rest
}: {
  title: string;
  description?: string;
  path: string;
  noIndex?: boolean;
} & Omit<Metadata, "title" | "description" | "alternates" | "robots">): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    // Each page's own social preview (they all used to show the home page's
    // title and URL, because only the root layout set openGraph).
    openGraph: {
      type: "website",
      siteName: "TYS Global Logistics",
      locale: "en_US",
      title,
      ...(description ? { description } : {}),
      url,
      // Explicit, not the app/opengraph-image.png file convention: Next
      // wasn't emitting any og:image tag from it (checked live and local,
      // 2026-09-30), so shares showed no picture. Resolved against
      // metadataBase.
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "TYS Global Logistics" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
      images: ["/opengraph-image.png"],
    },
    // Thin, utility pages (a link index, a payment hand-off) are better kept
    // out of the index than padded with filler to reach a word count.
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    ...rest,
  };
}
