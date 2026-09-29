import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CurrencyDollarIcon, HouseLineIcon, ProhibitIcon, ReceiptIcon } from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ContinentCard, BrandName } from "@/components/public/continent-card";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { FlagIcon } from "@/components/public/flag-icon";
import type { DestinationCountry } from "@/components/public/destination-pill-grid";
import { CardGrid, CtaBand, PAD, PageBody, Rail, Section, SectionHead, StatRow } from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "International Shipping Destinations | TYS Global Logistics",
  description:
    "International shipping from the US to 200+ countries. Pick your destination to start a free quote, or read our shipping guides for Canada, India and the UK.",
  path: "/destinations",
});

const ASIA: DestinationCountry[] = [
  { code: "CN", label: "China" },
  { code: "IN", label: "India" },
  { code: "ID", label: "Indonesia" },
  { code: "JP", label: "Japan" },
  { code: "NP", label: "Nepal" },
  { code: "PK", label: "Pakistan" },
  { code: "AE", label: "UAE" },
  { code: "MY", label: "Malaysia" },
  { code: "PH", label: "Philippines" },
  { code: "SG", label: "Singapore" },
  { code: "TW", label: "Taiwan" },
  { code: "TH", label: "Thailand" },
  { code: "KW", label: "Kuwait" },
  { code: "IL", label: "Israel" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "LB", label: "Lebanon" },
];

const AFRICA: DestinationCountry[] = [
  { code: "KE", label: "Kenya" },
  { code: "NG", label: "Nigeria" },
  { code: "ZA", label: "South Africa" },
  { code: "GH", label: "Ghana" },
];

const EUROPE: DestinationCountry[] = [
  { code: "FR", label: "France" },
  { code: "DE", label: "Germany" },
  { code: "IT", label: "Italy" },
  { code: "ES", label: "Spain" },
  { code: "GB", label: "UK" },
  { code: "RU", label: "Russia" },
  { code: "GR", label: "Greece" },
  { code: "FI", label: "Finland" },
  { code: "DK", label: "Denmark" },
  { code: "BE", label: "Belgium" },
  { code: "NO", label: "Norway" },
  { code: "NL", label: "Netherlands" },
  { code: "IE", label: "Ireland" },
  { code: "PL", label: "Poland" },
  { code: "PT", label: "Portugal" },
  { code: "TR", label: "Turkey" },
  { code: "CH", label: "Switzerland" },
  { code: "SE", label: "Sweden" },
  { code: "RO", label: "Romania" },
];

// Was headed "North America" but also lists the Caribbean and South
// America, so it is "The Americas" now.
const AMERICAS: DestinationCountry[] = [
  { code: "CA", label: "Canada" },
  { code: "MX", label: "Mexico" },
  { code: "DO", label: "Dominican Republic" },
  { code: "HT", label: "Haiti" },
  { code: "JM", label: "Jamaica" },
  { code: "PR", label: "Puerto Rico" },
  { code: "TT", label: "Trinidad & Tobago" },
  { code: "CO", label: "Colombia" },
  { code: "CL", label: "Chile" },
  { code: "BR", label: "Brazil" },
];

const AUSTRALIA_OCEANIA: DestinationCountry[] = [
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
];

const flag = (code: string) => <FlagIcon code={code} className="h-4 w-6" />;

