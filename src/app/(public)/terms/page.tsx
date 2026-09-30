import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { PageBody, Prose } from "@/components/public/page-kit";
import { TopicScroller, type Topic } from "@/components/public/topic-scroller";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Terms and Conditions | TYS Global Logistics",
  description:
    "The terms and conditions that apply to the shipping, moving, auto transport and freight services arranged by TYS Global Logistics, and to use of this website.",
  path: "/terms",
});

// Each section of the terms is a topic in the sticky table of contents
// (TopicScroller). Wording is the terms' own; only punctuation and headings
// were tidied in the 2026-09-29 renovation.
const TOPICS: Topic[] = [
  {
    id: "acceptance-of-terms",
    title: "Acceptance of terms",
    content: (
      <Prose>
        <p>
          These Terms &amp; Conditions govern your use of the TYS Global Logistics website
          and our shipping, moving, and freight services. By requesting a quote, booking a
          shipment, or otherwise using our services, you agree to be bound by these terms.
          If you do not agree, please do not use our services.
        </p>
      </Prose>
    ),
  },
  {
    id: "our-services",
    title: "Our services",
    content: (
      <Prose>
        <p>
          TYS Global Logistics arranges domestic and international shipping, relocation,
          auto transport, and freight forwarding services. We work with a network of
          carriers and partners to move your shipment from origin to destination. Specific
          rates, transit times, and service availability are provided at the time of your
          quote and may vary based on the details of your actual shipment.
        </p>
      </Prose>
    ),
  },
  {
    id: "booking-and-shipment-details",
    title: "Booking and shipment details",
    content: (
      <Prose>
        <ul>
          <li>
            You are responsible for providing accurate sender, recipient, and shipment
            information, including weight, dimensions, and contents.
          </li>
          <li>
            Shipping charges are based on the greater of actual weight or dimensional
            (volumetric) weight, calculated as length &times; width &times; height
            &divide; the applicable carrier divisor.
          </li>
          <li>
            Shipments must be properly packed in a container suitable for transport. We
            may decline shipments that are inadequately packaged.
          </li>
          <li>
            You are responsible for ensuring your shipment complies with the customs
            regulations, prohibited-item restrictions, and import and export laws of both
            the origin and destination countries.
          </li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "prohibited-items",
    title: "Prohibited items",
    content: (
      <Prose>
        <p>
          We do not accept shipments containing items that are illegal, hazardous, or
          prohibited by the carrier, the origin country, or the destination country. This
          includes (without limitation) hazardous materials, illegal substances, and items
          restricted under applicable transportation or customs regulations. Contact us if
          you&rsquo;re unsure whether an item can be shipped.
        </p>
      </Prose>
    ),
  },
  {
    id: "rates-and-payment",
    title: "Rates and payment",
    content: (
      <Prose>
        <p>
          Quoted rates are estimates based on the information you provide and are subject
          to change if the actual shipment differs (in weight, dimensions, destination, or
          contents) from what was quoted. Payment is due according to the terms provided
          at the time of booking.
        </p>
      </Prose>
    ),
  },
  {
    id: "delays",
    title: "Delays and circumstances beyond our control",
    content: (
      <Prose>
        <p>
          Transit times provided by us or our carrier partners are estimates, not
          guarantees. We are not responsible for delays caused by weather, customs
          processing, carrier disruptions, incorrect address information, or other
          circumstances outside our reasonable control.
        </p>
      </Prose>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of liability",
    content: (
      <Prose>
        <p>
          To the extent permitted by law, TYS Global Logistics&rsquo; liability for any
          loss or damage to a shipment is limited to the declared value of the shipment or
          the limits set by the carrier and any applicable insurance, whichever applies.
          We are not liable for indirect, incidental, or consequential damages, including
          lost profits, arising from your use of our services.
        </p>
      </Prose>
    ),
  },
  {
    id: "changes-to-these-terms",
    title: "Changes to these terms",
    content: (
      <Prose>
        <p>
          We may update these Terms &amp; Conditions from time to time. Changes take
          effect once posted on this page. Continuing to use our services after a change
          means you accept the updated terms.
        </p>
      </Prose>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    content: (
      <Prose>
        <p>
          These terms are governed by the laws of the State of Georgia, USA, without
          regard to its conflict-of-law principles.
        </p>
      </Prose>
    ),
  },
  {
    id: "contact-us",
    title: "Contact us",
    content: (
      <Prose>
        <p>
          Questions about these terms? Reach us at{" "}
          <a href="mailto:sales@tysgloballogistics.com">sales@tysgloballogistics.com</a>{" "}
          or <a href="tel:+14047938759">+1 (404) 793-8759</a>.
        </p>
      </Prose>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Terms and Conditions", path: "/terms" },
        ]}
      />
      <PageHeroBand
        quote={false}
        kicker="Legal"
        title="Terms and conditions"
        subtitle="Last updated: July 2026"
      />

      <PageBody>
        <TopicScroller topics={TOPICS} />
      </PageBody>
    </>
  );
}
