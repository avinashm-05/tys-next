import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const siteUrl = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin + /api live on a separate host in production (proxy.ts),
        // but disallowed here too in case this file is ever crawled
        // directly. /account is private/behind auth — no indexable content.
        disallow: ["/admin", "/api", "/account", "/thank-you"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
