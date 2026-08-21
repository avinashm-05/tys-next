import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = pageMetadata({
  title: "Major Carriers — TYS Global Logistics",
  description: "We book with the major global carriers at rates below their retail counter price. Same networks, same tracking, lower cost.",
  path: "/carriers",
});

// Wordmark badges use each carrier's real brand colors rather than their
// actual logo artwork — we don't have rights to redistribute the trademarked
// logo files, and this reads as "their brand" without sourcing external
// assets from the web.
const CARRIERS = [
  {
    name: "FedEx",
    body: "Fast, reliable express and ground delivery, domestic and worldwide.",
    bg: "#4D148C",
    fg: "#FF6600",
  },
  {
    name: "DHL",
    body: "A trusted name in international express shipping and customs handling.",
    bg: "#FFCC00",
    fg: "#D40511",
  },
  {
    name: "UPS",
    body: "Dependable ground and air delivery across the U.S. and abroad.",
    bg: "#351C15",
    fg: "#FFB500",
  },
  {
    name: "USPS",
    body: "Cost-effective delivery with wide domestic and international reach.",
    bg: "#004B87",
    fg: "#DA291C",
  },
];

export default function CarriersPage() {
  return (
    <>
      <PageHeroBand
        title="Major Carriers"
        subtitle="We work with the carriers you already trust, and find the right one for every shipment."
      />
      <ServiceCtaBanner />

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl text-center text-ink-muted">
          <p>
            TYS Global Logistics isn&rsquo;t locked into a single carrier. We compare
            options across major shipping partners so you get the right balance of speed,
            cost, and reliability for your specific shipment.
          </p>
        </div>

        <div className="mx-auto mt-10 grid grid-cols-1 max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARRIERS.map((c) => (
            <div
              key={c.name}
              className="rounded-3xl border border-brand-light bg-white p-6 shadow-[0_2px_16px_rgba(16,24,40,0.04)]"
            >
              <div
                className="flex h-16 items-center justify-center rounded-2xl text-xl font-black italic tracking-tight"
                style={{ backgroundColor: c.bg, color: c.fg }}
              >
                {c.name}
              </div>
              <p className="mt-4 text-sm text-ink-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>


      <TrustedReviewsSection />
    </>
  );
}
