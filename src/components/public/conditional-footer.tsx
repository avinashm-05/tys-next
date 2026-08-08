"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/public/site-footer";

// The account portal (dashboard, quotes, shipments, profile, book-shipment)
// hides the shared footer — its own left sidebar is the only navigation
// there, and a marketing footer full of nav links underneath just adds
// confusion. Every other public page keeps it. (/quotes itself no longer
// needs a special case here — it's just a redirect now, see that route's
// own comment, so nothing ever actually renders with this footer absent.)
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/account")) return null;
  if (pathname?.startsWith("/book-shipment")) return null;
  return <SiteFooter />;
}
