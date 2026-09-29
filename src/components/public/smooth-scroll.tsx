"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Smooth, eased scrolling on the public site (2026-09-29, the user asked for
// the TARAL site's feel, then a lighter touch). Lenis eases the wheel and
// trackpad into a glide, so arriving at the top or bottom of the page
// settles instead of stopping dead. Touch devices keep native scrolling.
//
// Anything that scrolls on its own inside the page (the country list, the
// mobile menu sheet) carries data-lenis-prevent, so the wheel scrolls it
// rather than the page behind. Off entirely for reduced-motion users.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Touch devices scroll natively (Lenis leaves touch alone), so on a
    // phone the library was just a permanently-running frame loop. Skip it.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    // In-page #links stay with HashScrollFix (it intercepts them first, in
    // the capture phase), so Lenis's own anchor handling is left off.
    // lerp 0.16 (was TARAL's 0.11): the page follows the wheel more closely,
    // so scrolling feels lighter, less like pushing something heavy.
    const lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 1.1, autoRaf: true });
    return () => lenis.destroy();
  }, []);
  return null;
}
