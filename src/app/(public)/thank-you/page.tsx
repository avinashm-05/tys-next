import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircleIcon, ClipboardTextIcon } from "@phosphor-icons/react/dist/ssr";
import { GoogleAdsConversion } from "@/components/public/google-ads-conversion";
import { GtmConversionEvent } from "@/components/public/analytics-scripts";
import { TIME_SLOTS } from "@/lib/validation/quote-store";

export const metadata: Metadata = {
  title: "Thank You - TYS Global Logistics",
  robots: { index: false, follow: false },
};

// What to have on hand for the callback, per package type — the single-page
// /quotes form deliberately doesn't collect zip codes or package dimensions
// up front (see quote-request-form.tsx), so the agent needs to ask for all
// of this on the call. Listing it here up front means the customer isn't
// caught flat-footed when the phone rings. Envelope/document has no entry —
// there's nothing beyond the route to prepare for a document shipment.
const PACKAGE_PREP: Record<string, string> = {
  boxes: "The weight and dimensions (length × width × height) of each box",
  box: "The weight and dimensions (length × width × height) of each box",
  television: "The TV's brand, model, and screen size (or box dimensions if still boxed)",
  furniture: "The weight and dimensions of each piece",
  auto: "The vehicle's make, model, and year",
  packers_movers:
    "A rough idea of your home size and what's being moved (e.g. number of rooms or a general inventory)",
};

const TIME_SLOT_LABEL: Record<string, string> = Object.fromEntries(
  TIME_SLOTS.map((s) => [s.value, `${s.label} (${s.hint})`]),
);

// B1/B2 redesign — Tailwind rebuild (was a faithful Bootstrap port). `name`
// comes from the wizard redirect (?name=); React escapes it, so the
// interpolation is XSS-safe. `quote_id` (also from the redirect) fires the
// Google Ads lead conversion below and doubles as its dedupe key — digits
// only, since it flows into an inline script. `type=callback` (from the old
// /quick-quote redirect, no longer produced but still honored) swaps the
// body copy — there's no quote to review, just a callback to make.
// `time_slot`/`package_type` (from the single-page /quotes form) drive the
// "what to have ready for the call" section below.
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    quote_id?: string;
    type?: string;
    time_slot?: string;
    package_type?: string;
  }>;
}) {
  const { name, quote_id, type, time_slot, package_type } = await searchParams;
  const customer = name?.trim() || "Customer";
  const transactionId = quote_id && /^\d+$/.test(quote_id) ? quote_id : undefined;
  const isCallback = type === "callback";

  const timeSlotLabel = time_slot ? TIME_SLOT_LABEL[time_slot] : undefined;
  const selectedTypes = (package_type ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const prepItems = [
    ...new Set(selectedTypes.map((t) => PACKAGE_PREP[t]).filter((v): v is string => !!v)),
  ];

  return (
    <section className="bg-brand-light px-4 py-20 md:px-8">
      <GoogleAdsConversion transactionId={transactionId} />
      <GtmConversionEvent transactionId={transactionId} />
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-[0_20px_60px_rgba(16,24,40,0.08)] md:p-14">
        <CheckCircleIcon size={72} weight="fill" className="mx-auto text-emerald-500" />
        <h1 className="mt-6 text-2xl font-extrabold text-ink md:text-3xl">
          Dear {customer},
        </h1>
        {isCallback ? (
          <p className="mt-4 text-ink-muted">
            Thanks for reaching out. We&rsquo;ve received your callback request and one of
            our shipping experts will call you back during the window you picked.
          </p>
        ) : timeSlotLabel ? (
          <p className="mt-4 text-ink-muted">
            Thank you for requesting a shipping quote. One of our shipping experts will
            call you back during your selected window —{" "}
            <span className="font-semibold text-ink">{timeSlotLabel}</span> — to go over
            your rates and options.
          </p>
        ) : (
          <p className="mt-4 text-ink-muted">
            Thank you for requesting a shipping quote. We have received your request and
            our team will review your details and get back to you within 24 hours with a
            custom quote.
          </p>
        )}

        {!isCallback && (
          <div className="mt-6 rounded-2xl border border-brand-light bg-brand-pale/40 p-5 text-left">
            <div className="flex items-center gap-2 text-brand">
              <ClipboardTextIcon size={18} weight="bold" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Have this ready for the call
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
              <li>
                • The zip/postal codes for both your sending and receiving addresses
              </li>
              {prepItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4 text-ink-muted">
          If you have any urgent questions, please feel free to reach out to our customer
          support.
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
