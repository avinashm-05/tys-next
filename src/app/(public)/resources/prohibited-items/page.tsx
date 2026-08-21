import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { LegalSection } from "@/components/public/legal-section";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = pageMetadata({
  title: "Prohibited Shipping Items — TYS Global Logistics",
  description: "What you cannot ship internationally, and why. Carrier restrictions and destination country rules explained simply.",
  path: "/resources/prohibited-items",
});

export default function ProhibitedItemsPage() {
  return (
    <>
      <PageHeroBand
        title="Prohibited Shipping Items"
        subtitle="What you can't ship due to carrier, safety, and customs regulations."
      />
      <ServiceCtaBanner />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <LegalSection title="Why Some Items Can't Be Shipped">
            <p>
              Every carrier — and every country — has rules about what can move through the
              shipping network. Some restrictions are for safety (hazardous materials), some are
              legal (controlled substances), and some are destination-specific (customs
              restrictions that vary by country). We can&rsquo;t accept a shipment that violates
              any of these.
            </p>
          </LegalSection>

          <LegalSection title="Commonly Restricted Categories">
            <ul>
              <li>Hazardous materials (flammable, corrosive, explosive, or toxic substances)</li>
              <li>Illegal drugs and controlled substances</li>
              <li>Firearms, ammunition, and weapons</li>
              <li>Perishable food items without proper packaging or approval</li>
              <li>Live animals, outside of a specifically arranged pet relocation</li>
              <li>Cash, precious metals, and negotiable financial instruments</li>
              <li>Counterfeit goods or items that infringe on intellectual property</li>
              <li>Lithium batteries shipped outside of carrier-approved packaging</li>
            </ul>
          </LegalSection>

          <LegalSection title="Destination-Specific Restrictions">
            <p>
              Beyond these general categories, many countries restrict or tax specific items on
              import — electronics, alcohol, and certain foods are common examples. Rules vary
              widely by destination, so if you&rsquo;re unsure whether an item can be shipped, ask
              us before you book.
            </p>
          </LegalSection>

          <LegalSection title="Not Sure About an Item?">
            <p>
              Contact our team before shipping anything you&rsquo;re unsure about — we&rsquo;d
              rather confirm upfront than have your shipment delayed or returned at customs.
            </p>
          </LegalSection>
        </div>
      </section>


      <TrustedReviewsSection />
    </>
  );
}
