import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, BuildingsIcon, CalculatorIcon, CubeIcon, HouseLineIcon, ProhibitIcon, ReceiptIcon, SuitcaseIcon } from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BrandName, ContinentCard } from "@/components/public/continent-card";
import type { DestinationCountry } from "@/components/public/destination-pill-grid";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  CardGrid,
  Checklist,
  CtaBand,
  PAD,
  PageBody,
  Prose,
  Rail,
  SectionHead,
  SplitSection,
  Steps,
} from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Worldwide Moving Services from the US | TYS Global Logistics",
  description:
    "Worldwide moving from the US: household goods, personal effects and full relocations to 200+ countries, packed, shipped and cleared through customs for you.",
  path: "/destinations/moving",
});

const MOVING_DESTINATIONS: DestinationCountry[] = [
  { code: "AU", label: "Australia" },
  { code: "IE", label: "Ireland" },
  { code: "IN", label: "India" },
  { code: "DE", label: "Germany" },
  { code: "SE", label: "Sweden" },
  { code: "CH", label: "Switzerland" },
];

export default function WorldwideMovingPage() {
  return (
    <>
      <PageHeroBand
        title="Worldwide moving,"
        accent="door to door"
        subtitle="Moving abroad from the US? We pack, ship and clear your belongings through customs, so you can focus on the move itself."
      />

      <PageBody>
        <ContinentCard name="Popular moving destinations" countries={MOVING_DESTINATIONS} verb="Moving">
          Moving from the US to one of these? Pick it to start a moving quote with the destination
          already filled in. Going somewhere else? We move people to more than 200 countries, so{" "}
          <Link href="/quotes" className="font-medium text-brand hover:underline">
            start a quote
          </Link>{" "}
          with yours.
        </ContinentCard>

        <SplitSection
          kicker="Moving overseas"
          title="Worldwide moving services,"
          accent="handled end to end"
          lead="One team from the first survey to the last box through your new front door."
        >
          <Prose>
            <p>
              <BrandName /> helps families, individuals and businesses move from the US to more
              than 200 countries. Whether it is a whole household, an office, or a few boxes of
              things you can&rsquo;t leave behind, we plan the move around your dates and your
              budget.
            </p>
            <p>
              We look after packing, transport, the export paperwork and customs clearance at the
              other end, and you can follow the shipment the whole way. You get one point of
              contact who knows your move and answers your questions.
            </p>
          </Prose>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/services/international-relocation" className="btn btn-primary btn-lg">
              International relocation service <ArrowRightIcon size={15} />
            </Link>
            <Link href="/quotes" className="btn btn-secondary btn-lg">
              Get a moving quote
            </Link>
          </div>
        </SplitSection>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead kicker="How it works" title="How an international move" accent="comes together" />
            </div>
            <Steps
              steps={[
                {
                  title: "Survey and quote",
                  body: "Tell us what is moving, in person or on a video call, and we price the move around it.",
                },
                {
                  title: "Packing and pickup",
                  body: "We pack your things properly, crate anything fragile and collect from your door.",
                },
                {
                  title: "Shipping and customs",
                  body: "Your belongings go by ocean, air or ground, with the export and import paperwork prepared for you.",
                },
                {
                  title: "Delivery",
                  body: "Customs cleared at the destination, then delivered to your new address.",
                },
              ]}
            />
          </Rail>
        </section>

        <SplitSection
          title="What we can move"
          lead="If it belongs in your new home, ask us. A few items are restricted by carriers or by the country you are moving to."
        >
          <Checklist
            items={[
              "Household goods and furniture",
              "Boxes of personal effects: clothes, books, kitchenware, keepsakes",
              "Fragile and high-value items, crated for the journey",
              "Office contents for a business relocating abroad",
              "Excess baggage and suitcases sent ahead of your flight",
            ]}
          />
          <p className="mt-6 text-[15px] leading-relaxed text-ink-muted">
            Not sure about something? Check our{" "}
            <Link href="/resources/prohibited-items" className="font-medium text-brand hover:underline">
              prohibited items guide
            </Link>{" "}
            or call us on{" "}
            <a href="tel:+14047938759" className="font-medium text-brand hover:underline">
              +1 (404) 793-8759
            </a>
            .
          </p>
        </SplitSection>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead title="Planning your move" accent="in detail" />
            </div>
            <CardGrid
              columns={4}
              cards={[
                {
                  icon: <HouseLineIcon size={22} />,
                  title: "International relocation",
                  body: "The full service: survey, packing, transport options and the documents to prepare.",
                  href: "/services/international-relocation",
                },
                {
                  icon: <SuitcaseIcon size={22} />,
                  title: "Baggage shipping",
                  body: "Send suitcases and boxes ahead of your flight, collected from your door.",
                  href: "/services/baggage-shipping",
                },
                {
                  icon: <ReceiptIcon size={22} />,
                  title: "Customs duty guide",
                  body: "How duty works, and why used personal effects are often treated differently.",
                  href: "/resources/customs-duty",
                },
                {
                  icon: <BuildingsIcon size={22} />,
                  title: "Moving within the US",
                  body: "Staying in the country? See our domestic moving service for moves within the US.",
                  href: "/services/domestic-moving",
                },
                {
                  icon: <HouseLineIcon size={22} />,
                  title: "Moving to India",
                  body: "Household goods, unaccompanied baggage and Transfer of Residence basics.",
                  href: "/destinations/moving/india",
                },
                {
                  icon: <CubeIcon size={22} />,
                  title: "Ship boxes internationally",
                  body: "Sending a few boxes instead of a full move? Start here.",
                  href: "/services/ship-boxes-internationally",
                },
                {
                  icon: <CalculatorIcon size={22} />,
                  title: "Shipping calculator",
                  body: "Estimate the chargeable weight of your boxes before you book.",
                  href: "/shipping-calculator",
                },
                {
                  icon: <ProhibitIcon size={22} />,
                  title: "Prohibited items",
                  body: "What can't go in a move, and what needs extra paperwork.",
                  href: "/resources/prohibited-items",
                },
              ]}
            />
          </Rail>
        </section>

        <TrustedReviewsSection />
        <CtaBand
          title="Planning a move abroad?"
          accent="Get a moving quote."
          lead="Tell us where you are going and roughly what is moving. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
