import type { Metadata } from "next";
import { PageHeroBand } from "@/components/public/page-hero-band";
import {
  ServiceIntro,
  ServiceSteps,
  ServiceChecklist,
  ServiceCardGrid,
  ServiceFaq,
  ServiceCtaBanner,
} from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { HeadsetIcon, TruckIcon, MapPinLineIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Domestic Moving — TYS Global Logistics",
  description: "A simpler way to move within the United States, from the first box packed to the last one delivered.",
};

export default function DomesticMovingPage() {
  return (
    <>
      <PageHeroBand
        title="Domestic Moving"
        subtitle="A simpler way to move within the United States — from the first box packed to the last one delivered."
      />

      <ServiceIntro
        eyebrow="Nationwide Domestic Relocation"
        heading="Moving Made Simple, Coast to Coast"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door-to-Door", sub: "Service" },
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
          { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "Carriers" },
        ]}
      >
        <p>
          TYS Global Logistics takes the stress out of domestic relocation. From your first quote
          through final delivery, a dedicated moving advisor guides you through every step of your
          move.
        </p>
        <p>
          Whether it&rsquo;s a studio apartment or a full household, we plan the details so you
          don&rsquo;t have to.
        </p>
      </ServiceIntro>

      <ServiceSteps
        title="How Your Move Works"
        steps={[
          {
            title: "Free Survey & Quote",
            body: "Tell us about your move — we'll survey your items and give you an upfront quote.",
          },
          {
            title: "Dedicated Moving Advisor",
            body: "One advisor guides you through planning, packing, and scheduling.",
          },
          {
            title: "Packing & Loading",
            body: "Our team disassembles, packs, and loads your belongings with care.",
          },
          {
            title: "Delivery & Setup",
            body: "We unload, unpack, and reassemble furniture at your new home.",
          },
        ]}
      />

      <ServiceChecklist
        title="What's Included in Your Move"
        items={[
          "Free on-site or virtual survey",
          "Packing list and insurance documentation",
          "Disassembly and packing of household goods",
          "Loading and transportation to your destination",
          "Unloading, unpacking, and furniture assembly",
          "Removal of packing debris",
          "In-transit storage, if needed",
        ]}
      />

      <ServiceCardGrid
        title="Why Move With TYS"
        columns={4}
        cards={[
          {
            icon: <HeadsetIcon size={22} />,
            title: "Dedicated Moving Advisor",
            body: "One advisor manages your move door-to-door, from planning to delivery.",
          },
          {
            icon: <TruckIcon size={22} />,
            title: "Door Pickup & Delivery",
            body: "Complete door-to-door support, with extra care for fragile items.",
          },
          {
            icon: <MapPinLineIcon size={22} />,
            title: "Real-Time Tracking",
            body: "Track your belongings from pickup to delivery.",
          },
          {
            icon: <UsersIcon size={22} />,
            title: "Responsive Support",
            body: "Our team is available to answer questions before, during, and after your move.",
          },
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "Do you provide packing materials and help?",
            a: "Yes, our team can disassemble and pack household goods, and provides packing list and insurance documentation.",
          },
          {
            q: "Will I have one point of contact for my move?",
            a: "Yes, a dedicated moving advisor guides you through every step, from quote to delivery.",
          },
          {
            q: "Can I store my belongings if my new home isn't ready?",
            a: "Yes, in-transit storage is available if you need it.",
          },
          {
            q: "Do you handle both local and long-distance domestic moves?",
            a: "Yes, we coordinate moves within and across states nationwide.",
          },
          {
            q: "Can you move my vehicle along with my household goods?",
            a: "Yes, we can coordinate auto transport alongside your household move.",
          },
          {
            q: "Is insurance available for my belongings?",
            a: "Yes, insurance options are available and detailed in your move documentation.",
          },
        ]}
      />

      <ServiceCtaBanner />

      <TrustedReviewsSection />
    </>
  );
}
