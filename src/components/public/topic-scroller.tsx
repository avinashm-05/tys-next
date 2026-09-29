"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "@/components/public/home/reveal";

// Attio-style topic scroller (2026-09-29): several related topics in ONE
// block. Desktop: a sticky list of topic titles on the left with a blue bar
// marking the one you're reading (the others greyed out); the topics scroll
// past on the right, and the bar slides as you go. Clicking a title glides
// to it. Phones: just the topics, stacked, each with its own heading.
//
// Use it instead of several SplitSections in a row (e.g. "Shipping tips",
// "Documents you may need", "Restrictions"), which left a big empty column.
export type Topic = { id: string; title: string; lead?: ReactNode; content: ReactNode };

export function TopicScroller({ topics }: { topics: Topic[] }) {
  const [active, setActive] = useState(topics[0]?.id);
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ top: 0, height: 0 });

  // Scroll spy: the topic crossing the middle band of the screen is active.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const t of topics) {
      const el = document.getElementById(t.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [topics]);

  // Slide the bar to the active title.
  useEffect(() => {
    const btn = listRef.current?.querySelector<HTMLElement>(`[data-topic="${active}"]`);
    if (btn) setBar({ top: btn.offsetTop, height: btn.offsetHeight });
  }, [active]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
  };

  return (
    <section>
      <div className="rails border-t border-[var(--line)]">
        <div className="grid grid-cols-1 lg:grid-cols-[0.72fr_1.28fr]">
          {/* Sticky topic list (desktop) */}
          <div className="hidden border-r border-[var(--line)] px-14 py-20 lg:block">
            <div ref={listRef} className="sticky top-36">
              <span
                aria-hidden
                className="absolute -left-14 w-[2px] bg-brand transition-all duration-500"
                style={{ top: bar.top, height: bar.height, transitionTimingFunction: "cubic-bezier(0.22, 0.8, 0.3, 1)" }}
              />
              <ul className="space-y-1">
                {topics.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      data-topic={t.id}
                      onClick={() => go(t.id)}
                      className={`block w-full py-2.5 text-left text-[19px] tracking-[-0.015em] transition-colors duration-300 ${
                        active === t.id ? "text-ink" : "text-ink/30 hover:text-ink/60"
                      }`}
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The topics */}
          <div>
            {topics.map((t, i) => (
              <article
                key={t.id}
                id={t.id}
                className={`scroll-mt-32 px-5 py-14 sm:px-10 lg:px-14 lg:py-20 ${i > 0 ? "border-t border-[var(--line)]" : ""}`}
              >
                <Reveal
                  as="h2"
                  className="text-balance text-[1.7rem] leading-[1.1] tracking-[-0.03em] text-ink sm:text-[2rem]"
                >
                  {t.title}
                </Reveal>
                {t.lead && (
                  <Reveal as="div" delay={60} className="mt-3 max-w-2xl text-pretty text-[16.5px] leading-relaxed text-ink-muted">
                    {t.lead}
                  </Reveal>
                )}
                <div className="mt-8">{t.content}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
