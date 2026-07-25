import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostHero } from "@/components/public/blog-post-hero";
import { BlogBanner } from "@/components/public/blog-banner";
import { LegalSection } from "@/components/public/legal-section";
import { ArticleJsonLd } from "@/components/public/article-json-ld";
import { CarIcon } from "@phosphor-icons/react/dist/ssr";

const DESCRIPTION =
  "A complete checklist for the week before your car is picked up for auto transport, covering cleaning, documentation, and what to remove first.";

export const metadata: Metadata = {
  title: "How to Prepare Your Vehicle for Auto Transport — TYS Blog",
  description: DESCRIPTION,
};

export default function AutoTransportChecklistPostPage() {
  return (
    <>
      <ArticleJsonLd
        headline="How to Prepare Your Vehicle for Auto Transport: A Complete Checklist"
        description={DESCRIPTION}
        datePublished="April 20, 2026"
        slug="auto-transport-preparation-checklist"
      />
      <BlogPostHero
        category="Auto Transport"
        title="How to Prepare Your Vehicle for Auto Transport: A Complete Checklist"
        subtitle="A few simple steps the week before pickup make inspection, loading, and delivery go a lot more smoothly."
        date="April 20, 2026"
        readTime="6 min read"
      />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <BlogBanner icon={CarIcon} className="mb-8 h-48 w-full md:h-56" />

          <LegalSection title="Why Preparation Matters">
            <p>
              Auto transport is straightforward once a vehicle is loaded, but the pickup itself
              goes far more smoothly when the car is ready ahead of time. A clean vehicle is easier
              to inspect accurately, an empty gas tank keeps the trailer lighter and safer to load,
              and a vehicle free of loose items won&rsquo;t have anything shifting or rattling
              during transit. None of this takes more than an hour, and it&rsquo;s worth doing
              properly.
            </p>
          </LegalSection>

          <LegalSection title="One Week Before Pickup">
            <ul>
              <li>
                <strong>Confirm your pickup window and address</strong> with your transport
                provider, including any access restrictions at the location, like narrow streets
                or low clearance that a large carrier truck might not be able to reach.
              </li>
              <li>
                <strong>Gather your documents:</strong> registration, insurance, and a photo ID.
                You&rsquo;ll need these at both pickup and delivery.
              </li>
              <li>
                <strong>Check your insurance coverage</strong> so you understand what&rsquo;s
                covered during transport and what, if anything, the carrier&rsquo;s policy adds on
                top of it.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="The Day Before Pickup">
            <ul>
              <li>
                <strong>Wash the vehicle</strong>, inside and out. A clean car makes it much easier
                for both you and the driver to spot and document any existing scratches, dents, or
                paint chips during the pre transport inspection.
              </li>
              <li>
                <strong>Photograph the vehicle</strong> from all four sides, plus close ups of any
                existing damage, with a timestamp visible if your camera supports it. Keep these for
                your own records alongside the carrier&rsquo;s inspection report.
              </li>
              <li>
                <strong>Remove all personal items.</strong> Most carriers don&rsquo;t allow personal
                belongings inside the vehicle during transport, and anything left behind typically
                isn&rsquo;t covered by insurance if it&rsquo;s lost or damaged.
              </li>
              <li>
                <strong>Leave about a quarter tank of gas.</strong> Enough to load, unload, and
                drive the car short distances if needed, but not so much that it adds unnecessary
                weight.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="Mechanical and Security Checks">
            <ul>
              <li>Check tire pressure and top off fluids if anything looks low.</li>
              <li>
                Secure or remove loose exterior parts, like antennas, spoilers, or bike racks,
                that could be damaged or damage another vehicle during loading.
              </li>
              <li>
                Disable toll transponders and car alarms so they don&rsquo;t trigger unexpectedly
                in transit.
              </li>
              <li>Note any pre existing mechanical issues so the driver can plan for them.</li>
              <li>Remove toll tags, parking passes, and garage door remotes if you won&rsquo;t need them at the destination right away.</li>
            </ul>
          </LegalSection>

          <LegalSection title="At Pickup: What to Expect">
            <p>
              The driver will walk around your vehicle with you and document its condition on a
              bill of lading, noting any existing damage. Read this carefully before signing, since
              it becomes the reference point for the delivery inspection. Keep a copy for yourself,
              and confirm the delivery contact information and rough timeline before the driver
              leaves.
            </p>
          </LegalSection>

          <LegalSection title="At Delivery">
            <p>
              Inspect the vehicle again against the same bill of lading before signing for it.
              Check it in daylight if at all possible, and don&rsquo;t rush the walkaround even if
              the driver has another delivery waiting. Any new damage should be noted on the
              paperwork at the time of delivery, not reported afterward.
            </p>
          </LegalSection>

          <LegalSection title="How TYS Handles Auto Transport">
            <p>
              We coordinate pickup and delivery windows, provide a documented vehicle inspection at
              both ends, and combine auto transport with household or business relocations when
              you&rsquo;re moving more than just a car. Learn more on our{" "}
              <Link href="/services/auto-transport">auto transport</Link> page, or{" "}
              <Link href="/quotes">get a quote</Link> for your vehicle today.
            </p>
          </LegalSection>
        </div>
      </section>

    </>
  );
}
