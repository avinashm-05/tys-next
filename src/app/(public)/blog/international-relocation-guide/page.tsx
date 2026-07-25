import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostHero } from "@/components/public/blog-post-hero";
import { BlogBanner } from "@/components/public/blog-banner";
import { LegalSection } from "@/components/public/legal-section";
import { ArticleJsonLd } from "@/components/public/article-json-ld";
import { HouseIcon } from "@phosphor-icons/react/dist/ssr";

const DESCRIPTION =
  "A practical timeline for planning an international move, from your first inventory list to settling into your new home, with what to do and when.";

export const metadata: Metadata = {
  title: "Moving Abroad: A Step by Step International Relocation Guide — TYS Blog",
  description: DESCRIPTION,
};

export default function InternationalRelocationGuidePostPage() {
  return (
    <>
      <ArticleJsonLd
        headline="Moving Abroad: A Step by Step Guide to International Relocation"
        description={DESCRIPTION}
        datePublished="April 13, 2026"
        slug="international-relocation-guide"
      />
      <BlogPostHero
        category="International Moving"
        title="Moving Abroad: A Step by Step Guide to International Relocation"
        subtitle="International moves go smoothly when they're planned in stages. Here's a practical timeline to work from."
        date="April 13, 2026"
        readTime="8 min read"
      />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <BlogBanner icon={HouseIcon} className="mb-8 h-48 w-full md:h-56" />

          <LegalSection title="Start With a Realistic Timeline">
            <p>
              An international move involves more moving parts than a domestic one: customs
              clearance, longer transit times, and often a visa or residency process running in
              parallel with the shipping itself. Most households find eight to twelve weeks is a
              comfortable planning window, though it can be compressed if needed. Working backward
              from your target move date, rather than forward from today, tends to keep things on
              track.
            </p>
          </LegalSection>

          <LegalSection title="Two to Three Months Before: Plan and Inventory">
            <ul>
              <li>
                <strong>Inventory your household.</strong> Walk through each room and note what
                you&rsquo;re shipping, storing, selling, or donating. This becomes the basis for
                your moving quote, so the more accurate it is, the more accurate your estimate will
                be.
              </li>
              <li>
                <strong>Research destination country requirements.</strong> Some countries limit or
                restrict certain household items, require an inventory list for customs, or apply
                duty exemptions for goods that have been owned and used for a minimum period. Check
                these early, since they can affect what you decide to bring.
              </li>
              <li>
                <strong>Get moving quotes.</strong> Compare a few, and ask specifically what&rsquo;s
                included, door to door service, insurance, and customs handling can vary
                significantly between providers.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="Four to Six Weeks Before: Sort and Prepare">
            <ul>
              <li>
                <strong>Decide what&rsquo;s worth shipping.</strong> International shipping is
                priced by weight and volume, so it&rsquo;s often cheaper to sell or donate bulky,
                low value items and replace them at your destination rather than ship them.
              </li>
              <li>
                <strong>Gather required documents.</strong> Passport, visa or residency permit,
                proof of address at both ends, and any inventory forms your destination country
                requires for customs.
              </li>
              <li>
                <strong>Handle vehicles separately if you&rsquo;re bringing one.</strong> Auto
                transport and shipping have their own timelines and paperwork, so start that
                process alongside your household move rather than after it.
              </li>
              <li>
                <strong>Notify relevant parties</strong>: banks, subscriptions, schools, and
                employers, of your upcoming move and new address.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="Two to Three Weeks Before: Pack">
            <ul>
              <li>
                <strong>Pack by room, and label clearly</strong> with both contents and the room
                they belong in at the destination, which makes unpacking far faster.
              </li>
              <li>
                <strong>Set aside an essentials bag</strong> with a change of clothes, medications,
                chargers, and important documents to travel with you rather than in the shipment,
                in case of delays.
              </li>
              <li>
                <strong>Confirm final pickup details</strong> with your moving company, including
                access at your current address for loading.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="During Transit">
            <p>
              Ocean freight for household goods commonly takes several weeks depending on the
              route, while air shipments arrive much faster but cost more for the same volume. Your
              moving company should give you a tracking reference and an estimated delivery window.
              Use this time to finalize housing, utilities, and any remaining paperwork at your
              destination so you&rsquo;re ready to receive your shipment as soon as it clears
              customs.
            </p>
          </LegalSection>

          <LegalSection title="At Delivery">
            <ul>
              <li>Check your inventory list against what arrives, and note any discrepancies immediately.</li>
              <li>Inspect items for damage before signing off, and photograph anything that looks off.</li>
              <li>Keep all paperwork until you&rsquo;re confident everything has arrived and checked out.</li>
            </ul>
          </LegalSection>

          <LegalSection title="How TYS Supports International Moves">
            <p>
              We handle household relocation, vehicle shipping, and the customs paperwork that
              connects them, so you&rsquo;re coordinating with one team instead of several. See our{" "}
              <Link href="/services/international-relocation">international relocation</Link> page
              for what&rsquo;s included, or <Link href="/quotes">get a quote</Link> to start
              planning your move.
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
