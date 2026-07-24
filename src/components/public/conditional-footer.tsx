"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/public/site-footer";

// The quote wizard route has no footer per the Figma quote-page design — the
// wizard is meant to be the only thing on screen below the header. Every
// other public page keeps the shared footer.
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/quotes")) return null;
  return <SiteFooter />;
}
