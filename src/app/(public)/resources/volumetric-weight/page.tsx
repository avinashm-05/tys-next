import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { LegalSection } from "@/components/public/legal-section";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = pageMetadata({
  title: "Volumetric Weight Explained — TYS Global Logistics",
  description: "How dimensional (volumetric) weight is calculated, and why it affects your shipping rate.",
  path: "/resources/volumetric-weight",
});

export default function VolumetricWeightPage() {
  return (
    <>
      <PageHeroBand
        title="Volumetric Weight Explained"
        subtitle="How dimensional weight is calculated, and why it can determine your shipping rate."
      />
      <ServiceCtaBanner />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <LegalSection title="What Is Dimensional Weight?">
            <p>
              Dimensional weight — also called DIM weight or volumetric weight — is a way of
              pricing a shipment based on how much space it takes up, not just how heavy it is.
              It&rsquo;s calculated by multiplying a package&rsquo;s length by its width by its
              height, then dividing by a carrier divisor.
            </p>
            <p>
              Actual weight and dimensional weight are different things. Actual weight is what
              your shipment weighs on a scale. Dimensional weight represents the space it occupies
              in a truck or plane, including packaging.
            </p>
          </LegalSection>

          <LegalSection title="Chargeable Weight: Whichever Is Greater">
            <p>
              Carriers bill based on chargeable weight — the greater of your shipment&rsquo;s
              actual weight or its dimensional weight. This is why a large, lightweight box can
              sometimes cost more to ship than a small, heavy one: it&rsquo;s taking up more space
              in transit, even if it doesn&rsquo;t weigh much.
            </p>
          </LegalSection>

          <LegalSection title="How TYS Calculates It">
            <p>
              Our quote tool calculates dimensional weight the same way, for every shipment:
            </p>
            <ul>
              <li>
                <strong>Inches / Pounds:</strong> Length × Width × Height ÷ 139
              </li>
              <li>
                <strong>Centimeters / Kilograms:</strong> Length × Width × Height ÷ 5000
              </li>
            </ul>
            <p>
              For example, an 18 × 18 × 16 inch box has a dimensional weight of 18 × 18 × 16 ÷ 139
              ≈ <strong>37.29 lb</strong>. If the package&rsquo;s actual weight is less than that,
              you&rsquo;ll be charged for 37.29 lb — the dimensional weight, since it&rsquo;s the
              greater number.
            </p>
          </LegalSection>

          <LegalSection title="Why It Matters">
            <ul>
              <li>
                <strong>Right-size your box.</strong> Using a box that&rsquo;s much bigger than
                your item increases dimensional weight (and cost) for no reason.
              </li>
              <li>
                <strong>Minimal, appropriate packaging</strong> keeps both your dimensional weight
                and your shipping cost down.
              </li>
              <li>
                <strong>It&rsquo;s automatic.</strong> When you enter your package dimensions in
                our quote tool, chargeable weight is calculated for you in real time.
              </li>
            </ul>
          </LegalSection>
        </div>
      </section>


      <TrustedReviewsSection />
    </>
  );
}
