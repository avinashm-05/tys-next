import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { GoogleAdsConversion } from "@/components/public/google-ads-conversion";
import { GtmConversionEvent } from "@/components/public/analytics-scripts";
import { TIME_SLOTS } from "@/lib/validation/quote-store";
import { PageHeroBand } from "@/components/public/page-hero-band";
import {
  Checklist,
  PAD,
  PageBody,
  Section,
  SectionHead,
  SplitSection,
  Steps,
} from "@/components/public/page-kit";

// TYS WhatsApp Business line (digits only, for wa.me links).
const WHATSAPP_NUMBER = "14044354574";

export const metadata: Metadata = {
  title: "Thank You | TYS Global Logistics",
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
  const customer = name?.trim();
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

  const title = customer ? `Thank you, ${customer}.` : "Thank you.";
  const subtitle = isCallback
    ? "We\u2019ve received your callback request. One of our shipping experts will call you back during the window you picked."
    : timeSlotLabel
      ? `Your quote request is in. One of our shipping experts will call you during your selected window, ${timeSlotLabel}, to go over your rates and options.`
      : "Your quote request is in. Our team will review your details and get back to you within 24 hours with a custom quote.";

  const steps = isCallback
    ? [
        {
          title: "Request received",
          body: "Your callback request is with our team now.",
        },
        {
          title: "We call you",
          body: "One of our shipping experts calls during the window you picked.",
        },
        {
          title: "You get a plan",
          body: "Tell us what you are shipping and where, and we talk you through your options.",
        },
      ]
    : [
        {
          title: "We review your details",
          body: "Our team looks over your route and what you are shipping.",
        },
        {
          title: "We get in touch",
          body: timeSlotLabel ? (
            <>
              A shipping expert calls you during your window:{" "}
              <span className="font-medium text-ink">{timeSlotLabel}</span>.
            </>
          ) : (
            "You hear back from us within 24 hours with a custom quote."
          ),
        },
        {
          title: "You decide",
          body: "Take your time. Book when you’re ready, or ask us anything first. There’s no obligation.",
        },
      ];

  // WhatsApp (added 2026-09-29): many customers, especially those sending
  // to family in India, would rather message than wait for a call. The
  // prefilled text carries only the quote reference, never personal details.
  const whatsappText = transactionId
    ? `Hi TYS, I just requested a quote (ref ${transactionId}).`
    : "Hi TYS, I just requested a quote.";
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <>
      <GoogleAdsConversion transactionId={transactionId} />
      <GtmConversionEvent transactionId={transactionId} />

      <PageHeroBand
        quote={false}
        kicker="Request received"
        title={title}
        subtitle={subtitle}
      >
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-lg w-full bg-[#1FAF5A] text-white hover:bg-[#199A4E] sm:w-auto"
          >
            <WhatsappLogoIcon size={18} weight="fill" /> Message us on WhatsApp
          </a>
          <a href="tel:+14047938759" className="btn btn-secondary btn-lg w-full sm:w-auto">
            <PhoneIcon size={15} /> +1 (404) 793-8759
          </a>
        </div>
      </PageHeroBand>

      <PageBody>
        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="What happens" accent="next" />
          </div>
          <Steps steps={steps} />
        </Section>

        {!isCallback && (
          <SplitSection
            title="Have this ready"
            accent="for the call"
            lead="A few details make the call quicker and the quote more accurate."
          >
            {/* Was: "the zip/postal codes for both your sending and
                receiving addresses". Removed 2026-08-22 because the quote
                form collects both zips in its Location step, so asking
                again told the customer their details hadn't reached whoever
                was calling. Replaced with the one thing the form genuinely
                never captures and every international shipment needs:
                what's inside and roughly what it's worth, which is what the
                customs declaration is built from. Weight and dimensions are
                already covered per package type by prepItems. */}
            <Checklist
              items={[
                "A description of the contents and their approximate value (your customs declaration is based on this)",
                ...prepItems,
              ]}
            />
          </SplitSection>
        )}

        <Section>
          <SectionHead
            title="Questions before"
            accent="we call?"
            lead="Call or WhatsApp us and talk to a person, or have a look around while you wait."
            action={
              <div className="flex flex-wrap gap-3">
                <a href="tel:+14047938759" className="btn btn-secondary btn-lg">
                  <PhoneIcon size={15} /> +1 (404) 793-8759
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
                  <WhatsappLogoIcon size={16} weight="fill" className="text-[#1FAF5A]" /> WhatsApp
                </a>
                <Link href="/" className="btn btn-lg text-ink hover:bg-[#F3F5F9]">
                  Back to home
                </Link>
                <Link href="/quotes" className="btn btn-primary btn-lg">
                  Get another quote <ArrowRightIcon size={15} />
                </Link>
              </div>
            }
          />
        </Section>
      </PageBody>
    </>
  );
}
