import type { Metadata } from "next";
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
import { CarSimpleIcon, SteeringWheelIcon, MotorcycleIcon, VanIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Auto Transport — TYS Global Logistics",
  description: "Nationwide auto transport for cars, motorcycles, and fleet vehicles.",
};

export default function AutoTransportPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Auto Transport", path: "/services/auto-transport" },
        ]}
      />
      <ServiceJsonLd name="Auto Transport" description="Nationwide auto transport for cars, motorcycles, and fleet vehicles." slug="auto-transport" />
      <PageHeroBand
        title="Auto Transport"
        subtitle="Ship your car, motorcycle, or fleet vehicle anywhere in the country — safely, on schedule, and fully insured."
      />

      <ServiceIntro
        eyebrow="Nationwide Auto Transport"
        heading="Vehicle Shipping You Can Track and Trust"
        highlights={[
          { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door-to-Door", sub: "Service" },
          { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "Carriers" },
          { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
        ]}
      >
        <p>
          TYS Global Logistics is a full-service vehicle shipping partner, handling everything
          from carrier coordination to final delivery. Choose open carriers for cost-effective
          routes, or enclosed trailers when your vehicle needs extra protection from weather and
          road debris.
        </p>
        <p>
          Moving your household too? We can align your vehicle move with your relocation so
          everything follows one coordinated schedule.
        </p>
      </ServiceIntro>

      <ServiceSteps
        title="How Auto Transport Works"
        steps={[
          {
            title: "Get a Quote",
            body: "Tell us your pickup and delivery details for an accurate, upfront price.",
          },
          {
            title: "Choose Your Carrier",
            body: "Open carriers for cost-effective routes, or enclosed trailers for extra protection.",
          },
          {
            title: "Vehicle Inspection & Pickup",
            body: "We inspect and document your vehicle's condition before it leaves your driveway.",
          },
          {
            title: "Transport",
            body: "Your vehicle travels with a vetted, insured carrier to its destination.",
          },
          {
            title: "Delivery & Final Inspection",
            body: "We compare the vehicle's condition against pickup notes before handing over the keys.",
          },
        ]}
      />

      <ServiceCardGrid
        title="Vehicles We Transport"
        columns={4}
        cards={[
          {
            icon: <CarSimpleIcon size={22} />,
            title: "Sedans, SUVs & Trucks",
            body: "The most common vehicles we move — they fit easily on open carriers and most enclosed trailers.",
          },
          {
            icon: <SteeringWheelIcon size={22} />,
            title: "Luxury & Exotic Cars",
            body: "Extra strapping points, careful loading, and enclosed trailers protect high-value vehicles.",
          },
          {
            icon: <MotorcycleIcon size={22} />,
            title: "Motorcycles & Scooters",
            body: "Shipped in crates or on specialized racks, with proper strapping to prevent damage.",
          },
          {
            icon: <VanIcon size={22} />,
            title: "Vans & Oversized Vehicles",
            body: "We assess height, length, and weight before confirming a booking for larger vehicles.",
          },
        ]}
      />

      <ServiceChecklist
        title="Good to Know Before You Book"
        items={[
          "Have your vehicle's registration and title on hand",
          "Remove personal belongings from the vehicle before pickup",
          "Note your current mileage and fuel level",
          "A clean vehicle makes for a more accurate pickup inspection",
          "Non-running vehicles need to be arranged in advance",
          "Heavily modified or oversized vehicles may need special equipment",
        ]}
      />

      <ServiceFaq
        title="Frequently Asked Questions"
        faqs={[
          {
            q: "How long does auto transport take?",
            a: "It depends on distance and route. Most moves take about 5 to 10 days, and cross-country shipments can take 7 to 14 days.",
          },
          {
            q: "What's the difference between open and enclosed transport?",
            a: "Open carriers are the most budget-friendly option and suit most vehicles. Enclosed trailers cost more but add extra protection from weather and road debris — a common choice for high-value vehicles.",
          },
          {
            q: "Can you ship a car that doesn't run?",
            a: "Yes, but non-running vehicles need to be arranged in advance since they require special loading equipment.",
          },
          {
            q: "Do I need to empty my car before shipping it?",
            a: "Yes — remove personal belongings and any items not part of the shipment before pickup.",
          },
          {
            q: "What documents do I need to ship my vehicle?",
            a: "You'll need the vehicle's title or registration, along with any other ownership paperwork your carrier requires.",
          },
          {
            q: "Can I ship a motorcycle or an oversized vehicle?",
            a: "Yes. Motorcycles ship in crates or on specialized racks, and larger vans or oversized vehicles are assessed for height, length, and weight before booking.",
          },
        ]}
      />

      <ServiceCtaBanner />

      <TrustedReviewsSection />
    </>
  );
}
