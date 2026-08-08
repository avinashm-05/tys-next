"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// next/link only reliably scrolls to a #hash target when the hash change
// comes bundled with an actual route transition. Clicking an href="/#x"
// link while already ON "/" is a same-route, hash-only "navigation" — Next's
// router doesn't consistently run its own scroll-to-hash logic for that
// case (confirmed live: clicking the header's "Get a Free Quote" button
// from the home page itself left both the URL and window.scrollY
// unchanged).
//
// A bubble-phase document listener alone isn't enough to fix this: React's
// own delegated click handler for the Link (which fires router.push) runs
// *before* a plain document-level bubble listener does, and that push —
// even though it's a same-path, hash-only "navigation" — still kicks off
// Next's route-transition machinery, which resets scroll position shortly
// after (confirmed live: manually calling scrollIntoView works fine in
// isolation, but doing the same inside a bubble-phase click handler gets
// silently undone a moment later by Next's own navigation effect). Using
// the capture phase + stopPropagation here means this runs *before* Next's
// Link handler ever sees the click at all, so no router.push happens and
// nothing fights the scroll afterward.
//
// This is exactly the situation every "Get a Quote" CTA site-wide is in
// now that the quote form lives in the home page hero (id="get-quote")
// instead of its own /quotes page — rather than patching every individual
// CTA's Link with its own onClick, one listener mounted once in the public
// layout covers all of them (plus any future same-page anchor link).
// Cross-page hash links (e.g. clicking "Get a Quote" from a service page)
// are untouched — Next's own navigation + the browser's native post-load
// hash scroll already handle that correctly.
export function HashScrollFix() {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest("a[href*='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href") ?? "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;
      const path = href.slice(0, hashIndex) || "/";
      const hash = href.slice(hashIndex + 1);
      if (!hash || path !== pathname) return;

      const el = document.getElementById(hash);
      if (!el) return;

      e.preventDefault();
      e.stopPropagation();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `${path}#${hash}`);
    }

    // capture: true — see the comment above on why this must run before
    // Next's own (bubble-phase) Link click handler.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}
