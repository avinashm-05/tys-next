import Script from "next/script";

// Full-viewport branded loading overlay, shown from the very first paint
// until the page is actually ready (native `load` event — CSS/JS/images/
// fonts all fetched), then faded out. This is defense-in-depth for the
// exact class of bug fixed in site-header.tsx: on a slow/real mobile
// connection, whatever paints before the stylesheet arrives can look
// broken. Rather than relying on every single element getting its own
// CSS-independent fallback, this masks the entire page behind a clean,
// on-brand loading state until it's genuinely ready to be seen.
//
// No "use client" — this has no hooks/interactivity, so it renders as
// static server HTML and appears in the very first response, before any
// JS runs. Styled entirely with inline `style` props (not Tailwind
// classes), so it renders correctly with zero dependency on the
// stylesheet having loaded — the one piece of UI on the page that MUST
// work before any CSS arrives, since masking a stylesheet-dependent bug
// with more stylesheet-dependent UI would defeat the point.
//
// Removed by next/script's afterInteractive strategy (same pattern as
// analytics-scripts.tsx), not React state or a raw <script> tag — avoids
// the "script tags are never executed by React" dev warning a plain JSX
// <script> tag triggers. Not beforeInteractive: that strategy is only
// supported in pages/_document.js (App Router flags it elsewhere via
// @next/next/no-before-interactive-script-outside-document) and isn't
// needed here anyway — this script only has to attach a `load` listener,
// which just needs to happen before the page's `load` event actually
// fires, not before hydration. A capped fallback timeout guarantees it's
// never stuck on-screen if `load` is delayed or doesn't fire cleanly.
export function PageLoader() {
  return (
    <>
      <div
        id="tys-page-loader"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2147483647,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          background: "#ffffff",
          transition: "opacity 0.25s ease-out",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid #e6f0ff",
            borderTopColor: "#0364ff",
            animation: "tys-loader-spin 0.8s linear infinite",
          }}
        />
        <span
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#0364ff",
          }}
        >
          TYS Global Logistics
        </span>
      </div>
      {/* Keyframes can't go in a React `style` prop — this is the one bit
          that needs a real <style> tag, but it's still fully self-contained
          (not a dependency on globals.css). */}
      <style
        dangerouslySetInnerHTML={{
          __html: "@keyframes tys-loader-spin{to{transform:rotate(360deg)}}",
        }}
      />
      <Script id="tys-page-loader-hide" strategy="afterInteractive">
        {`(function(){function h(){var e=document.getElementById("tys-page-loader");if(!e)return;e.style.opacity="0";e.style.pointerEvents="none";setTimeout(function(){e.remove()},250)}if(document.readyState==="complete"){h()}else{window.addEventListener("load",h)}setTimeout(h,6000)})();`}
      </Script>
    </>
  );
}
