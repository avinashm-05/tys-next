import type { Metadata } from "next";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { LegalSection } from "@/components/public/legal-section";

export const metadata: Metadata = { title: "Terms & Conditions — TYS Global Logistics" };

export default function TermsPage() {
  return (
    <>
      <PageHeroBand title="Terms & Conditions" subtitle="Last updated: July 2026" />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <LegalSection title="Acceptance of Terms">
            <p>
              These Terms &amp; Conditions govern your use of the TYS Global Logistics website and
              our shipping, moving, and freight services. By requesting a quote, booking a
              shipment, or otherwise using our services, you agree to be bound by these terms. If
              you do not agree, please do not use our services.
            </p>
          </LegalSection>

          <LegalSection title="Our Services">
            <p>
              TYS Global Logistics arranges domestic and international shipping, relocation, auto
              transport, and freight forwarding services. We work with a network of carriers and
              partners to move your shipment from origin to destination. Specific rates, transit
              times, and service availability are provided at the time of your quote and may vary
              based on the details of your actual shipment.
            </p>
          </LegalSection>

          <LegalSection title="Booking & Shipment Details">
            <ul>
              <li>
                You are responsible for providing accurate sender, recipient, and shipment
                information, including weight, dimensions, and contents.
              </li>
              <li>
                Shipping charges are based on the greater of actual weight or dimensional
                (volumetric) weight, calculated as length × width × height ÷ the applicable
                carrier divisor.
              </li>
              <li>
                Shipments must be properly packed in a container suitable for transport. We may
                decline shipments that are inadequately packaged.
              </li>
              <li>
                You are responsible for ensuring your shipment complies with the customs
                regulations, prohibited-item restrictions, and import/export laws of both the
                origin and destination countries.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="Prohibited Items">
            <p>
              We do not accept shipments containing items that are illegal, hazardous, or
              prohibited by the carrier, the origin country, or the destination country. This
              includes (without limitation) hazardous materials, illegal substances, and items
              restricted under applicable transportation or customs regulations. Contact us if
              you&rsquo;re unsure whether an item can be shipped.
            </p>
          </LegalSection>

          <LegalSection title="Rates & Payment">
            <p>
              Quoted rates are estimates based on the information you provide and are subject to
              change if the actual shipment differs (in weight, dimensions, destination, or
              contents) from what was quoted. Payment is due according to the terms provided at
              the time of booking.
            </p>
          </LegalSection>

          <LegalSection title="Delays & Circumstances Beyond Our Control">
            <p>
              Transit times provided by us or our carrier partners are estimates, not guarantees.
              We are not responsible for delays caused by weather, customs processing, carrier
              disruptions, incorrect address information, or other circumstances outside our
              reasonable control.
            </p>
          </LegalSection>

          <LegalSection title="Limitation of Liability">
            <p>
              To the extent permitted by law, TYS Global Logistics&rsquo; liability for any loss
              or damage to a shipment is limited to the declared value of the shipment or the
              limits set by the carrier and any applicable insurance, whichever applies. We are
              not liable for indirect, incidental, or consequential damages, including lost
              profits, arising from your use of our services.
            </p>
          </LegalSection>

          <LegalSection title="Changes to These Terms">
            <p>
              We may update these Terms &amp; Conditions from time to time. Changes take effect
              once posted on this page. Continuing to use our services after a change means you
              accept the updated terms.
            </p>
          </LegalSection>

          <LegalSection title="Governing Law">
            <p>
              These terms are governed by the laws of the State of Georgia, USA, without regard to
              its conflict-of-law principles.
            </p>
          </LegalSection>

          <LegalSection title="Contact Us">
            <p>
              Questions about these terms? Reach us at{" "}
              <a href="mailto:sales@tysgloballogistics.com">sales@tysgloballogistics.com</a> or{" "}
              <a href="tel:+14047938759">+1 (404) 793-8759</a>.
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
