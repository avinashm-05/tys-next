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
import { StorefrontIcon, WarehouseIcon, PackageIcon, CarSimpleIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Retailer Shipping — TYS Global Logistics",
  description: "Fulfillment-ready shipping for retailers, e-commerce brands, and wholesalers.",
  path: "/services/retailer-shipping",
});

export default function RetailerShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Retailer Shipping", path: "/services/retailer-shipping" },
        ]}
      />
      <ServiceJsonLd name="Retailer Shipping" description="Fulfillment-ready shipping for retailers, e-commerce brands, and wholesalers." slug="retailer-shipping" />
      <PageHeroBand
        title="Retailer Shipping"
        subtitle="Fulfillment-ready shipping for retailers, e-commerce brands, and wholesalers shipping to customers everywhere."
      />
      <ServiceCtaBanner />

      <ServiceIntro
        eyebrow="For Retailers & E-Commerce"
        heading="Shipping That Keeps Your Customers Coming Back"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-business-accounts.svg", label: "Business Accounts", sub: "Manage all your shipments in one place" },
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
          { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Destinations" },
        ]}
      >
        <p>
          From wholesalers and fulfillment centers to e-commerce storefronts, TYS Global
          Logistics helps retailers ship orders — and handle returns — without slowing down.
          Consistent transit times and real-time tracking keep your customers informed from
          checkout to delivery.
        </p>
      </ServiceIntro>

      <ServiceCardGrid
        title="Built for Retail & E-Commerce"
        columns={4}
        cards={[
          {
            icon: <StorefrontIcon size={22} />,
            title: "Wholesalers & Retailers",
            body: "Consistent shipping schedules to keep your shelves and orders moving.",
          },
          {
            icon: <WarehouseIcon size={22} />,
            title: "Fulfillment Centers",
            body: "Reliable pickup and transit times that keep customer orders on schedule.",
          },
          {
            icon: <PackageIcon size={22} />,
            title: "E-Commerce Storefronts",
            body: "Ship direct-to-customer orders anywhere, with tracking your customers can follow.",
          },
          {
            icon: <CarSimpleIcon size={22} />,
            title: "Auto & Equipment Dealers",
            body: "Coordinated shipping for dealerships and businesses that move larger items.",
          },
        ]}
      />

      <ServiceChecklist
        title="Hassle-Free Returns"
        items={[
          "Prepaid return labels for your customers",
          "Scheduled pickup for return shipments",
          "Call tags so customers can arrange a pickup without a trip to a drop-off point",
          "Real-time tracking on every outbound and return shipment",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "Do you support e-commerce order fulfillment?",
            a: "Yes — we ship direct-to-customer orders for e-commerce storefronts, with tracking your customers can follow.",
          },
          {
            q: "Can you handle returns for my business?",
            a: "Yes. We offer prepaid return labels, scheduled pickups, and call tags so your customers can return items without a hassle.",
          },
          {
            q: "Do you work with fulfillment centers?",
            a: "Yes, we coordinate reliable pickup and transit schedules with fulfillment centers to keep customer orders on time.",
          },
          {
            q: "Is there a business account option?",
            a: "Yes — a business account lets you manage all your shipments in one place.",
          },
          {
            q: "Can you ship larger items like vehicles or equipment?",
            a: "Yes, we support coordinated shipping for dealerships and businesses moving larger items alongside standard parcel shipments.",
          },
        ]}
      />


      <TrustedReviewsSection />
    </>
  );
}
