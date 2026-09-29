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
    a: "Fill in the quote form with where it's going and what you're sending, or give us a call. We'll come back with a price built around your shipment.",
  },
  {
    q: "Do you ship cars?",
    a: "Yes. We ship cars, SUVs, motorcycles and other vehicles anywhere in the United States, and we take care of them the whole way.",
  },
  {
    q: "Can I send documents only?",
    a: "Yes. We send documents and small parcels too, at discounted rates, with express options when it's urgent.",
  },
  {
    q: "What if I need packing help?",
    a: "Yes. We can pack a home or an office for you, and store things safely if there's a gap between moving out and moving in.",
  },
  {
    q: "Can I track my shipment?",
    a: "Yes. Once it's booked you get a tracking number, so you can follow it from pickup to delivery.",
  },
] as const;
