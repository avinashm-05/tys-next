import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { QuoteWizardForm } from "@/components/public/quote-wizard-form";
import { normalizeCode } from "@/lib/countries";
import { PACKAGE_TYPES } from "@/lib/validation/quote-wizard";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Get a Free Shipping Quote | TYS Global Logistics",
  description:
    "Get a free domestic or international shipping quote in under a minute. Tell us where it is going and what you are sending, and a real person follows up.",
  path: "/quotes",
});

// B2 redesign — the quote wizard's own route (previously inline-only on the
// home page). from_country/to_country are read from the query string so the
// home page's mini quote forms can hand off a prefilled Step 1 (mirrors what
// the old Laravel QuoteController@index did with the same params).
//
// The dark hero band lives inside QuoteWizardForm itself, not here — the
// title/subtitle need to switch to the customer's own route once results are
// showing, and only the client component knows that state.
export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ from_country?: string; to_country?: string; package_type?: string }>;
}) {
  const { from_country, to_country, package_type } = await searchParams;
  // Only a type the wizard actually offers; anything else is ignored.
  const pkg = PACKAGE_TYPES.some((t) => t.value === package_type) ? package_type : undefined;

  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Get a Free Quote", path: "/quotes" },
        ]}
      />
      <QuoteWizardForm
      defaultFromCountry={normalizeCode(from_country) || undefined}
      defaultToCountry={normalizeCode(to_country) || undefined}
      defaultPackageType={pkg}
    />
    </>
  );
}
