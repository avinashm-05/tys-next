import { NavProgress } from "@/components/public/nav-progress";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { ConditionalHeader } from "@/components/public/conditional-header";
import { PROMO_KEY } from "@/lib/promo";
import { ConditionalFooter } from "@/components/public/conditional-footer";
import { OrganizationJsonLd } from "@/components/public/organization-json-ld";
import { WebsiteJsonLd } from "@/components/public/website-json-ld";
import { AnalyticsScripts } from "@/components/public/analytics-scripts";
import { HashScrollFix } from "@/components/public/hash-scroll-fix";
import { SmoothScroll } from "@/components/public/smooth-scroll";
import { RevealObserver } from "@/components/public/reveal-observer";

// Public brand fonts (B1 redesign) — Inter for body/UI, Oldschool Grotesk for
// display headings. Scoped to this layout only (via the .variable className
// on the wrapper below + the `.font-body` heading rule in globals.css) so
// admin's Geist fonts are untouched. Oldschool Grotesk only ships a Regular
// weight — bold/extrabold headings fall back to the browser's synthetic bold.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oldschoolGrotesk = localFont({
  src: "../../../public/frontend/assets/fonts/OldschoolGrotesk-Regular.woff",
  variable: "--font-oldschool-grotesk",
  display: "swap",
});

// Default title/description for every (public) page that doesn't set its
// own metadata export — currently just the homepage (page.tsx has none, so
// it inherits this verbatim as its <title>). Leads with the core service
// keywords, brand last — every other public page already follows this same
// "keyword | TYS Global Logistics" pattern with its own literal title.
export const metadata: Metadata = {
  title: "International Shipping & Freight Forwarding | TYS Global Logistics",
  description:
    "Trusted domestic and international logistics across the USA and worldwide. Get a free shipping quote in seconds.",
  // Renders as <meta name="google-site-verification" ...> — Next's own
  // convention for this rather than a hand-written meta tag. No-ops if unset.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

// Public (apex) layout — B1/B2 redesign. Tailwind only; the legacy
// Bootstrap/jQuery/select2/AOS stack (and PublicScripts, which loaded it) is
// retired here. Anything that used to depend on Bootstrap's JS
// (data-bs-toggle pill tabs, the FAQ accordion) is now a small client
// component using plain React state instead. Anonymous — no auth here.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      // min-h-screen, not min-h-full: `full` resolves against the nearest
      // ancestor with an explicit height, and neither html nor body sets one,
      // so on any page shorter than the viewport this wrapper stopped at its
      // own content height and left the browser's bare background showing
      // beneath it. `screen` is 100vh and needs no ancestor cooperation.
      className={`tone-bg flex min-h-screen flex-col overflow-x-clip font-body text-ink ${inter.variable} ${oldschoolGrotesk.variable}`}
    >
      {/* PageLoader removed 2026-09-29: it hid every page until the browser's
          load event (images, globe, analytics), up to 6s, hurting LCP and
          Ads landing-page experience. The stylesheet is render-blocking in
          <head>, so there's no unstyled flash for it to cover. */}
      <HashScrollFix />
      <NavProgress />
      <SmoothScroll />
      <RevealObserver />
      <AnalyticsScripts />
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      {/* Hides the promo bar before first paint if this browser closed it
          before. Without this the server-rendered bar showed, then vanished
          when scripts loaded, and the whole page jumped up 40px on every
          refresh (2026-09-30). Runs inline, ahead of the header markup. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(localStorage.getItem(${JSON.stringify(PROMO_KEY)}))document.documentElement.setAttribute("data-promo","off")}catch(e){}`,
        }}
      />
      <ConditionalHeader />
      <main className="flex-1">{children}</main>
      <ConditionalFooter />
    </div>
  );
}
