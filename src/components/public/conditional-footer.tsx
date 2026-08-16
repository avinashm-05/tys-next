"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/public/site-footer";

// The account portal (dashboard, quotes, shipments, profile, book-shipment)
// hides the shared footer — its own left sidebar is the only navigation
// there, and a marketing footer full of nav links underneath just adds
// confusion. Every other public page keeps it.
//
// /quotes (the public wizard, restored 2026-08-11) hides it too, added
// 2026-08-16: the wizard's own dark full-bleed section already reaches the
// bottom of the page, and a light marketing footer full of unrelated nav
// links directly under an in-progress form just added scroll and noise —
// nothing there helps someone mid-quote. `=== "/quotes"` (not startsWith)
// because /account/quotes is a distinct route already covered above, and
// there's no /quotes/[id] to worry about missing.
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/account")) return null;
  if (pathname?.startsWith("/book-shipment")) return null;
  if (pathname === "/quotes") return null;
  return <SiteFooter />;
}
