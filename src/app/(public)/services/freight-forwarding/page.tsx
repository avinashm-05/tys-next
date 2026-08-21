import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
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
import { HeadsetIcon, FileTextIcon, PackageIcon, MapPinLineIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Freight Forwarding — TYS Global Logistics",
  description: "Origin and destination freight services for household, auto, and commercial cargo.",
  path: "/services/freight-forwarding",
});

export default function FreightForwardingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Freight Forwarding", path: "/services/freight-forwarding" },
        ]}
      />
      <ServiceJsonLd name="Freight Forwarding" description="Origin and destination freight services for household, auto, and commercial cargo." slug="freight-forwarding" />
      <PageHeroBand
        title="Freight Forwarding"
        subtitle="Ship containers, pallets, and commercial cargo with dependable origin and destination services — from pickup to final delivery."
      />
      <ServiceCtaBanner />

      <ServiceIntro
        eyebrow="Origin & Destination Services"
        heading="Freight Solutions From Origin to Destination"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "Carriers" },
          { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Assistance" },
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
        ]}
      >
        <p>
          TYS Global Logistics offers a full range of customizable freight solutions for
          household, automobile, and commercial cargo moving worldwide. From the first pickup to
          final delivery, our team manages the process end-to-end so your cargo moves through
          customs and across borders without a hitch.
        </p>
        <p>
          Every shipment gets a dedicated coordinator, from your first quote through final
          delivery.
        </p>
      </ServiceIntro>

      <ServiceCardGrid
        title="Why Ship Freight With TYS"
        columns={4}
        cards={[
          {
            icon: <HeadsetIcon size={22} />,
            title: "Dedicated Coordinator",
            body: "One representative manages your shipment from quote to final delivery.",
          },
          {
            icon: <FileTextIcon size={22} />,
            title: "Experienced Customs Handling",
            body: "Our customs team handles import/export regulations so your cargo clears without delays.",
          },
          {
            icon: <PackageIcon size={22} />,
            title: "Full-Service Removal",
            body: "Packing, loading, transportation, customs clearance, and unpacking — tailored to your shipment.",
          },
          {
            icon: <MapPinLineIcon size={22} />,
            title: "Real-Time Status Updates",
            body: "Track your cargo's progress from origin to destination.",
          },
        ]}
      />

      <ServiceChecklist
        title="Origin Services"
        items={[
          "Onsite or online cargo survey",
          "Export documentation and customs filing",
          "Export packing, loading, and inventory",
          "Cargo consolidation for smaller shipments",
          "Container haulage to port or yard",
          "Ocean freight to the destination port",
        ]}
      />

      <ServiceChecklist
        title="Destination Services"
        tone="white"
        items={[
          "Customs clearance at the destination",
          "Container haulage from port or yard",
          "Unloading, unpacking, and assembly",
          "Proof-of-delivery inventory",
          "Handling of pallets, crates, and debris removal",
          "Nationwide ground transport to final delivery",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "What's the difference between origin and destination services?",
            a: "Origin services cover everything before your cargo ships — survey, packing, export documentation, and loading. Destination services pick up from there — customs clearance, unloading, and final delivery.",
          },
          {
            q: "Do you handle customs clearance?",
            a: "Yes, our team manages customs documentation and clearance at both origin and destination.",
          },
          {
            q: "Can you ship commercial cargo and household goods together?",
            a: "We tailor origin and destination services for household goods, automobiles, and commercial cargo — ask your coordinator about combining shipments.",
          },
          {
            q: "Will I have one point of contact?",
            a: "Yes — a dedicated coordinator manages your shipment from your first quote through final delivery.",
          },
          {
            q: "Do you offer storage if my cargo arrives before I'm ready?",
            a: "Yes, short- and long-term storage is available at origin and destination.",
          },
          {
            q: "What modes of transport do you support?",
            a: "We coordinate ocean, ground, and container freight depending on your cargo and timeline.",
          },
        ]}
      />


      <TrustedReviewsSection />
    </>
  );
}
