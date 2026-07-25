"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { DEFAULT_FAQS, type Faq } from "@/lib/default-faqs";

export type { Faq };

export function FaqAccordion({ faqs = DEFAULT_FAQS }: { faqs?: readonly Faq[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-brand-light">
      {faqs.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex w-full items-center justify-between gap-4 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="text-base font-medium text-ink">{item.q}</span>
            {open === i ? (
              <MinusIcon size={18} className="shrink-0 text-ink" />
            ) : (
              <PlusIcon size={18} className="shrink-0 text-ink" />
            )}
          </button>
          {open === i && <p className="pb-5 text-sm text-ink-muted">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
