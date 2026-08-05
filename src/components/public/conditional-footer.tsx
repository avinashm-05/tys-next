"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/public/site-footer";

// The quote wizard route has no footer per the Figma quote-page design — the
// wizard is meant to be the only thing on screen below the header. The
// account portal (dashboard, quotes, shipments, profile, book-shipment) also
// hides it — its own left sidebar is the only navigation there, and a
// marketing footer full of nav links underneath just adds confusion. Every
// other public page keeps the shared footer.
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/quotes")) return null;
  if (pathname?.startsWith("/account")) return null;
  if (pathname?.startsWith("/book-shipment")) return null;
  return <SiteFooter />;
}
