import type { Metadata } from "next";
import { QuoteRequestForm } from "@/components/public/quote-request-form";
import { normalizeCode } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Get a Free Quote — TYS Global Logistics",
  description: "Get a free domestic or international shipping quote in under a minute.",
};

// Single-page quote request (replaces the old 4-step wizard, folded together
// with what used to be the separate /quick-quote callback form — see
// QuoteRequestForm's header comment). from_country/to_country are read from
// the query string so the home page's mini quote form can hand off a
// prefilled route (mirrors what the old Laravel QuoteController@index did
// with the same params).
export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ from_country?: string; to_country?: string }>;
}) {
  const { from_country, to_country } = await searchParams;

  return (
    <QuoteRequestForm
      defaultFromCountry={normalizeCode(from_country) || undefined}
      defaultToCountry={normalizeCode(to_country) || undefined}
    />
  );
}
