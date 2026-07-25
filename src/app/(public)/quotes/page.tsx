import type { Metadata } from "next";
import { QuoteWizardForm } from "@/components/public/quote-wizard-form";
import { normalizeCode } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Get a Free Quote — TYS Global Logistics",
  description: "Get a free domestic or international shipping quote in under a minute.",
};

// B2 redesign — the quote wizard's own route (previously inline-only on the
// home page). from_country/to_country are read from the query string so the
// home page's mini quote forms can hand off a prefilled Step 1 (mirrors what
// the old Laravel QuoteController@index did with the same params).
export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ from_country?: string; to_country?: string }>;
}) {
  const { from_country, to_country } = await searchParams;

  return (
    <>
      {/* Colored band stops after the title/subtitle, with a circular curve
          cut into its bottom edge (an SVG arc, not a hard edge) — everything
          from the step wizard down lives on plain white. */}
      <section className="relative overflow-hidden bg-brand-light px-4 pb-20 pt-6 md:px-8 md:pb-28 md:pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold text-ink md:text-4xl">Get a Free Quote</h1>
          <p className="mt-2 text-ink-muted">
            Tell us about your shipment and we&rsquo;ll get you a rate in minutes.
          </p>
        </div>
        <svg
          aria-hidden
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-16 w-full text-white md:h-24"
        >
          <path d="M0,70 Q720,-30 1440,70 L1440,100 L0,100 Z" fill="currentColor" />
        </svg>
      </section>

      <section className="bg-white px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <QuoteWizardForm
            defaultFromCountry={normalizeCode(from_country) || undefined}
            defaultToCountry={normalizeCode(to_country) || undefined}
          />
        </div>
      </section>
    </>
  );
}
