import type { Metadata } from "next";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCardGrid, ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  GlobeIcon,
  TruckIcon,
  CarSimpleIcon,
  PackageIcon,
  MapPinLineIcon,
  HeadsetIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "About Us — TYS Global Logistics",
  description: "Your trusted partner for shipping, moving, and freight — anywhere in the world.",
};

export default function AboutUsPage() {
  return (
    <>
      <PageHeroBand
        title="About Us"
        subtitle="Your trusted partner for shipping, moving, and freight — anywhere in the world."
      />

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[1.6px] text-brand">Who We Are</p>
          <h1 className="mt-2 text-3xl font-bold text-ink md:text-4xl">Your Ideal Shipping and Moving Partner</h1>
          <div className="mt-4 space-y-4 text-ink-muted">
            <p>
              TYS Global Logistics connects people and businesses to destinations across the globe.
              Whether it&rsquo;s a single envelope, a household relocation, a vehicle, or commercial
              cargo, our team plans and manages every shipment from pickup to final delivery.
            </p>
            <p>
              We work with a trusted network of carriers and partners across air, ocean, and ground
              transportation, backed by real-time tracking and a dedicated advisor for every
              shipment — so you always know where things stand.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-gray-50">
        <ServiceCardGrid
          title="What We Do"
          columns={4}
          cards={[
            {
              icon: <GlobeIcon size={22} />,
              title: "Worldwide Shipping",
              body: "Parcels, documents, and freight shipped to nearly 200 destinations worldwide.",
            },
            {
              icon: <TruckIcon size={22} />,
              title: "Relocation & Moving",
              body: "Domestic and international household relocations, planned door-to-door.",
            },
            {
              icon: <CarSimpleIcon size={22} />,
              title: "Auto Transport",
              body: "Safe, insured vehicle shipping anywhere in the country.",
            },
            {
              icon: <PackageIcon size={22} />,
              title: "Freight Forwarding",
              body: "Origin and destination services for commercial and household cargo.",
            },
          ]}
        />
      </div>

      <ServiceCardGrid
        title="Why Choose TYS"
        columns={4}
        cards={[
          {
            icon: <MapPinLineIcon size={22} />,
            title: "Real-Time Tracking",
            body: "Follow your shipment from pickup to final delivery.",
          },
          {
            icon: <HeadsetIcon size={22} />,
            title: "Dedicated Support",
            body: "A real advisor to guide you through every step of your shipment.",
          },
          {
            icon: <ShieldCheckIcon size={22} />,
            title: "Trusted Carriers",
            body: "A vetted network of carriers across air, ocean, and ground.",
          },
          {
            icon: <TruckIcon size={22} />,
            title: "Door-to-Door Service",
            body: "Pickup and delivery handled on most shipments, start to finish.",
          },
        ]}
      />

      <ServiceCtaBanner />

      <TrustedReviewsSection />
    </>
  );
}
