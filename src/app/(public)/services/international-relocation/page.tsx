import type { Metadata } from "next";
import { PageHeroBand } from "@/components/public/page-hero-band";
import {
  ServiceIntro,
  ServiceChecklist,
  ServiceCardGrid,
  ServiceFaq,
  ServiceCtaBanner,
} from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  MapPinLineIcon,
  PackageIcon,
  TruckIcon,
  HeadsetIcon,
  HouseIcon,
  BuildingsIcon,
  UsersIcon,
  BankIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "International Relocation — TYS Global Logistics",
  description: "Door-to-door international relocation for your household, family, and belongings.",
};

export default function InternationalRelocationPage() {
  return (
    <>
      <PageHeroBand
        title="International Relocation"
        subtitle="Moving your life to a new country? We handle the logistics so you can focus on the move itself."
      />

      <ServiceIntro
        eyebrow="Door-to-Door Relocation"
        heading="Move Your Home, Anywhere in the World"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door-to-Door", sub: "Service" },
          { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Assistance" },
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
        ]}
      >
        <p>
          TYS Global Logistics connects families and individuals to new destinations across the
          globe. Whether you&rsquo;re relocating for work, school, or a fresh start, our team plans
          every step of your move — from the first box you pack to the last one we deliver.
        </p>
        <p>
          No matter the size of your move, TYS gives you a dedicated team to carry your relocation
          overseas by air, ocean, or ground, at a pace and price that fits your timeline.
        </p>
      </ServiceIntro>

      <ServiceChecklist
        title="What's Included in Your Move"
        items={[
          "Free on-site or virtual survey",
          "Professional packing, with custom crating for fragile items",
          "Export documentation and insurance options",
          "Ocean, air, or ground transportation to your destination",
          "Customs clearance handled at the destination",
          "Delivery, unpacking, and basic furniture assembly",
        ]}
      />

      <ServiceCardGrid
        title="Why Relocate With TYS"
        columns={4}
        cards={[
          {
            icon: <MapPinLineIcon size={22} />,
            title: "Real-Time Tracking",
            body: "Track your shipment door-to-door, from pickup to final delivery.",
          },
          {
            icon: <PackageIcon size={22} />,
            title: "Custom Crating & Packing",
            body: "Careful, professional packing — including custom crating for fragile and high-value items.",
          },
          {
            icon: <TruckIcon size={22} />,
            title: "Door Pickup & Delivery",
            body: "We pick up from your door and deliver to your new one, on most shipments.",
          },
          {
            icon: <HeadsetIcon size={22} />,
            title: "A Dedicated Move Coordinator",
            body: "One point of contact who plans your move and answers every question along the way.",
          },
        ]}
      />

      <div className="bg-gray-50">
        <ServiceCardGrid
          title="Types of Relocation We Handle"
          columns={4}
          cards={[
            {
              icon: <HouseIcon size={22} />,
              title: "Residential Moves",
              body: "Household goods and personal belongings, delivered safely with real-time tracking.",
            },
            {
              icon: <BuildingsIcon size={22} />,
              title: "Office & Business Relocation",
              body: "Move your organization to a new market in a careful, planned process.",
            },
            {
              icon: <UsersIcon size={22} />,
              title: "Employee Relocation",
              body: "Help your team transition smoothly into a new country.",
            },
            {
              icon: <BankIcon size={22} />,
              title: "Organization & Institutional Moves",
              body: "Support for embassies, nonprofits, and other institutions relocating overseas.",
            },
          ]}
        />
      </div>

      <ServiceChecklist
        title="Documents to Prepare for an International Move"
        items={[
          "Passport",
          "Visa (if required for your destination)",
          "Birth certificate",
          "Marriage certificate (if applicable)",
          "Immunization and medical records",
          "School or education records",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "How far in advance should I book my move?",
            a: "As soon as you have a moving date in mind. Booking early gives us more flexibility with your survey, packing schedule, and transportation mode.",
          },
          {
            q: "Do you provide packing materials and services?",
            a: "Yes. Our team handles professional packing, including custom crating for fragile or high-value items.",
          },
          {
            q: "What's the difference between air, ocean, and ground transport?",
            a: "Air is the fastest but most expensive option. Ocean is the most economical for larger household moves but takes longer. Ground works well for regional moves. We'll help you choose based on your timeline and budget.",
          },
          {
            q: "Do I need to be present for customs clearance?",
            a: "No — we handle customs clearance at the destination on your behalf, though you may need to provide documentation in advance.",
          },
          {
            q: "Can you move my vehicle along with my household goods?",
            a: "Yes, we can coordinate an auto transport alongside your relocation so everything follows one schedule.",
          },
          {
            q: "What if my new home isn't ready when my shipment arrives?",
            a: "Let us know ahead of time — we can arrange in-transit storage until you're ready for delivery.",
          },
        ]}
      />

      <ServiceCtaBanner />

      <TrustedReviewsSection />
    </>
  );
}
