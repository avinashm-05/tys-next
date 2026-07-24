import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { SiteHeader } from "@/components/public/site-header";
import { ConditionalFooter } from "@/components/public/conditional-footer";

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

export const metadata: Metadata = {
  title: "TYS Global Logistics — Ship Anything, Anywhere On Time",
  description:
    "Trusted domestic and international logistics across the USA and worldwide. Get a free shipping quote in seconds.",
};

// Public (apex) layout — B1/B2 redesign. Tailwind only; the legacy
// Bootstrap/jQuery/select2/AOS stack (and PublicScripts, which loaded it) is
// retired here. Anything that used to depend on Bootstrap's JS
// (data-bs-toggle pill tabs, the FAQ accordion) is now a small client
// component using plain React state instead. Anonymous — no auth here.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`flex min-h-full flex-col bg-white font-body text-ink ${inter.variable} ${oldschoolGrotesk.variable}`}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <ConditionalFooter />
    </div>
  );
}
