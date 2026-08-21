import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { FaqJsonLd } from "@/components/public/faq-json-ld";
import { DEFAULT_FAQS } from "@/lib/default-faqs";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = pageMetadata({
  title: "FAQs — TYS Global Logistics",
  description: "Answers to the questions we hear most often about shipping and moving with TYS.",
  path: "/faqs",
});

export default function FaqsPage() {
  return (
    <>
      <PageHeroBand
        title="Frequently Asked Questions"
        subtitle="As your trusted logistics partner, we can help with all your shipping and moving questions."
      />
      <ServiceCtaBanner />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <FaqJsonLd faqs={DEFAULT_FAQS} />
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <FaqAccordion />
        </div>
      </section>


      <TrustedReviewsSection />
    </>
  );
}
