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
import { ScalesIcon, HeadsetIcon, TruckIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Volume Shipping — TYS Global Logistics",
  description: "Consistent rates and dedicated support for businesses shipping in volume.",
};

export default function VolumeShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Volume Shipping", path: "/services/volume-shipping" },
        ]}
      />
      <ServiceJsonLd name="Volume Shipping" description="Consistent rates and dedicated support for businesses shipping in volume." slug="volume-shipping" />
      <PageHeroBand
        title="Volume Shipping"
        subtitle="Consistent rates and dedicated support for businesses shipping in volume, every week."
      />

      <ServiceIntro
        eyebrow="For High-Volume Shippers"
        heading="Shipping Built to Scale With Your Business"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority Support", sub: "Dedicated support for businesses" },
          { icon: "/frontend/icons/redesign/badge-business-accounts.svg", label: "Business Accounts", sub: "Manage all your shipments in one place" },
          { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "Carriers" },
        ]}
      >
        <p>
          TYS Global Logistics built a shipping program for businesses that ship often — not just
          once in a while. Whether you&rsquo;re moving a few packages a week or hundreds a month,
          our volume-based model gets you consistent pricing, reliable pickup schedules, and a
          dedicated advisor who knows your account.
        </p>
      </ServiceIntro>

      <ServiceCardGrid
        title="Built for Frequent Shippers"
        columns={4}
        cards={[
          {
            icon: <ScalesIcon size={22} />,
            title: "Price Comparison",
            body: "Compare rates and delivery times across carriers before you book.",
          },
          {
            icon: <HeadsetIcon size={22} />,
            title: "Dedicated Advisor",
            body: "One point of contact who manages your account from pickup to delivery.",
          },
          {
            icon: <TruckIcon size={22} />,
            title: "Flexible Carrier Network",
            body: "Ship with the right carrier for every shipment's budget and timeline.",
          },
          {
            icon: <UsersIcon size={22} />,
            title: "Business Support",
            body: "A team that's available whenever you have a shipping question.",
          },
        ]}
      />

      <ServiceChecklist
        title="Ways to Lower Your Shipping Costs"
        items={[
          "Group smaller shipments into larger ones when you can",
          "Choose the right packaging — extra material adds to dimensional weight",
          "Pick the service level you actually need; a day or two slower can cost less",
          "Keep customs documentation accurate and complete to avoid delays",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "How much volume do I need to ship to qualify?",
            a: "There's no strict minimum — the program is built for businesses that ship regularly, whether that's a few packages a week or hundreds a month.",
          },
          {
            q: "Will I have one point of contact?",
            a: "Yes — every volume shipping account gets a dedicated advisor who manages your shipments from pickup to delivery.",
          },
          {
            q: "Can I compare rates across carriers?",
            a: "Yes, we help you compare rates and delivery times across carriers so you can choose what fits your budget and timeline.",
          },
          {
            q: "How can I lower my shipping costs?",
            a: "Group smaller shipments together, use appropriately sized packaging, and choose the service level you actually need — a day or two slower can cost significantly less.",
          },
          {
            q: "Do you support both domestic and international volume shipping?",
            a: "Yes, our volume shipping program covers both domestic and international routes.",
          },
        ]}
      />

      <ServiceCtaBanner />

      <TrustedReviewsSection />
    </>
  );
}
