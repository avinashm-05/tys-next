import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, GlobeHemisphereWestIcon, PhoneIcon, ProhibitIcon, ReceiptIcon, ScalesIcon } from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceFaq } from "@/components/public/service-page-sections";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import type { Faq } from "@/lib/default-faqs";
import {
  CardGrid,
  Checklist,
  CtaBand,
  PAD,
  PageBody,
  Prose,
  Rail,
  Section,
  SectionHead,
  StatRow,
  Steps,
} from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "International Shipping Rates | TYS Global Logistics",
  description:
    "How international shipping rates from the US are worked out: chargeable weight, destination and speed. Compare against counter prices with a free quote.",
  path: "/shipping-rates",
});

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  PLACEHOLDER PRICING — REPLACE BEFORE THIS PAGE GOES LIVE  ⚠️
//
// Roughly 30% of the campaign's keywords are price-comparison searches that
// map to this page, which is why it exists (site audit, 2026-08-21 — the URL
// was returning 404 while ads were about to point at it).
//
// The numbers below are STRUCTURAL PLACEHOLDERS, not real quotes. They are
// deliberately round and obviously synthetic. Publishing invented savings
// claims against a named carrier's retail price is a false-advertising
// exposure, so these must be replaced with figures pulled from real quotes
// (the admin quote workspace's "Get live rates" panel is the natural source)
// before this page is deployed.
//
// Keep `retail` as the carrier's own published counter price for the SAME
// service level, or the comparison isn't honest. `savePercent` is computed,
// never hand-entered, so it can't drift from the two numbers beside it.
// ─────────────────────────────────────────────────────────────────────────────
type Lane = {
  route: string;
  detail: string;
  tys: number;
  retail: number;
};

const LANES: Lane[] = [
  { route: "US to United Kingdom", detail: "10 lb parcel, door to door", tys: 0, retail: 0 },
  { route: "US to India", detail: "10 lb parcel, door to door", tys: 0, retail: 0 },
  { route: "US to Canada", detail: "10 lb parcel, door to door", tys: 0, retail: 0 },
  { route: "US to Australia", detail: "10 lb parcel, door to door", tys: 0, retail: 0 },
];

const PRICING_IS_PLACEHOLDER = LANES.every((l) => l.tys === 0 && l.retail === 0);

function savePercent(l: Lane): number | null {
  if (!l.retail || !l.tys || l.retail <= l.tys) return null;
  return Math.round(((l.retail - l.tys) / l.retail) * 100);
}

const FAQS: Faq[] = [
  {
    q: "How much does it cost to ship internationally from the US?",
    a: "It depends on the chargeable weight, the destination and how fast you need it there. Rates also move with fuel and carrier surcharges, so the quickest way to a real number is a free quote for your exact shipment.",
  },
  {
    q: "Why is my price based on a different weight than my box?",
    a: "You are charged on chargeable weight, which is the greater of the actual weight and the volumetric weight worked out from the box size. A large, light box is priced on the space it takes up.",
  },
  {
    q: "Are customs duties included in the shipping rate?",
    a: "Usually not. Duty and import taxes are set by the destination country and are normally paid by the recipient on arrival, separately from the shipping cost.",
  },
  {
    q: "Is the quote free?",
    a: "Yes. Quotes are free and there is no obligation to book.",
  },
  {
    q: "Does delivering to a home address cost more?",
    a: "Often, yes. Most major carriers add a surcharge for residential delivery, and remote areas can carry an extra charge too. Your quote includes these for your address.",
  },
];

