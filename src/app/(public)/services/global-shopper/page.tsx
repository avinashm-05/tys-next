import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import {
  ServiceIntro,
  ServiceSteps,
  ServiceCardGrid,
  ServiceChecklist,
  ServiceFaq,
  ServiceCtaBanner,
} from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { TruckIcon, EnvelopeIcon, HeadsetIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Global Shopper — TYS Global Logistics",
  description: "Shop US stores with a free U.S. address and ship your purchases anywhere in the world.",
  path: "/services/global-shopper",
});

export default function GlobalShopperPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Global Shopper", path: "/services/global-shopper" },
        ]}
      />
      <ServiceJsonLd name="Global Shopper" description="Shop US stores with a free U.S. address and ship your purchases anywhere in the world." slug="global-shopper" />
      <PageHeroBand
        title="Global Shopper"
        subtitle="Shop from your favorite US stores and let TYS Global Logistics ship it all to your door, anywhere in the world."
      />
      <ServiceCtaBanner />

      <ServiceIntro
        eyebrow="Shop US Stores, Ship Worldwide"
        heading="Your Free U.S. Address for Global Shopping"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "Carriers" },
          { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Destinations" },
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
        ]}
      >
        <p>
          TYS Global Logistics gives you a free U.S. address so you can shop at your favorite
          American stores and have purchases shipped to your door anywhere in the world. Order
          from multiple stores, hold everything at your U.S. address, and ship it all together
          when you&rsquo;re ready.
        </p>
        <p>
          Consolidating shipments into one box is one of the easiest ways to save on
          international shipping.
        </p>
      </ServiceIntro>

      <ServiceSteps
        title="How Global Shopper Works"
        steps={[
          {
            title: "Register for a Free U.S. Address",
            body: "Sign up and get a U.S. shipping address in minutes.",
          },
          {
            title: "Shop Your Favorite US Stores",
            body: "Order from any store and ship to your new U.S. address.",
          },
          {
            title: "Consolidate Your Packages",
            body: "Hold multiple orders at your address and combine them into one shipment.",
          },
          {
            title: "Ship Worldwide",
            body: "We package, ship, and deliver your consolidated order to your door.",
          },
        ]}
      />

      <ServiceCardGrid
        title="Why Use Global Shopper"
        columns={4}
        cards={[
          {
            icon: <TruckIcon size={22} />,
            title: "Express Shipping",
            body: "Faster deliveries with real-time tracking and insurance for secure delivery.",
          },
          {
            icon: <EnvelopeIcon size={22} />,
            title: "Mail Forwarding",
            body: "We hold your incoming mail and packages, then ship them together.",
          },
          {
            icon: <HeadsetIcon size={22} />,
            title: "Expert Advisors",
            body: "Guidance on consolidating shipments and keeping shipping costs low.",
          },
          {
            icon: <UserIcon size={22} />,
            title: "Personal Shoppers",
            body: "Optional help ordering, comparing items, and tracking your purchases.",
          },
        ]}
      />

      <ServiceChecklist
        title="What Our Personal Shoppers Can Do"
        items={[
          "Place orders from your shopping list, so you don't have to",
          "Help you find the best item and compare stores",
          "Search for ongoing deals and promotions to save you money",
          "Handle communication with stores on stock, cancellations, and return policies",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "Is there a cost to register for a U.S. address?",
            a: "No — registration is free, with no credit card and no minimum shipping requirement.",
          },
          {
            q: "Can I combine orders from multiple stores into one shipment?",
            a: "Yes — that's the core of Global Shopper. We hold your packages and consolidate them into one shipment when you're ready.",
          },
          {
            q: "Do you offer personal shopping assistance?",
            a: "Yes, personal shoppers are available for a small additional cost to help you order, compare items, and handle store communication.",
          },
          {
            q: "Can I track my consolidated shipment?",
            a: "Yes, every shipment includes real-time tracking from pickup to delivery.",
          },
          {
            q: "Which countries can I ship to?",
            a: "We ship from the U.S. to over 200 destinations worldwide.",
          },
          {
            q: "Is my package insured?",
            a: "Insurance options are available for added protection on your shipment.",
          },
        ]}
      />


      <TrustedReviewsSection />
    </>
  );
}
