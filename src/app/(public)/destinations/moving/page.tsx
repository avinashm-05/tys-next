import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BrandName } from "@/components/public/continent-card";
import { DestinationPillGrid, type DestinationCountry } from "@/components/public/destination-pill-grid";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = pageMetadata({
  title: "Worldwide Moving — TYS Global Logistics",
  description: "Moving overseas? TYS handles household goods, personal effects and full relocations from the US to 200+ countries.",
  path: "/destinations/moving",
});

const MOVING_DESTINATIONS: DestinationCountry[] = [
  { code: "AU", label: "Australia" },
  { code: "IE", label: "Ireland" },
  { code: "IN", label: "India" },
  { code: "DE", label: "Germany" },
  { code: "SE", label: "Sweden" },
  { code: "CH", label: "Switzerland" },
];

export default function WorldwideMovingPage() {
  return (
    <>
      <PageHeroBand title="Worldwide Moving" />

      <section className="bg-gray-50 px-4 py-12 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">Worldwide Moving Services</h2>

          <div className="mt-6 rounded-3xl border border-brand-light bg-white p-6 shadow-[0_2px_16px_rgba(16,24,40,0.04)] md:p-8">
            <p className="text-ink-muted">
              <BrandName />{" "}provides reliable international moving services designed to make your
              relocation smooth, secure, and stress-free. Whether you&rsquo;re moving your home,
              family, office, or personal belongings, our end-to-end logistics solutions ensure
              every shipment is handled with care from origin to destination.
            </p>
            <p className="mt-4 text-ink-muted">
              From professional packing and secure transportation to customs clearance and
              door-to-door delivery, we manage every step of your international move. Backed by a
              trusted global network and experienced logistics specialists, we deliver tailored
              moving solutions that fit your timeline and budget.
            </p>
            <p className="mt-4 text-ink-muted">
              Explore our destination-specific moving guides to learn about shipping requirements,
              transit times, customs processes, and estimated moving costs for your chosen
              destination.
            </p>

            <DestinationPillGrid countries={MOVING_DESTINATIONS} verb="Moving" />
          </div>
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}
