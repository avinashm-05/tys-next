import type { Faq } from "@/lib/default-faqs";

// FAQPage structured data (schema.org) — lets Google/Bing show rich Q&A
// results and gives AI answer engines (Perplexity, AI Overviews, etc.) a
// clean, unambiguous Q&A pair to quote instead of parsing prose.
export function FaqJsonLd({ faqs }: { faqs: readonly Faq[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
