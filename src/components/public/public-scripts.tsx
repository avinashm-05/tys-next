"use client";

import Script from "next/script";

// Loads the legacy vendor JS exactly as the old site did, so behaviors are
// identical: Bootstrap self-wires data-bs-toggle (pill tabs, accordion) via a
// delegated document listener at eval time; AOS animates on scroll; select2
// styles the (inert) country selects. Loaded after hydration; order handled
// via onLoad chaining where it matters (jQuery → select2).
declare global {
  interface Window {
    AOS?: { init: (opts?: Record<string, unknown>) => void };
    jQuery?: (selector: string) => { select2: () => void };
  }
}

export function PublicScripts() {
  return (
    <>
      <Script src="/frontend/assets/style/bootstrap/js/popper.js" strategy="afterInteractive" />
      <Script
        src="/frontend/assets/style/bootstrap/js/bootstrap5.1.3.js"
        strategy="afterInteractive"
      />
      <Script
        src="/frontend/assets/style/animation/aos.js"
        strategy="afterInteractive"
        onLoad={() => window.AOS?.init()}
      />
      <Script
        src="/frontend/assets/style/bootstrap/js/jquery3.2.1.js"
        strategy="afterInteractive"
        onLoad={() => {
          const s = document.createElement("script");
          s.src = "/frontend/assets/style/Selectsearch/select2.min.js";
          s.onload = () => {
            try {
              window.jQuery?.("select").select2();
            } catch {
              /* inert widget — safe to ignore if select2 can't attach */
            }
          };
          document.body.appendChild(s);
        }}
      />
    </>
  );
}