export default function DestinationsPage() {
  return (
    <>
      <PageHeroBand
        title="International shipping to"
        accent="200+ countries"
        subtitle="Pick a country below to start a quote with the destination already filled in. We collect from any US address and track your shipment until it is delivered."
      />

      <PageBody>
        <section>
          <Rail>
            <div className={`py-16 lg:py-20 ${PAD}`}>
              <SectionHead
                kicker="Where we ship"
                title="One team for every"
                accent="international route."
                lead={
                  <>
                    International shipping from the US works the same way wherever it is going. We
                    collect from your door, book it with the carrier that suits the route, help with
                    the customs paperwork and keep you updated until it arrives. What changes from
                    country to country is the customs rules, and that is where we help most.
                  </>
                }
              />
            </div>
            <StatRow
              stats={[
                { n: "200", s: "+", label: "Countries we ship to" },
                { n: "900", s: "+", label: "Carrier networks" },
                { n: "100", s: "%", label: "Shipment visibility" },
                { n: "24/7", label: "Support" },
              ]}
            />
          </Rail>
        </section>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead
                kicker="Country guides"
                title="Our most requested routes"
                lead="Customs rules, service options and what people usually send, written up for three of the countries we ship to most."
              />
            </div>
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: flag("CA"),
                  title: "Shipping to Canada",
                  body: "A short border crossing, but still a full customs clearance. When ground makes sense and when to fly.",
                  href: "/destinations/canada",
                },
                {
                  icon: flag("IN"),
                  title: "Shipping to India",
                  body: "Itemized declarations, gifts and personal effects, and how to avoid holds at Indian customs.",
                  href: "/destinations/india",
                },
                {
                  icon: flag("GB"),
                  title: "Shipping to the UK",
                  body: "Import VAT, what people usually send, and simple ways to keep the cost down.",
                  href: "/destinations/uk",
                },
                {
                  icon: flag("PK"),
                  title: "Shipping to Pakistan",
                  body: "Eid and wedding gifts, clothes, phones and documents, with an itemized customs list.",
                  href: "/destinations/pakistan",
                },
                {
                  icon: flag("AE"),
                  title: "Shipping to the UAE",
                  body: "Dubai, Abu Dhabi and beyond: work moves, electronics, and why medicines need care.",
                  href: "/destinations/uae",
                },
                {
                  icon: flag("AU"),
                  title: "Shipping to Australia",
                  body: "Strict biosecurity rules, GST on imports, and how to pack so nothing gets held.",
                  href: "/destinations/australia",
                },
              ]}
            />
          </Rail>
        </section>

        <ContinentCard name="Asia" countries={ASIA}>
          From family parcels to business stock, <BrandName /> ships across Asia. We book each
          shipment with the carrier that fits the route and your budget, and you can follow it from
          pickup to delivery.
        </ContinentCard>

        <ContinentCard name="Africa" countries={AFRICA}>
          Parcels, bulk boxes and heavier commercial cargo to Africa, collected from your door in the
          US. We help you choose between faster air and lower cost options, and check the paperwork
          before anything leaves.
        </ContinentCard>

        <ContinentCard name="Europe" countries={EUROPE}>
          Personal and commercial shipments to the UK and mainland Europe, with express and economy
          options on most routes. <BrandName /> handles pickup, customs documents and tracking in
          one place.
        </ContinentCard>

        <ContinentCard name="The Americas" countries={AMERICAS}>
          Canada and Mexico next door, the Caribbean and South America further out. Some of these
          routes can go by ground and others need to fly. Tell us what you are sending and we will
          suggest the sensible option.
        </ContinentCard>

        <ContinentCard name="Australia and Oceania" countries={AUSTRALIA_OCEANIA}>
          Australia and New Zealand are the busiest destinations in the region, and both have strict
          biosecurity rules, so describe everything clearly on the declaration. Sending to a Pacific
          island? Ask for a quote and we will check what is possible.
        </ContinentCard>

        <Section>
          <SectionHead
            kicker="Not listed?"
            title="Don't see your country?"
            accent="Ask us anyway."
            lead="The countries above are the ones people ask for most, not the full list. We ship to more than 200 countries, so start a quote with your destination and we will come back with the options."
            action={
              <div className="flex flex-wrap gap-3">
                <Link href="/quotes" className="btn btn-primary btn-lg">
                  Start a quote <ArrowRightIcon size={15} />
                </Link>
                <Link href="/destinations/moving" className="btn btn-secondary btn-lg">
                  <HouseLineIcon size={15} /> Moving abroad?
                </Link>
              </div>
            }
          />
        </Section>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead title="Worth reading" accent="before you ship" />
            </div>
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: <ReceiptIcon size={22} />,
                  title: "Customs duty guide",
                  body: "Who pays duty and import tax, and what decides the amount.",
                  href: "/resources/customs-duty",
                },
                {
                  icon: <ProhibitIcon size={22} />,
                  title: "Prohibited items",
                  body: "What can't be shipped, and what needs extra care or paperwork.",
                  href: "/resources/prohibited-items",
                },
                {
                  icon: <CurrencyDollarIcon size={22} />,
                  title: "How shipping rates work",
                  body: "Chargeable weight, speed and destination, and how to pay less.",
                  href: "/shipping-rates",
                },
              ]}
            />
          </Rail>
        </section>

        <TrustedReviewsSection />
        <CtaBand />
      </PageBody>
    </>
  );
}