export default function ShippingRatesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Shipping Rates", path: "/shipping-rates" },
        ]}
      />
      <PageHeroBand
        title="International shipping rates"
        accent="from the US"
        subtitle="What it actually costs to ship from the US, why, and how to get your exact price in about a minute."
      />

      <PageBody>
        <section>
          <Rail>
            <div className={`py-16 lg:py-20 ${PAD}`}>
              <SectionHead
                kicker="Pricing"
                title="How our pricing"
                accent="works"
                lead={
                  <>
                    Our international shipping rates come from the carrier networks you already
                    know: FedEx, DHL, UPS and USPS. Same aircraft, same tracking, same drivers at the
                    door. The difference is volume. Because we ship for many customers, we book at
                    business account rates instead of the walk-in counter price, and pass the
                    difference on to you.
                  </>
                }
              />
            </div>
            <StatRow
              stats={[
                { n: "70", s: "%", label: "Shipping savings, up to" },
                { n: "900", s: "+", label: "Carrier networks" },
                { n: "200", s: "+", label: "Countries" },
                { n: "24/7", label: "Support" },
              ]}
            />
          </Rail>
        </section>

        {PRICING_IS_PLACEHOLDER ? (
          // Renders instead of a fake table when the placeholders above
          // haven't been filled in yet, so this page can never publish
          // invented savings claims by accident.
          <Section id="rates">
            <SectionHead
              kicker="Your rate"
              title="Live rates,"
              accent="not a price list"
              lead="Rates move with fuel, carrier surcharges and the season. Rather than publish a table that goes out of date, we price your exact shipment against current carrier rates. It takes about a minute and there's no obligation."
              action={
                <div className="flex flex-wrap gap-3">
                  <a href="tel:+14047938759" className="btn btn-secondary btn-lg">
                    <PhoneIcon size={15} /> Call us
                  </a>
                  <Link href="/quotes" className="btn btn-primary btn-lg">
                    Get your rate <ArrowRightIcon size={15} />
                  </Link>
                </div>
              }
            />
          </Section>
        ) : (
          <Section id="rates">
            <SectionHead
              kicker="Your rate"
              title="Example"
              accent="rates"
              lead="Indicative pricing for common routes. Your rate depends on weight, dimensions and destination, and the quote form gives you a real figure in minutes."
            />
            <div className="-mx-5 mt-10 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[13px] text-ink-muted">
                    <th scope="col" className="py-3 pr-4 font-medium">Route</th>
                    <th scope="col" className="py-3 pr-4 font-medium">Counter price</th>
                    <th scope="col" className="py-3 pr-4 font-medium">TYS price</th>
                    <th scope="col" className="py-3 font-medium">You save</th>
                  </tr>
                </thead>
                <tbody>
                  {LANES.map((l) => {
                    const pct = savePercent(l);
                    return (
                      <tr key={l.route} className="border-b border-[var(--line)] last:border-0">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-ink">{l.route}</div>
                          <div className="text-[13px] text-ink-muted">{l.detail}</div>
                        </td>
                        <td className="py-4 pr-4 tabular-nums text-ink-muted line-through">${l.retail.toFixed(2)}</td>
                        <td className="py-4 pr-4 tabular-nums font-semibold text-ink">${l.tys.toFixed(2)}</td>
                        <td className="py-4">
                          {pct != null && (
                            <span className="rounded-md bg-[#EEF4FF] px-2 py-0.5 text-[13px] font-medium text-brand">
                              {pct}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[13px] text-ink-muted">
              Counter prices are the carrier&rsquo;s own published retail rate for the same service
              level, checked periodically. Indicative only, not a quote.
            </p>
          </Section>
        )}

        <TopicScroller
          topics={[
            {
              id: "chargeable-weight",
              title: "You pay for chargeable weight",
              content: (
                <Prose>
                  <p>
                    Every shipment is priced on its <strong>chargeable weight</strong>: whichever is
                    greater, the actual weight or the volumetric weight worked out from the box
                    size. A large, light box is billed for the space it takes up, not what it weighs
                    on the scale.
                  </p>
                  <p>
                    Our <Link href="/resources/volumetric-weight">volumetric weight guide</Link> has
                    the formula and a calculator, so you can check your box before you book.
                  </p>
                </Prose>
              ),
            },
            {
              id: "what-affects-price",
              title: "What else affects your price",
              content: (
                <Checklist
                  items={[
                    <>
                      <strong className="font-semibold">Destination.</strong> Major cities cost less
                      to reach than remote areas, which often carry a carrier surcharge.
                    </>,
                    <>
                      <strong className="font-semibold">Speed.</strong> Express is the fastest
                      option. Economy takes longer and costs noticeably less.
                    </>,
                    <>
                      <strong className="font-semibold">Home or business address.</strong> Most
                      carriers add a surcharge for residential delivery.
                    </>,
                    <>
                      <strong className="font-semibold">Packing.</strong> Repacking into a smaller
                      box often lowers the price more than the new box costs.
                    </>,
                  ]}
                />
              ),
            },
            {
              id: "duty-and-tax",
              title: "Duty and tax are separate",
              content: (
                <Prose>
                  <p>
                    International shipments may also attract duty and import tax charged by the
                    destination country. Those are set by that country&rsquo;s customs authority,
                    not by us, and are usually paid by the recipient when the shipment arrives.
                  </p>
                  <p>
                    Our <Link href="/resources/customs-duty">customs duty guide</Link> explains who
                    pays and what decides the amount.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead kicker="Get your rate" title="Your exact price" accent="in four steps" />
            </div>
            <Steps
              steps={[
                { title: "Tell us the route", body: "Where it is collected in the US and where it is going." },
                { title: "Add the box details", body: "Weight and dimensions, so we can work out chargeable weight." },
                { title: "Get your price", body: "We come back with a price built around your shipment." },
                { title: "Book a pickup", body: "Happy with it? We collect from your door and you track it all the way." },
              ]}
            />
          </Rail>
        </section>

        <ServiceFaq title="Shipping rate questions" faqs={FAQS} />

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead title="Related" accent="guides" />
            </div>
            <CardGrid
              columns={4}
              cards={[
                {
                  icon: <ScalesIcon size={22} />,
                  title: "Volumetric weight",
                  body: "The formula, worked examples and a calculator.",
                  href: "/resources/volumetric-weight",
                },
                {
                  icon: <ReceiptIcon size={22} />,
                  title: "Customs duty",
                  body: "Who pays duty and import tax, and why.",
                  href: "/resources/customs-duty",
                },
                {
                  icon: <ProhibitIcon size={22} />,
                  title: "Prohibited items",
                  body: "What can't be shipped, and what needs extra care.",
                  href: "/resources/prohibited-items",
                },
                {
                  icon: <GlobeHemisphereWestIcon size={22} />,
                  title: "Destinations",
                  body: "Country guides and 200+ countries to quote.",
                  href: "/destinations",
                },
              ]}
            />
          </Rail>
        </section>

        <TrustedReviewsSection />
        <CtaBand title="Want your exact rate?" accent="Get a free quote." />
      </PageBody>
    </>
  );
}
