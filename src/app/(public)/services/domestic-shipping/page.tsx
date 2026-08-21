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
import {
  TruckIcon,
  AirplaneTiltIcon,
  TimerIcon,
  PackageIcon,
  EnvelopeIcon,
  CubeIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Domestic Shipping — TYS Global Logistics",
  description: "Fast, affordable shipping across all 50 states — parcels, freight, and everything in between.",
  path: "/services/domestic-shipping",
});

export default function DomesticShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Domestic Shipping", path: "/services/domestic-shipping" },
        ]}
      />
      <ServiceJsonLd name="Domestic Shipping" description="Fast, affordable shipping across all 50 states — parcels, freight, and everything in between." slug="domestic-shipping" />
      <PageHeroBand
        title="Domestic Shipping"
        subtitle="Fast, affordable shipping across all 50 states — parcels, freight, and everything in between."
      />
      <ServiceCtaBanner />

      <ServiceIntro
        eyebrow="Nationwide Domestic Shipping"
        heading="One Shipping Partner for Everything You Send"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "Carriers" },
          { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door-to-Door", sub: "Service" },
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
        ]}
      >
        <p>
          TYS Global Logistics covers parcels, heavy boxes, freight, and business orders with one
          simple shipping service. Choose economy when price matters most, standard for everyday
          balance, or express when you&rsquo;re working against a deadline.
        </p>
        <p>
          Every shipment ships with a tracking number and a dedicated advisor who&rsquo;s
          available from pickup to delivery.
        </p>
      </ServiceIntro>

      <ServiceCardGrid
        title="Shipping Speeds to Fit Your Timeline"
        columns={3}
        cards={[
          {
            icon: <TruckIcon size={22} />,
            title: "Ground",
            body: "The most economical option for regional and cross-country shipments.",
          },
          {
            icon: <AirplaneTiltIcon size={22} />,
            title: "Express",
            body: "1 to 3 business days for time-critical shipments.",
          },
          {
            icon: <TimerIcon size={22} />,
            title: "Same-Day & Next-Day",
            body: "Available on select routes for urgent deliveries.",
          },
        ]}
      />

      <div className="bg-gray-50">
        <ServiceCardGrid
          title="What We Ship"
          columns={4}
          cards={[
            {
              icon: <PackageIcon size={22} />,
              title: "Small Parcels & Packages",
              body: "Everyday parcels, gifts, and online orders — reliable speed without freight-level complexity.",
            },
            {
              icon: <EnvelopeIcon size={22} />,
              title: "Envelopes",
              body: "Contracts, legal papers, and time-sensitive mail with fast delivery and proof of delivery.",
            },
            {
              icon: <CubeIcon size={22} />,
              title: "Large Boxes & Bulk Shipments",
              body: "Multi-carton moves and pallet-ready loads for homes and businesses.",
            },
            {
              icon: <ShieldCheckIcon size={22} />,
              title: "Fragile & High-Value Items",
              body: "Extra packing guidance and careful handling, with insurance available.",
            },
          ]}
        />
      </div>

      <ServiceChecklist
        title="Packaging Tips for a Smooth Delivery"
        items={[
          "Choose a box or envelope sized to your item — not oversized",
          "Wrap fragile items individually and cushion them on all sides",
          "Print labels clearly and keep them off seams",
          "Place heavier items at the bottom and seal every seam",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "How long does domestic shipping take?",
            a: "It depends on the service level — economy typically takes 3 to 8 business days, standard 2 to 5 days, and express 1 to 3 days.",
          },
          {
            q: "Do you offer same-day or next-day delivery?",
            a: "Yes, on select routes for urgent shipments — ask your shipping advisor if it's available for your route.",
          },
          {
            q: "Can you ship heavy or freight items domestically?",
            a: "Yes, we handle pallets, crates, and heavier loads through our domestic freight service.",
          },
          {
            q: "Do you support business and e-commerce shipping?",
            a: "Yes — we support label creation, batch pickups, and recurring shipments for retailers and online sellers.",
          },
          {
            q: "Is there a minimum shipment size?",
            a: "No minimum weight or contract is required to ship with us.",
          },
          {
            q: "Can I track my domestic shipment?",
            a: "Yes, every shipment includes a tracking number with real-time updates.",
          },
        ]}
      />


      <TrustedReviewsSection />
    </>
  );
}
