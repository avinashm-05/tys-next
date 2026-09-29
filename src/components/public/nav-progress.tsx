"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Slim blue progress bar across the top of the screen while the next page
// loads (2026-09-29). It replaces the old full-screen spinner (PageLoader),
// which hid every page until the browser's load event, up to 6s on a first
// visit. This only runs on in-site navigation: it starts when an internal
// link is clicked, creeps toward 90%, and completes when the new page's
// path lands. A route-level loading.tsx was tried first and dropped: it
// made unknown URLs answer 200 instead of 404 (the stream starts before
// notFound() runs), which Google treats as soft 404s.
//
// If the page is slow to arrive (over SLOW_MS), a branded loader fades in
// over the content as well: the TYS logo with a dot orbiting a ring. Fast
// page changes never show it, only the bar (owner's call, 2026-09-30: "if it
// takes longer, it should have a loader"). It sits under the sticky header,
// so the nav stays usable, and disappears the moment the new page lands.
const SLOW_MS = 700;
export function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<{ on: boolean; w: number }>({ on: false, w: 0 });
  const timer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);
  const slowTimer = useRef<number | undefined>(undefined);
  const [slow, setSlow] = useState(false);

  // Finish when the new page arrives ("adjust state on prop change").
  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) {
    setSeen(pathname);
    if (state.on) setState({ on: true, w: 100 });
    if (slow) setSlow(false);
  }

  useEffect(() => {
    if (state.w !== 100) return;
    window.clearInterval(timer.current);
    window.clearTimeout(slowTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setState({ on: false, w: 0 });
      setSlow(false);
    }, 320);
    return () => window.clearTimeout(hideTimer.current);
  }, [state.w]);

  useEffect(() => {
    const start = () => {
      window.clearInterval(timer.current);
      window.clearTimeout(hideTimer.current);
      setState({ on: true, w: 12 });
      window.clearTimeout(slowTimer.current);
      slowTimer.current = window.setTimeout(() => setSlow(true), SLOW_MS);
      timer.current = window.setInterval(() => {
        setState((s) => (s.w >= 90 ? s : { on: true, w: s.w + (90 - s.w) * 0.12 }));
      }, 200);
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page or #hash
      start();
    };
    document.addEventListener("click", onClick, true);
    // Safety net: never leave the bar hanging.
    const stop = () => setState((s) => (s.on ? { on: true, w: 100 } : s));
    window.addEventListener("popstate", stop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", stop);
      window.clearInterval(timer.current);
      window.clearTimeout(slowTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!state.on || state.w === 100) return;
    const t = window.setTimeout(() => setState({ on: true, w: 100 }), 10000);
    return () => window.clearTimeout(t);
  }, [state.on, state.w]);

  return (
    <>
    <div
      aria-hidden={!slow}
      role={slow ? "status" : undefined}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-white/85"
      style={{
        opacity: slow ? 1 : 0,
        pointerEvents: slow ? "auto" : "none",
        transition: "opacity 250ms ease-out",
      }}
    >
      {slow && (
        <>
          <span className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-[#DCE7FA]" />
            <span className="page-loading-orbit absolute inset-0">
              <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_0_4px_rgba(3,100,255,0.15)]" />
            </span>
            <img src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png" alt="" className="h-5 w-auto" />
          </span>
          <span className="text-[15px] font-medium text-ink-muted">Loading…</span>
        </>
      )}
    </div>
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      style={{ opacity: state.on && state.w < 100 ? 1 : 0, transition: "opacity 300ms ease-out 120ms" }}
    >
      <div
        className="nav-progress h-full rounded-r-full bg-brand shadow-[0_0_10px_rgba(3,100,255,0.6)]"
        style={{
          width: `${state.w}%`,
          transition: state.w === 0 ? "none" : "width 260ms cubic-bezier(0.22, 0.8, 0.3, 1)",
        }}
      />
    </div>
    </>
  );
}
