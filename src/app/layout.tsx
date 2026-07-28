import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

// Root layout is intentionally minimal — it owns only <html>/<body> + fonts.
// Tailwind (globals.css) and the theme/toaster providers live in
// (admin)/layout.tsx; the public site loads its own legacy stylesheet in
// (public)/layout.tsx. This keeps Tailwind's preflight off the public pages
// and the old site's global reset off admin (B1 CSS isolation).

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TYS Global Logistics",
    template: "%s",
  },
  description: "International shipping quotes and logistics services.",
  openGraph: {
    type: "website",
    siteName: "TYS Global Logistics",
    title: "TYS Global Logistics",
    description: "International shipping quotes and logistics services.",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    // "summary_large_image" matches the 1200x630 opengraph-image.png (Next's
    // file convention, src/app/opengraph-image.png) — Twitter/X reuses the
    // Open Graph image for this card type automatically, no separate
    // twitter-image file needed.
    card: "summary_large_image",
    title: "TYS Global Logistics",
    description: "International shipping quotes and logistics services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased", geistSans.variable, geistMono.variable)}
    >
      {/* suppressHydrationWarning: browser extensions inject attrs on <body>
          (bis_register, __processed_*) before hydration — cosmetic, not ours.
          Scoped to <body>'s own attrs, so real in-page mismatches still warn. */}
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
