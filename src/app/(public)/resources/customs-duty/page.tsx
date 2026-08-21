import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { LegalSection } from "@/components/public/legal-section";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = pageMetadata({
  title: "Guide to Customs Duty — TYS Global Logistics",
  description: "What customs duty is, how it is calculated, and who pays it when you ship internationally from the United States.",
  path: "/resources/customs-duty",
});

export default function CustomsDutyPage() {
  return (
    <>
      <PageHeroBand
        title="Guide to Customs Duty"
        subtitle="How customs duty works, and what affects the amount you owe."
      />
      <ServiceCtaBanner />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <LegalSection title="What Is Customs Duty?">
            <p>
              Customs duty is a tax charged by a country&rsquo;s government on goods entering its
              border. It applies to most international shipments above a certain value, and the
              amount depends on the destination country&rsquo;s own rules — not the carrier or the
              shipping company.
            </p>
          </LegalSection>

          <LegalSection title="What Affects the Amount">
            <ul>
              <li>
                <strong>Declared value.</strong> Duty is typically calculated as a percentage of
                the item&rsquo;s value.
              </li>
              <li>
                <strong>Item category.</strong> Different types of goods (electronics, clothing,
                gifts) can be taxed at different rates.
              </li>
              <li>
                <strong>Destination country.</strong> Every country sets its own duty rates and
                exemption thresholds.
              </li>
              <li>
                <strong>Trade agreements.</strong> Some countries have reduced or waived duties for
                goods from certain origins.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="Who Pays It?">
            <p>
              In most cases, the recipient is responsible for paying customs duty and any related
              import taxes when the shipment arrives. This is separate from the shipping cost you
              pay upfront. Some destinations require duty to be paid before the shipment is
              released for delivery.
            </p>
          </LegalSection>

          <LegalSection title="How to Avoid Delays">
            <ul>
              <li>Declare an accurate value — under-declaring can trigger delays or penalties.</li>
              <li>Include a clear, accurate description of the shipment&rsquo;s contents.</li>
              <li>Provide complete sender and recipient information.</li>
              <li>Check whether your destination country has restrictions on your item category.</li>
            </ul>
          </LegalSection>

          <LegalSection title="Questions About Your Shipment?">
            <p>
              Customs rules vary widely by country and item type. If you&rsquo;re unsure what to
              expect for a specific shipment, our team can help you understand the requirements
              before you book.
            </p>
          </LegalSection>
        </div>
      </section>


      <TrustedReviewsSection />
    </>
  );
}
