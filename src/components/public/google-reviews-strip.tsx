"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRightIcon, CaretLeftIcon, CaretRightIcon, StarIcon } from "@phosphor-icons/react";
import {
  GOOGLE_PROFILE_URL,
  GOOGLE_RATING,
  GOOGLE_REVIEWS,
} from "@/lib/google-reviews";

// Compact reviews: a one-line rating summary, then an endless row of
// equal-height cards drifting left (the list twice over, the track offset
// wrapping at half its width, so it loops without a seam). Arrows glide it
// one card either way; it pauses while hovered or touched, stops while off
// screen, and doesn't drift at all with reduced motion (arrows still work).
// Long reviews are clamped; the full text is one click away on Google,
// which is also where people check reviews are real.

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon size={size} weight="fill" className="absolute inset-0 text-[#DCE2EA]" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarIcon size={size} weight="fill" className="text-[#FBBC04]" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function G({ size = 16 }: { size?: number }) {
  // Google's four-colour G.
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function ReviewCard({ r }: { r: (typeof GOOGLE_REVIEWS)[number] }) {
  return (
    <li className="flex w-[300px] shrink-0 flex-col rounded-3xl border border-[#E4E9F2] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:w-[360px]">
      <div className="flex items-center justify-between">
        <Stars value={r.stars} />
        <G size={16} />
      </div>
      <p className="mt-4 line-clamp-5 flex-1 text-[15px] leading-relaxed text-ink">&ldquo;{r.text}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {r.name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{r.name}</span>
          <span className="block text-xs text-ink-muted">{r.badge ? `${r.badge} on Google` : "Google review"}</span>
        </span>
      </div>
    </li>
  );
}

function Copy({ hidden, children }: { hidden?: boolean; children: ReactNode }) {
  // pr-4 matches the gap, so the second copy follows the first seamlessly.
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-4 pr-4">
      {children}
    </ul>
  );
}

const SPEED = 38; // px per second
const GAP = 16; // matches gap-4 / pr-4 below

export function GoogleReviewsStrip() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const nudge = useRef<((dir: 1 | -1) => void) | null>(null);

  useEffect(() => {
    const el = track.current;
    const box = wrap.current;
    if (!el || !box) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = 0;
    let paused = false;
    let visible = true;
    let tween: { from: number; to: number; t0: number } | null = null;
    let last = performance.now();
    let raf = 0;

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const half = el.scrollWidth / 2;
      if (tween) {
        const t = Math.min(1, (now - tween.t0) / 550);
        offset = tween.from + (tween.to - tween.from) * ease(t);
        if (t >= 1) tween = null;
      } else if (!paused && visible && !reduce) {
        offset += SPEED * dt;
      }
      if (half > 0) {
        // Wrap into [0, half) so the loop never shows a seam, either way.
        const wrapped = ((offset % half) + half) % half;
        if (!tween) offset = wrapped;
        el.style.transform = `translate3d(${-wrapped}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    nudge.current = (dir) => {
      const card = el.querySelector("li");
      const step = (card?.getBoundingClientRect().width ?? 320) + GAP;
      tween = { from: offset, to: offset + dir * step, t0: performance.now() };
    };

    const pause = () => (paused = true);
    const resume = () => (paused = false);
    box.addEventListener("pointerenter", pause);
    box.addEventListener("pointerleave", resume);
    box.addEventListener("touchstart", pause, { passive: true });
    box.addEventListener("touchend", resume);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(box);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      box.removeEventListener("pointerenter", pause);
      box.removeEventListener("pointerleave", resume);
      box.removeEventListener("touchstart", pause);
      box.removeEventListener("touchend", resume);
    };
  }, []);

  const cards = GOOGLE_REVIEWS.map((r) => <ReviewCard key={r.name} r={r} />);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <a
          href={GOOGLE_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-2xl border border-[#E4E9F2] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:border-[#C9D6EE]"
        >
          <G size={26} />
          <span>
            <span className="flex items-center gap-2">
              <span className="text-xl font-bold leading-none text-ink">{GOOGLE_RATING}</span>
              <Stars value={GOOGLE_RATING} size={16} />
            </span>
            <span className="mt-1 block text-[13px] text-ink-muted">Rated on Google</span>
          </span>
          <ArrowUpRightIcon size={14} className="ml-1 text-[#A3ACBA] transition group-hover:text-ink" />
        </a>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous reviews" onClick={() => nudge.current?.(-1)} className="btn btn-secondary !h-10 !w-10 !p-0">
            <CaretLeftIcon size={16} weight="bold" />
          </button>
          <button type="button" aria-label="Next reviews" onClick={() => nudge.current?.(1)} className="btn btn-secondary !h-10 !w-10 !p-0">
            <CaretRightIcon size={16} weight="bold" />
          </button>
        </div>
      </div>

      <div
        ref={wrap}
        className="-mx-4 mt-6 overflow-hidden pb-2 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] md:-mx-8"
      >
        <div ref={track} className="flex w-max will-change-transform">
          <Copy>{cards}</Copy>
          <Copy hidden>{cards}</Copy>
        </div>
      </div>
    </div>
  );
}
