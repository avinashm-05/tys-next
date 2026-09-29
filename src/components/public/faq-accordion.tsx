"use client";

import { useId, useState } from "react";
import { DEFAULT_FAQS, type Faq } from "@/lib/default-faqs";

export type { Faq };

// Smooth accordion (2026-09-29): every answer stays in the page and opens
// by animating its row height (grid 0fr -> 1fr, so no measuring), with the
// text easing up into place. The plus turns into a minus by its vertical
// bar rotating flat, rather than one icon swapping for another.
const EASE = "cubic-bezier(0.22, 0.8, 0.3, 1)";

export function FaqAccordion({ faqs = DEFAULT_FAQS }: { faqs?: readonly Faq[] }) {
  const [open, setOpen] = useState(0);
  const base = useId();

  return (
    <div className="divide-y divide-brand-light">
      {faqs.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${base}-${i}`;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="group flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <span className="text-base font-medium text-ink transition-colors group-hover:text-brand">
                {item.q}
              </span>
              <span
                aria-hidden
                className={`relative h-7 w-7 shrink-0 rounded-full transition-colors duration-300 ${isOpen ? "bg-[#EEF4FF]" : "group-hover:bg-[#F2F4F7]"}`}
              >
                <span className="absolute left-1/2 top-1/2 h-[1.5px] w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
                <span
                  className="absolute left-1/2 top-1/2 h-3 w-[1.5px] rounded-full bg-ink transition-transform duration-500"
                  style={{ transform: `translate(-50%, -50%) rotate(${isOpen ? 90 : 0}deg)`, transitionTimingFunction: EASE }}
                />
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              className="grid transition-[grid-template-rows] duration-500"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", transitionTimingFunction: EASE }}
            >
              <div className="overflow-hidden">
                <p
                  className="pb-5 pr-10 text-[15px] leading-relaxed text-ink-muted transition-[opacity,transform] duration-500"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "none" : "translateY(-6px)",
                    transitionTimingFunction: EASE,
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
