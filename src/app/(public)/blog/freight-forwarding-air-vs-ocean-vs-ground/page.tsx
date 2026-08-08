import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostHero } from "@/components/public/blog-post-hero";
import { BlogBanner } from "@/components/public/blog-banner";
import { LegalSection } from "@/components/public/legal-section";
import { ArticleJsonLd } from "@/components/public/article-json-ld";
import { AnchorIcon } from "@phosphor-icons/react/dist/ssr";

const DESCRIPTION =
  "How to choose between air, ocean, and ground freight based on your budget, timeline, and cargo, with the real tradeoffs explained plainly.";

export const metadata: Metadata = {
  title: "Freight Forwarding 101: Air vs Ocean vs Ground Shipping — TYS Blog",
  description: DESCRIPTION,
};

export default function FreightModesPostPage() {
  return (
    <>
      <ArticleJsonLd
        headline="Freight Forwarding 101: Air vs Ocean vs Ground Shipping"
        description={DESCRIPTION}
        datePublished="April 6, 2026"
        slug="freight-forwarding-air-vs-ocean-vs-ground"
      />
      <BlogPostHero
        category="Freight Forwarding"
        title="Freight Forwarding 101: Air vs Ocean vs Ground Shipping"
        subtitle="Every freight mode is a tradeoff between cost, speed, and shipment size. Here's how to think about which one fits your cargo."
        date="April 6, 2026"
        readTime="7 min read"
      />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <BlogBanner icon={AnchorIcon} className="mb-8 h-48 w-full md:h-56" />

          <LegalSection title="What Freight Forwarding Actually Means">
            <p>
              A freight forwarder doesn&rsquo;t own the ships, planes, or trucks that
              carry your cargo. Instead, we arrange and manage the full route on your
              behalf, choosing carriers, handling documentation, and coordinating the
              handoffs between them, so a shipment moving from a warehouse to a port to a
              ship to another port to a final delivery truck is one managed process
              instead of five separate bookings you have to track yourself.
            </p>
          </LegalSection>

          <LegalSection title="Air Freight: Fastest, and Priced Accordingly">
            <p>
              Air freight is the quickest way to move cargo internationally, often
              measured in days rather than weeks. That speed comes at a cost though, air
              freight is typically the most expensive option per unit of weight, and
              it&rsquo;s priced heavily on dimensional weight, so bulky, low density cargo
              gets expensive fast.
            </p>
            <p>
              <strong>Best for:</strong> time sensitive shipments, high value or
              perishable goods, and smaller cargo volumes where the cost difference
              against ocean freight is smaller in absolute terms.
            </p>
          </LegalSection>

          <LegalSection title="Ocean Freight: Best Value for Large Volume">
            <p>
              Ocean freight moves the vast majority of the world&rsquo;s cargo by volume,
              and for good reason: it&rsquo;s by far the most cost effective way to ship
              large or heavy shipments internationally. The tradeoff is transit time,
              ocean shipments commonly take several weeks depending on the route, plus
              time for loading, customs clearance, and final delivery on each end.
            </p>
            <p>
              Ocean freight is typically booked as either a full container load (FCL),
              where your cargo fills an entire container, or a less than container load
              (LCL), where your cargo shares a container with other shipments. FCL usually
              makes sense once your volume is large enough to fill most of a container;
              LCL is often cheaper for smaller shipments that don&rsquo;t need a full one.
            </p>
            <p>
              <strong>Best for:</strong> large volume shipments, non urgent cargo, and
              situations where cost per unit matters more than speed.
            </p>
          </LegalSection>

          <LegalSection title="Ground Freight: Flexible for Regional Moves">
            <p>
              Ground freight, by truck or rail, is the standard for domestic and cross
              border moves within a continent. It&rsquo;s generally faster than ocean
              freight and cheaper than air freight for shorter distances, and it offers
              real flexibility since a truck can deliver directly to a door rather than
              requiring a port or airport handoff on each end.
            </p>
            <p>
              <strong>Best for:</strong> domestic and regional shipments, cargo that needs
              door to door delivery without an ocean or air leg, and moves where
              flexibility matters more than raw speed.
            </p>
          </LegalSection>

          <LegalSection title="How to Choose">
            <ul>
              <li>
                <strong>Ask what your real deadline is.</strong> If your cargo needs to
                arrive within a few days, air freight is often the only mode that fits,
                regardless of cost.
              </li>
              <li>
                <strong>Check your shipment&rsquo;s size and weight.</strong> Small,
                urgent shipments favor air. Large, heavy shipments favor ocean. Regional
                shipments usually favor ground.
              </li>
              <li>
                <strong>Consider a combined approach.</strong> Many international
                shipments use more than one mode, ocean freight across the water, then
                ground freight for final delivery, for example. A good freight forwarder
                plans this as one route, not separate bookings.
              </li>
              <li>
                <strong>Factor in total cost, not just freight cost.</strong> Customs
                clearance, insurance, and final delivery all add to the real total, and
                they vary by mode.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="How TYS Plans Your Route">
            <p>
              We compare air, ocean, and ground options for your specific cargo, factoring
              in timeline, budget, and destination, and handle the customs and
              documentation for every leg of the route. Visit our{" "}
              <Link href="/services/freight-forwarding">freight forwarding</Link> page to
              see what&rsquo;s included, or <Link href="/#get-quote">get a quote</Link>{" "}
              for your shipment.
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
