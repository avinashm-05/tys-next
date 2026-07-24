"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@phosphor-icons/react";

const FAQS = [
  {
    q: "How do I get a quote?",
    a: "Simply fill out our quote request form or contact our team with your shipment details. We'll provide a customized quote based on your requirements.",
  },
  {
    q: "Do you ship cars?",
    a: "Yes. We arrange safe and dependable transport for cars, SUVs, motorcycles, and other vehicles across the United States.",
  },
  {
    q: "Can I send documents only?",
    a: "Absolutely. We offer secure and cost-effective document and parcel shipping services, including discounted express options for time-sensitive deliveries.",
  },
  {
    q: "What if I need packing help?",
    a: "Yes. TYS Global Logistics provides residential moving, commercial relocation, professional packing, and secure warehousing and storage solutions.",
  },
  {
    q: "Can I track my shipment?",
    a: "Yes — once your shipment is booked, you'll receive a tracking number so you can follow its progress from pickup to delivery.",
  },
] as const;

export function FaqAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-brand-light">
      {FAQS.map((item, i) => (
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
