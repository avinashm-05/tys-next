"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { quoteHref } from "@/lib/quote-context";

// A "Get a free quote" link that carries the current page's context (see
// src/lib/quote-context.ts), so the wizard opens pre-filled. Used by the
// header, the phone menu and the bottom CTA band, which are shared
// components that otherwise wouldn't know which page they're on.
export function QuoteLink(props: Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();
  return <Link {...props} href={quoteHref(pathname)} />;
}
