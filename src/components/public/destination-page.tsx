import Link from "next/link";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

// Shared layout for the per-country destination pages added 2026-08-21.
// These exist because the keyword research found high monthly volume for
// "ship to <country>" queries with no page on the site to answer them.
//
// Deliberately NO transit times, prices or duty thresholds are baked in here:
// those change with carrier, season and that country's own customs policy,
// and a stale number on a public page is worse than no number. Anything
// specific is answered by a real quote instead.
export type DestinationSection = { heading: string; body: React.ReactNode };

export function DestinationPage({
  country,
  intro,
  sections,
}: {
  country: string;
  intro: React.ReactNode;
  sections: DestinationSection[];
}) {
  return (
    <>
      <PageHeroBand
        title={`Shipping to ${country}`}
        subtitle={`Send parcels, documents and personal effects from the US to ${country}`}
      />
      <ServiceCtaBanner />

      <section className="px-4 pb-14 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-ink-muted">{intro}</div>
      </section>

      {sections.map((s, i) => (
        <section
          key={s.heading}
          className={`px-4 py-14 md:px-8 ${i % 2 === 0 ? "bg-gray-50" : ""}`}
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-ink md:text-3xl">{s.heading}</h2>
            <div className="mt-4 space-y-4 text-ink-muted">{s.body}</div>
          </div>
        </section>
      ))}

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">
            What it costs to ship to {country}
          </h2>
          <p className="mt-4 text-ink-muted">
            Price depends on chargeable weight, the exact destination and how fast you need it
            there. Rather than publish a table that goes out of date, we quote your actual
            shipment against current carrier pricing — it takes about a minute.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/quotes"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Get a free quote →
            </Link>
            <Link
              href="/shipping-rates"
              className="rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand hover:bg-brand-pale"
            >
              How our pricing works
            </Link>
          </div>
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}
