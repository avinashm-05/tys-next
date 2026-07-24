import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { PublicScripts } from "@/components/public/public-scripts";

export const metadata: Metadata = {
  title: "TYS Global Logistics — Ship Anything, Anywhere On Time",
  description:
    "Trusted domestic and international logistics across the USA and worldwide. Get a free shipping quote in seconds.",
};

// Public (apex) layout. Loads the legacy site's own stylesheets — via raw
// <link> to the static /public files so their relative font/image url()s
// resolve exactly as before and Turbopack/Tailwind never rewrites them. Root
// layout intentionally omits Tailwind (globals.css), so the old CSS's global
// reset can't collide with preflight. Anonymous — no auth anywhere here.
//
// Same-precedence stylesheets stay in render order (React 19), reproducing the
// original <head> cascade: bootstrap → font-awesome → select2 → style → aos.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        precedence="tys"
        href="/frontend/assets/style/bootstrap/css/bootstrap5.1.3.css"
      />
      <link
        rel="stylesheet"
        precedence="tys"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link
        rel="stylesheet"
        precedence="tys"
        href="/frontend/assets/style/Selectsearch/select2.min.css"
      />
      <link rel="stylesheet" precedence="tys" href="/frontend/assets_v1/style/style.css?v=1.1" />
      <link rel="stylesheet" precedence="tys" href="/frontend/assets/style/animation/aos.css" />
      <link rel="stylesheet" precedence="tys" href="/frontend/tys-inline.css" />
      <link rel="stylesheet" precedence="tys" href="/frontend/tys-quotes-inline.css" />

      <div className="body" id="smooth-content">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
      <PublicScripts />
    </>
  );
}
