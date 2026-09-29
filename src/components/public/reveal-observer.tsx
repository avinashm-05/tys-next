"use client";

import { useEffect } from "react";

// Sharpens each .reveal element once, as it crosses a line 10% above the
// bottom of the screen (see Reveal and .reveal in globals.css). Mounted once
// in the public layout.
//
// It keeps watching the page for .reveal elements that appear later, or
// lose their .is-in when React re-renders them: route changes, streamed
// content, hot reload. Missing those left headings stuck invisible (seen
// 2026-09-29 on the home page's night band). Anything already on screen
// when it's found is shown immediately, with no fade.
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Reduced motion: never hide anything (the hiding CSS needs this class).
      root.classList.remove("reveal-ready");
      return;
    }

    // Safari animates filter: blur() on the CPU, re-rasterizing whole cards
    // mid-scroll ("jittery" on Mac Safari and iPhones, 2026-09-30). Phones
    // are handled by a media query; this class covers desktop Safari, whose
    // reveals then fade and rise without the blur.
    const ua = navigator.userAgent;
    const webkitOnly =
      /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua) ||
      // Every iOS/iPadOS browser is WebKit underneath, whatever its name,
      // and iPads report a Mac platform with touch.
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (webkitOnly) root.classList.add("no-blur");

    const watching = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
          watching.delete(e.target);
        }
      },
      // Sharpens as it crosses the line 10% above the bottom of the screen
      // (3% on phones, where 10% read as a big blurred band).
      { rootMargin: `0px 0px -${window.innerWidth < 768 ? 3 : 10}% 0px` },
    );

    const scan = () => {
      const h = window.innerHeight;
      for (const el of document.querySelectorAll(".reveal:not(.is-in)")) {
        if (watching.has(el)) continue;
        // Anything already on screen, even just its top edge, stays as it
        // is. (It used to need to be above the 90% line, so a card peeking
        // in at the bottom showed sharp, then blurred out when scripts
        // loaded, then faded back: a flicker on every refresh.)
        if (el.getBoundingClientRect().top < h) {
          el.classList.add("is-in");
        } else {
          watching.add(el);
          io.observe(el);
        }
      }
    };

    scan();
    root.classList.add("reveal-ready");

    let raf = 0;
    const mo = new MutationObserver(() => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          scan();
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
  return null;
}
