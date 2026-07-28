"use client";

import { useEffect, useRef } from "react";
import { CaretLeftIcon, CaretRightIcon, StarIcon } from "@phosphor-icons/react";

export type Review = {
  name: string;
  role: string;
  quote: string;
};

// Continuously auto-scrolling review carousel (a real marquee crawl via
// requestAnimationFrame, not a step-then-pause loop) with a seamless
// infinite wrap: the review list is rendered twice back-to-back, and once
// the scroll position reaches the second copy it's snapped back by exactly
// one set's width — since the two copies are pixel-identical at that
// boundary, the wrap is invisible, so it reads as scrolling forever. Pauses
// on hover/touch; left/right arrows nudge by one card with the same wrap.
export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const pxPerFrame = 0.6;
    let rafId: number;

    function tick() {
      if (!pausedRef.current && track) {
        const setWidth = track.scrollWidth / 2;
        track.scrollLeft += pxPerFrame;
        if (track.scrollLeft >= setWidth) {
          track.scrollLeft -= setWidth;
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  function step(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-review-card]");
    const stepSize = card ? card.offsetWidth + 24 : track.clientWidth;
    const setWidth = track.scrollWidth / 2;

    if (dir > 0 && track.scrollLeft >= setWidth - 4) {
      track.scrollLeft -= setWidth;
    } else if (dir < 0 && track.scrollLeft - stepSize < 0) {
      track.scrollLeft += setWidth;
    }
    track.scrollBy({ left: dir * stepSize, behavior: "smooth" });
  }

  const looped = [...reviews, ...reviews];

  return (
    <div
      className="relative mx-auto max-w-6xl"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
      onTouchEnd={() => (pausedRef.current = false)}
      // iOS Safari: a vertical page-scroll swipe that starts over this
      // horizontal carousel fires touchcancel, not touchend, once its
      // gesture recognizer takes over — without this the pause from
      // onTouchStart above never clears, permanently stalling the
      // marquee after the very first scroll-past (reproduced: works in
      // Safari macOS, which never touch-pauses at all; broke in Safari
      // iOS on any touch-scroll near the section).
      onTouchCancel={() => (pausedRef.current = false)}
    >
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto px-4 pb-2 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {looped.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            data-review-card
            // The second half of `looped` is a pixel-identical copy that only
            // exists so the scrollLeft wrap in the rAF loop above is
            // seamless — it's not distinct content. Hidden from crawlers/AT
            // (aria-hidden + inert) so search engines and screen readers see
            // each testimonial exactly once, while sighted/mouse users still
            // get the infinite-scroll illusion.
            aria-hidden={i >= reviews.length}
            inert={i >= reviews.length}
            className="flex w-[85%] shrink-0 flex-col rounded-2xl bg-brand-pale p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,24,40,0.1)] sm:w-[60%] md:w-[calc(33.333%-16px)]"
          >
            <div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, j) => (
                <StarIcon key={j} size={16} weight="fill" />
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-muted">&ldquo;{r.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                {r.name.charAt(0)}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{r.name}</span>
                <span className="text-xs text-ink-muted">{r.role}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous reviews"
        onClick={() => step(-1)}
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white p-2.5 text-ink shadow-[0_4px_16px_rgba(16,24,40,0.16)] transition hover:bg-brand-pale md:left-8 md:flex"
      >
        <CaretLeftIcon size={18} weight="bold" />
      </button>
      <button
        type="button"
        aria-label="Next reviews"
        onClick={() => step(1)}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white p-2.5 text-ink shadow-[0_4px_16px_rgba(16,24,40,0.16)] transition hover:bg-brand-pale md:right-8 md:flex"
      >
        <CaretRightIcon size={18} weight="bold" />
      </button>
    </div>
  );
}
