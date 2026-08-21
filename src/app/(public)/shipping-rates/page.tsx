import type { Metadata } from "next";
import Link from "next/link";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shipping Rates — TYS Global Logistics",
  description:
    "See what it costs to ship from the US worldwide. Compare TYS rates against retail counter prices, then get a free quote for your exact shipment.",
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
  { route: "US → United Kingdom", detail: "10 lb parcel, door to door", tys: 0, retail: 0 },
  { route: "US → India", detail: "10 lb parcel, door to door", tys: 0, retail: 0 },
  { route: "US → Canada", detail: "10 lb parcel, door to door", tys: 0, retail: 0 },
  { route: "US → Australia", detail: "10 lb parcel, door to door", tys: 0, retail: 0 },
];

const PRICING_IS_PLACEHOLDER = LANES.every((l) => l.tys === 0 && l.retail === 0);

function savePercent(l: Lane): number | null {
  if (!l.retail || !l.tys || l.retail <= l.tys) return null;
  return Math.round(((l.retail - l.tys) / l.retail) * 100);
}

export default function ShippingRatesPage() {
  return (
    <>
      <PageHeroBand
        title="Shipping Rates"
        subtitle="What it actually costs to ship from the US, and what you'd pay at the counter"
      />
      <ServiceCtaBanner />

      <section className="px-4 pb-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">How our pricing works</h2>
          <div className="mt-4 space-y-4 text-ink-muted">
            <p>
              We book through the same global carrier networks you already know — the same
              aircraft, the same tracking, the same delivery drivers. The difference is volume:
              because we consolidate shipments across many customers, we buy at contract rates
              rather than the walk-in counter price, and we pass that difference on.
            </p>
            <p>
              Every shipment is priced on its <strong>chargeable weight</strong>, which is
              whichever is greater: the actual weight, or the volumetric weight calculated from
              its dimensions. A large, light box is billed on the space it occupies, not what it
              weighs on the scale. Our{" "}
              <Link href="/resources/volumetric-weight" className="text-brand hover:underline">
                volumetric weight guide
              </Link>{" "}
              explains that in full.
            </p>
            <p>
              International shipments may also attract duty and tax charged by the destination
              country. Those are set by that country&rsquo;s customs authority, not by us — see{" "}
              <Link href="/resources/customs-duty" className="text-brand hover:underline">
                customs duty explained
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">Example rates</h2>
          <p className="mt-3 text-ink-muted">
            Indicative pricing for common routes. Your actual rate depends on weight, dimensions
            and destination — the quote form gives you a real figure in minutes.
          </p>

          {PRICING_IS_PLACEHOLDER ? (
            // Renders instead of a fake table when the placeholders above
            // haven't been filled in yet, so this page can never publish
            // invented savings claims by accident.
            <div className="mt-6 rounded-2xl border border-brand-light bg-white p-6 text-ink-muted">
              <p className="font-semibold text-ink">Live rates, not estimates</p>
              <p className="mt-2">
                Rates move with fuel, carrier surcharges and season, so rather than publish a
                table that goes stale we quote your exact shipment against current carrier
                pricing. It takes about a minute and there&rsquo;s no obligation.
              </p>
              <Link
                href="/quotes"
                className="mt-4 inline-flex rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Get your rate →
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse overflow-hidden rounded-2xl bg-white text-left">
                <thead>
                  <tr className="border-b border-brand-light text-sm text-ink-muted">
                    <th className="px-5 py-4 font-semibold">Route</th>
                    <th className="px-5 py-4 font-semibold">Counter price</th>
                    <th className="px-5 py-4 font-semibold">TYS price</th>
                    <th className="px-5 py-4 font-semibold">You save</th>
                  </tr>
                </thead>
                <tbody>
                  {LANES.map((l) => {
                    const pct = savePercent(l);
                    return (
                      <tr key={l.route} className="border-b border-brand-light/60 last:border-0">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-ink">{l.route}</div>
                          <div className="text-sm text-ink-muted">{l.detail}</div>
                        </td>
                        <td className="px-5 py-4 tabular-nums text-ink-muted line-through">
                          ${l.retail.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 tabular-nums font-bold text-ink">
                          ${l.tys.toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          {pct != null && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              {pct}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-ink-muted">
                Counter prices are the carrier&rsquo;s own published retail rate for the same
                service level, checked periodically. Indicative only — not a quote.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">What affects your price</h2>
          <ul className="mt-4 space-y-3 text-ink-muted">
            <li>
              <strong className="text-ink">Chargeable weight.</strong> The greater of actual and
              volumetric weight. Repacking into a smaller box often lowers the price.
            </li>
            <li>
              <strong className="text-ink">Destination.</strong> Major metros cost less to reach
              than remote areas, which carry a carrier surcharge.
            </li>
            <li>
              <strong className="text-ink">Speed.</strong> Express moves in days and economy in
              weeks, at a substantial price difference.
            </li>
            <li>
              <strong className="text-ink">Residential vs commercial.</strong> Home delivery
              carries a surcharge with every major carrier.
            </li>
            <li>
              <strong className="text-ink">Duty and tax.</strong> Set by the destination country,
              and separate from the shipping rate itself.
            </li>
          </ul>
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}
