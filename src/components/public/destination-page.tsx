import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { QuoteLink } from "@/components/public/quote-link";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { CtaBand, PageBody, Prose, Section, SplitSection } from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { CardGrid, Rail, SectionHead, PAD, type KitCard } from "@/components/public/page-kit";
import { EnvelopeSimpleIcon, HouseLineIcon, PackageIcon, ProhibitIcon, ReceiptIcon, SuitcaseRollingIcon } from "@phosphor-icons/react/dist/ssr";

// URL slug for each destination page, keyed by the `country` prop.
const SLUGS: Record<string, string> = {
  Canada: "canada",
  India: "india",
  "the United Kingdom": "uk",
  Pakistan: "pakistan",
  "the UAE": "uae",
  Australia: "australia",
};

// Shared layout for the per-country destination pages added 2026-08-21.
// These exist because the keyword research found high monthly volume for
// "ship to <country>" queries with no page on the site to answer them.
//
// Deliberately NO transit times, prices or duty thresholds are baked in here:
// those change with carrier, season and that country's own customs policy,
// and a stale number on a public page is worse than no number. Anything
// specific is answered by a real quote instead.
//
// 2026-09-29: rebuilt on the page kit: hero with the quote bar, then the
// topics in an Attio-style TopicScroller.
export type DestinationSection = { heading: string; body: React.ReactNode };

export function DestinationPage({
  country,
  intro,
  sections,
  guides,
}: {
  country: string;
  intro: React.ReactNode;
  sections: DestinationSection[];
  /** Deeper guides for this country (e.g. India's cost, documents and
   *  electronics pages), shown as their own row after the topics. */
  guides?: KitCard[];
}) {
  const slug = SLUGS[country] ?? country.toLowerCase().replace(/[^a-z]+/g, "-");
  const name = country.replace(/^the /, "");
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: `Shipping to ${name}`, path: `/destinations/${slug}` },
        ]}
      />
      <PageHeroBand
        title="Shipping to"
        accent={country}
        subtitle={`Parcels, documents and personal belongings from anywhere in the US to ${country}, collected from your door and tracked all the way.`}
      />
      <PageBody>
        <Section>
          <Prose>{intro}</Prose>
        </Section>

        {/* The country's topics as one Attio-style block: sticky topic list
            on the left, the topics scrolling past on the right. */}
        <TopicScroller
          topics={sections.map((s) => ({
            id: s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            title: s.heading,
            content: <Prose>{s.body}</Prose>,
          }))}
        />

        {guides && guides.length > 0 && (
          <section>
            <Rail>
              <div className={`py-14 lg:py-16 ${PAD}`}>
                <SectionHead kicker="Guides" title={`Shipping to ${name},`} accent="in more detail" />
              </div>
              <CardGrid columns={guides.length % 4 === 0 ? 4 : 3} cards={guides} />
            </Rail>
          </section>
        )}

        <SplitSection title={`What it costs to ship to ${country}`}>
          <Prose>
            <p>
              Price depends on chargeable weight, the exact destination and how fast you need it
              there. Rather than publish a table that goes out of date, we quote your actual
              shipment against current carrier pricing. It takes about a minute.
            </p>
          </Prose>
          <div className="mt-8 flex flex-wrap gap-3">
            <QuoteLink className="btn btn-primary btn-lg">
              Get a free quote <ArrowRightIcon size={15} />
            </QuoteLink>
            <Link href="/shipping-rates" className="btn btn-secondary btn-lg">
              How our pricing works <ArrowRightIcon size={15} />
            </Link>
          </div>
        </SplitSection>

        {/* What people shipping there usually need next. */}
        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead title={`Shipping to ${name}:`} accent="where to next" />
            </div>
            <CardGrid
              columns={3}
              cards={[
                { icon: <PackageIcon size={22} />, title: "Parcel shipping", body: "Boxes of any size, collected from your door and tracked the whole way.", href: "/services/parcel-shipping" },
                { icon: <EnvelopeSimpleIcon size={22} />, title: "Document shipping", body: "Passports, contracts and certificates, sent securely by express.", href: "/services/document-shipping" },
                { icon: <SuitcaseRollingIcon size={22} />, title: "Baggage shipping", body: "Send your luggage ahead instead of paying airline excess fees.", href: "/services/baggage-shipping" },
                { icon: <HouseLineIcon size={22} />, title: "International moving", body: "Your whole household packed, shipped and delivered door to door.", href: "/services/international-relocation" },
                { icon: <ReceiptIcon size={22} />, title: "Customs and duties", body: "What customs may charge on arrival, and how to avoid surprises.", href: "/resources/customs-duty" },
                { icon: <ProhibitIcon size={22} />, title: "Prohibited items", body: "What you can't send internationally, and what needs extra paperwork.", href: "/resources/prohibited-items" },
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
