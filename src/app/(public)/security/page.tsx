import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { LegalSection } from "@/components/public/legal-section";

export const metadata: Metadata = pageMetadata({
  title: "Security — TYS Global Logistics",
  description: "How TYS Global Logistics protects your shipment and your data, from collection through to delivery.",
  path: "/security",
});

export default function SecurityPage() {
  return (
    <>
      <PageHeroBand title="Security" subtitle="How we protect your information" />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <LegalSection title="Our Approach to Security">
            <p>
              TYS Global Logistics takes the security of your information seriously. Our website
              uses encrypted connections (HTTPS/TLS) to protect data as it travels between your
              browser and our servers, including the details you submit through our quote and
              contact forms.
            </p>
          </LegalSection>

          <LegalSection title="How to Verify a Secure Connection">
            <p>
              You can confirm you&rsquo;re on a secure connection by checking that the page address
              begins with <span className="font-mono text-ink">https://</span>{" "}
              and shows a padlock icon in your browser&rsquo;s address bar before entering any
              personal information.
            </p>
          </LegalSection>

          <LegalSection title="Account Security">
            <p>
              If you create a TYS Global Logistics account, we recommend using a strong, unique
              password and keeping your login details confidential. Contact us right away if you
              believe your account has been accessed without your permission.
            </p>
          </LegalSection>

          <LegalSection title="Still Have Concerns?">
            <p>
              If you have questions about how we protect your information, or would prefer to
              submit sensitive details over the phone instead of online, contact us at{" "}
              <a href="mailto:sales@tysgloballogistics.com">sales@tysgloballogistics.com</a> or{" "}
              <a href="tel:+14047938759">+1 (404) 793-8759</a>.
            </p>
          </LegalSection>

          {/* Expanded from 150 words (audit, 2026-08-21). The page previously
              covered only *data* security; "is my shipment safe" is the other
              half of what someone landing here is asking. */}
          <LegalSection title="Keeping Your Shipment Secure">
            <p>
              Every shipment we book moves through established global carrier networks — the
              same chain of custody, facility security and scanning those carriers apply to
              their own retail traffic. Each shipment is tracked from collection to delivery, so
              there is a record of every facility it passes through.
            </p>
            <p>
              We ask for accurate contents descriptions on every booking, and we will not carry
              items that are restricted or prohibited by the carrier or the destination country.
              That is partly a legal requirement and partly practical: an inaccurate declaration
              is one of the most common reasons a shipment is held or seized at customs. Our{" "}
              <a href="/resources/prohibited-items">prohibited items guide</a> sets out what
              cannot be shipped and why.
            </p>
            <p>
              For high-value shipments we recommend arranging cover before collection. Standard
              carrier liability is limited and is not the same thing as insurance — talk to us
              before you book and we will explain what applies to your specific shipment.
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
