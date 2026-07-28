import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { GoogleAdsConversion } from "@/components/public/google-ads-conversion";
import { GtmConversionEvent } from "@/components/public/analytics-scripts";

export const metadata: Metadata = {
  title: "Thank You - TYS Global Logistics",
  robots: { index: false, follow: false },
};

// B1/B2 redesign — Tailwind rebuild (was a faithful Bootstrap port). `name`
// comes from the wizard redirect (?name=); React escapes it, so the
// interpolation is XSS-safe. `quote_id` (also from the redirect) fires the
// Google Ads lead conversion below and doubles as its dedupe key — digits
// only, since it flows into an inline script.
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; quote_id?: string }>;
}) {
  const { name, quote_id } = await searchParams;
  const customer = name?.trim() || "Customer";
  const transactionId = quote_id && /^\d+$/.test(quote_id) ? quote_id : undefined;

  return (
    <section className="bg-brand-light px-4 py-20 md:px-8">
      <GoogleAdsConversion transactionId={transactionId} />
      <GtmConversionEvent transactionId={transactionId} />
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-[0_20px_60px_rgba(16,24,40,0.08)] md:p-14">
        <CheckCircleIcon size={72} weight="fill" className="mx-auto text-emerald-500" />
        <h1 className="mt-6 text-2xl font-extrabold text-ink md:text-3xl">Dear {customer},</h1>
        <p className="mt-4 text-ink-muted">
          Thank you for requesting a shipping quote. We have received your request and our team
          will review your details and get back to you within 24 hours with a custom quote.
        </p>
        <p className="mt-3 text-ink-muted">
          If you have any urgent questions, please feel free to reach out to our customer support.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand hover:bg-brand-pale"
          >
            Back to Home
          </Link>
          <Link
            href="/quotes"
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Get New Quote
          </Link>
        </div>
      </div>
    </section>
  );
}
