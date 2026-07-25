export type Faq = { q: string; a: string };

// Lives outside faq-accordion.tsx on purpose: that file is "use client", and
// a plain data export (not a component) from a client-boundary module isn't
// reliably usable from Server Components (it can resolve to a client
// reference proxy instead of the real array during SSR). Server components
// like the home page and FaqJsonLd need the real array, so the data lives
// here and faq-accordion.tsx just re-exports/consumes it.
export const DEFAULT_FAQS: readonly Faq[] = [
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
