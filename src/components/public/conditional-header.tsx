"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/public/site-header";
import { PORTAL_PATH } from "@/lib/portal-paths";

// The customer portal has its own slim top bar (account/(portal)/layout),
// so the marketing header and promo bar step aside there, like the footer
// does (conditional-footer.tsx).
export function ConditionalHeader() {
  const pathname = usePathname() ?? "";
  if (PORTAL_PATH.test(pathname)) return null;
  return <SiteHeader />;
}
