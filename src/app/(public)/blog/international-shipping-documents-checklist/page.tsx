import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostHero } from "@/components/public/blog-post-hero";
import { BlogBanner } from "@/components/public/blog-banner";
import { LegalSection } from "@/components/public/legal-section";
import { ArticleJsonLd } from "@/components/public/article-json-ld";
import { FileTextIcon } from "@phosphor-icons/react/dist/ssr";

const DESCRIPTION =
  "The paperwork every international shipment needs, what each document actually does, and how to avoid the customs delays that come from missing one.";

export const metadata: Metadata = {
  title: "International Shipping Documents Checklist — TYS Blog",
  description: DESCRIPTION,
};

export default function ShippingDocumentsChecklistPostPage() {
  return (
    <>
      <ArticleJsonLd
        headline="International Shipping Documents Checklist for Smooth Customs Clearance"
        description={DESCRIPTION}
        datePublished="April 27, 2026"
        slug="international-shipping-documents-checklist"
      />
      <BlogPostHero
        category="Customs & Documentation"
        title="International Shipping Documents Checklist for Smooth Customs Clearance"
        subtitle="Most customs delays come down to one missing or incorrect form. Here's what to have ready before your shipment leaves."
        date="April 27, 2026"
        readTime="7 min read"
      />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <BlogBanner icon={FileTextIcon} className="mb-8 h-48 w-full md:h-56" />

          <LegalSection title="Why Documentation Matters More Than People Expect">
            <p>
              Customs authorities don&rsquo;t open every box that crosses a border. Instead, they
              rely on paperwork to tell them what&rsquo;s inside, who it belongs to, what it&rsquo;s
              worth, and why it&rsquo;s being shipped. When that paperwork is incomplete or doesn&rsquo;t
              match the shipment, the package gets held for review rather than cleared automatically,
              and that&rsquo;s where most international shipping delays actually come from.
            </p>
            <p>
              Getting your documents right the first time is almost always faster than trying to
              fix them after a shipment is already sitting in a customs warehouse.
            </p>
          </LegalSection>

          <LegalSection title="The Core Documents Every Shipment Needs">
            <ul>
              <li>
                <strong>Commercial invoice.</strong> A description of the goods, their declared
                value, the sender, and the recipient. Customs uses this to assess duties and taxes,
                so the description should be specific (&ldquo;men&rsquo;s cotton t shirts, 12
                units&rdquo;) rather than vague (&ldquo;clothing&rdquo;).
              </li>
              <li>
                <strong>Packing list.</strong> An itemized breakdown of what&rsquo;s in each box,
                including quantities and weights. It doesn&rsquo;t need to match the commercial
                invoice word for word, but the numbers should agree.
              </li>
              <li>
                <strong>Bill of lading or air waybill.</strong> The contract between you and the
                carrier, and the document that proves ownership and lets your shipment be tracked
                and released to the correct recipient.
              </li>
              <li>
                <strong>Certificate of origin.</strong> States which country the goods were made in.
                Some destination countries use this to apply reduced duty rates under trade
                agreements, so it&rsquo;s worth including even when it isn&rsquo;t strictly required.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="Documents You May Also Need">
            <ul>
              <li>
                <strong>Export license.</strong> Required for certain regulated or restricted
                goods. Most personal and household shipments don&rsquo;t need one, but check if
                you&rsquo;re shipping anything technical, medical, or controlled.
              </li>
              <li>
                <strong>Insurance certificate.</strong> Proof of coverage, useful if you&rsquo;ve
                insured a high value shipment and need to file a claim.
              </li>
              <li>
                <strong>Import permit.</strong> Some countries require a permit before certain
                goods, like food, plants, or electronics, are allowed to enter.
              </li>
              <li>
                <strong>Power of attorney.</strong> Authorizes a customs broker to clear a shipment
                on your behalf, common for commercial or high value freight.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="Common Mistakes That Cause Delays">
            <ul>
              <li>
                Declaring a value that seems too low for the described goods, which invites extra
                scrutiny rather than lower duties.
              </li>
              <li>
                Using generic item descriptions instead of specific ones on the commercial invoice.
              </li>
              <li>
                Mismatched information between the invoice, packing list, and shipping label.
              </li>
              <li>
                Missing a signature or date on a document that requires one.
              </li>
              <li>
                Not checking the destination country&rsquo;s specific import requirements before
                the shipment leaves.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="A Simple Pre Shipment Checklist">
            <ul>
              <li>Commercial invoice prepared, signed, and matching the packing list</li>
              <li>Packing list itemized with accurate quantities and weights</li>
              <li>Certificate of origin included if applicable</li>
              <li>Any required permits or licenses confirmed before booking</li>
              <li>Recipient&rsquo;s full name, address, and phone number double checked</li>
              <li>Declared value reflects the goods&rsquo; actual, honest worth</li>
            </ul>
          </LegalSection>

          <LegalSection title="How TYS Helps">
            <p>
              Our team reviews documentation as part of every international shipment we handle, so
              issues get caught before your package leaves, not after it&rsquo;s already stuck at a
              border. If you&rsquo;re shipping documents themselves internationally, our{" "}
              <Link href="/services/document-shipping">document shipping service</Link> is built
              specifically for time sensitive paperwork. For freight and commercial cargo, see our{" "}
              <Link href="/services/freight-forwarding">freight forwarding</Link> page, or{" "}
              <Link href="/quotes">get a quote</Link> and we&rsquo;ll walk you through exactly what
              your shipment needs.
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
