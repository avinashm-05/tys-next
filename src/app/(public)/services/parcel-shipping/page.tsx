import type { Metadata } from "next";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import {
  ServiceIntro,
  ServiceCardGrid,
  ServiceChecklist,
  ServiceFaq,
  ServiceCtaBanner,
} from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { TruckIcon, AirplaneTiltIcon, AnchorIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Parcel Shipping — TYS Global Logistics",
  description: "Ship parcels of any size to nearly 200 destinations worldwide.",
};

export default function ParcelShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Parcel Shipping", path: "/services/parcel-shipping" },
        ]}
      />
      <ServiceJsonLd name="Parcel Shipping" description="Ship parcels of any size to nearly 200 destinations worldwide." slug="parcel-shipping" />
      <PageHeroBand
        title="Parcel Shipping"
        subtitle="Ship parcels of any size to nearly 200 destinations worldwide, with a mode of transport that fits your budget and timeline."
      />

      <ServiceIntro
        eyebrow="Worldwide Parcel Shipping"
        heading="Ship Parcels Anywhere, Any Size"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "Carriers" },
          { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Destinations" },
          { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Assistance" },
        ]}
      >
        <p>
          Whether you&rsquo;re sending a care package to family overseas or fulfilling orders for
          customers around the world, TYS Global Logistics ships parcels of any size to nearly 200
          destinations.
        </p>
        <p>
          Real-time tracking and a dedicated shipping advisor mean you always know where your
          parcel is — and so does your recipient.
        </p>
      </ServiceIntro>

      <ServiceCardGrid
        title="Choose Your Mode of Transport"
        columns={3}
        cards={[
          {
            icon: <TruckIcon size={22} />,
            title: "Ground",
            body: "Our vast network of ground carriers moves parcels at highly affordable rates.",
          },
          {
            icon: <AirplaneTiltIcon size={22} />,
            title: "Air",
            body: "The fastest option — air shipments can deliver in as little as overnight.",
          },
          {
            icon: <AnchorIcon size={22} />,
            title: "Ocean",
            body: "The most economical option for larger shipments, typically a few weeks in transit.",
          },
        ]}
      />

      <ServiceChecklist
        title="Smart Shipping Tips"
        items={[
          "Choose packaging sized to your item — extra bulk adds to dimensional weight and cost",
          "Ground is budget-friendly, air is fastest, ocean is most economical for larger loads",
          "Add shipping insurance for valuable or fragile items",
          "Prepare accurate customs documentation to avoid delays at the border",
          "Check destination-specific restrictions before you ship",
        ]}
      />

      <ServiceChecklist
        title="Documents You May Need"
        tone="white"
        items={[
          "Commercial invoice",
          "Shipping and tracking label",
          "Packing list",
          "Certificate of origin (for select destinations)",
          "Export information (for higher-value shipments)",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "How long does international parcel shipping take?",
            a: "It depends on the mode: air can arrive in as little as overnight, ground takes longer but costs less, and ocean is the most economical for larger shipments, typically taking a few weeks.",
          },
          {
            q: "What documents do I need for an international parcel?",
            a: "Most shipments need a commercial invoice, a shipping/tracking label, and a packing list. Higher-value or restricted-destination shipments may need additional paperwork like a certificate of origin.",
          },
          {
            q: "Should I insure my parcel?",
            a: "We recommend shipping insurance for valuable or fragile items in case of loss or damage in transit.",
          },
          {
            q: "How is my shipping cost calculated?",
            a: "Cost depends on your parcel's dimensional weight (size and packaging, not just actual weight), the destination, and the mode of transport you choose.",
          },
          {
            q: "Can I track my parcel?",
            a: "Yes — every shipment includes a tracking number you can follow from pickup to delivery.",
          },
          {
            q: "Are there items I can't ship internationally?",
            a: "Yes, prohibited and restricted items vary by destination country. Ask your shipping advisor before you book if you're unsure.",
          },
        ]}
      />

      <ServiceCtaBanner />

      <TrustedReviewsSection />
    </>
  );
}
