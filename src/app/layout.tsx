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

// Google Tag Manager lives HERE, in the root layout, rather than with the
// rest of the analytics in (public)/layout.tsx — because Google's install
// instructions require the snippet "as high in the <head> as possible", and
// only the root layout can put anything there. Verified empirically
// (2026-08-21): next/script with strategy="beforeInteractive" from the nested
// public layout still lands after </head>, so the strategy prop alone can't
// satisfy this. GTM is the container everything else loads through, so its
// timing sets the floor for every tag inside it.
//
// The root layout is shared with /admin, and staff activity has no business
// in the marketing analytics. Rather than read headers() to detect the route
// — which would opt the entire app out of static rendering, for ~30 pages
// that are currently prerendered — the snippet guards itself on
// location.pathname at execution time. Same effect, no rendering cost.
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const GTM_SNIPPET = gtmId
  ? `if(!location.pathname.startsWith('/admin')){(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});}`
  : null;

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
      <head>
        {/* Must stay the first thing in <head> — see the note above. */}
        {GTM_SNIPPET && (
          <script dangerouslySetInnerHTML={{ __html: GTM_SNIPPET }} />
        )}
      </head>
      {/* suppressHydrationWarning: browser extensions inject attrs on <body>
          (bis_register, __processed_*) before hydration — cosmetic, not ours.
          Scoped to <body>'s own attrs, so real in-page mismatches still warn. */}
      <body className="min-h-full" suppressHydrationWarning>
        {/* GTM's <noscript> fallback, immediately after <body> opens exactly
            as Google specifies. It previously sat one wrapper <div> deep
            inside the public layout, which works but isn't what the install
            instructions ask for. Harmless on /admin: it only renders at all
            when JavaScript is disabled, and the admin app requires JS. */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
