import type { Metadata } from "next";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import {
  ServiceIntro,
  ServiceSteps,
  ServiceChecklist,
  ServiceFaq,
  ServiceCtaBanner,
} from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = {
  title: "Document Shipping — TYS Global Logistics",
  description: "Secure, trackable worldwide delivery for contracts, visas, and legal filings.",
};

export default function DocumentShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Document Shipping", path: "/services/document-shipping" },
        ]}
      />
      <ServiceJsonLd name="Document Shipping" description="Secure, trackable worldwide delivery for contracts, visas, and legal filings." slug="document-shipping" />
      <PageHeroBand
        title="Document Shipping"
        subtitle="Secure, trackable delivery for contracts, visas, legal filings, and other time-sensitive paperwork."
      />

      <ServiceIntro
        eyebrow="Secure Document Delivery"
        heading="Send Important Documents With Confidence"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "Carriers" },
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
          { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Destinations" },
        ]}
      >
        <p>
          TYS Global Logistics handles secure, trackable delivery for contracts, visas, legal
          filings, and other time-sensitive paperwork — from a single envelope to a full case
          file. Every document shipment travels in a protective express envelope with a tracking
          number from pickup to signature.
        </p>
        <p>
          Our team can guide you through carrier selection, weight limits, and destination-specific
          rules so your documents arrive quickly and without a hitch.
        </p>
      </ServiceIntro>

      <ServiceSteps
        title="How to Ship a Document"
        steps={[
          {
            title: "Schedule Your Shipment",
            body: "Enter sender, receiver, and package details when you request your quote.",
          },
          {
            title: "Prepare Your Envelope",
            body: "Pack your documents in a protective express envelope — we'll guide you on requirements.",
          },
          {
            title: "Drop Off or Schedule Pickup",
            body: "Hand it off at a nearby drop-off point, or ask about door pickup.",
          },
        ]}
      />

      <ServiceChecklist
        title="Good to Know Before You Ship"
        items={[
          "Envelopes with paper-only contents typically clear customs without duties or delays",
          "Non-paper items (keys, jewelry, small gifts) can trigger customs charges — ship those separately",
          "Most document envelopes are capped around 0.5 lb — ask us about your carrier's limit",
          "Every shipment ships with a tracking number you can follow from pickup to delivery",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "What's the best way to ship an important document?",
            a: "We recommend a protective express envelope for sensitive documents — it's one of the fastest and most secure ways to get paperwork to its destination.",
          },
          {
            q: "What can I ship in a document envelope?",
            a: "Paper-only contents — contracts, certificates, filings, and similar paperwork. Non-paper items like keys or jewelry aren't eligible and can trigger customs delays.",
          },
          {
            q: "Can I track my document shipment?",
            a: "Yes — every shipment includes a tracking number so you can follow it from pickup to delivery.",
          },
          {
            q: "Do you offer door pickup for documents?",
            a: "Yes, door pickup is available on most document shipments — just let us know when you request your quote.",
          },
          {
            q: "Is there a weight limit for document envelopes?",
            a: "Most carriers cap document envelopes around 0.5 lb (8 oz). We'll help you pick the right option if your paperwork runs heavier.",
          },
        ]}
      />

      <ServiceCtaBanner />

      <TrustedReviewsSection />
    </>
  );
}
