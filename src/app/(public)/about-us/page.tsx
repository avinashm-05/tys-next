import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { TopicScroller } from "@/components/public/topic-scroller";
import {
  CardGrid,
  Checklist,
  CtaBand,
  PAD,
  PageBody,
  Prose,
  Section,
  SectionHead,
  SplitSection,
  StatRow,
} from "@/components/public/page-kit";
import {
  ArrowRightIcon,
  CarProfileIcon,
  GlobeIcon,
  HouseLineIcon,
  ShippingContainerIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "About Us: Shipping and Moving Company | TYS Global Logistics",
  description:
    "About TYS Global Logistics, a shipping and moving company in Atlanta, Georgia. We ship parcels, homes, vehicles and freight from the US to 200+ countries.",
  path: "/about-us",
});

// About page, 2026-09-29 renovation (page kit). Every fact here was already
// on this page or is one of the site-wide stats the home page shows. No team
// members, founding date or credentials are named because none have been
// confirmed.
export default function AboutUsPage() {
  return (
    <>
      <PageHeroBand quote={false}
        title="About"
        accent="TYS Global Logistics"
        subtitle="We're a shipping and moving company based in Atlanta, Georgia. We move parcels, homes, cars and freight from the US to more than 200 countries."
      />

      <PageBody>
        <SplitSection
          kicker="Who we are"
          title="Your shipping and moving partner,"
          accent="start to finish."
          lead="One team that plans your shipment, books it and stays with it until it arrives."
        >
          <Prose>
            <p>
              TYS Global Logistics connects people and businesses in the US with the rest of the
              world. It might be a single envelope, a whole household, the family car or a
              container of stock. Either way, we plan it, book it and look after it from pickup to
              final delivery.
            </p>
            <p>
              We work with a vetted network of carriers across air, ocean and ground, including
              FedEx, DHL, UPS and USPS. Every shipment is tracked, and you get a real advisor you
              can call, so you always know where things stand.
            </p>
            <p>
              TYS stands for <strong>Trust Your Shipment</strong>. It&rsquo;s the standard we hold
              every parcel, pallet and move to.
            </p>
            <p>
              Browse <Link href="/services">all our services</Link>, from{" "}
              <Link href="/services/international-relocation">international relocation</Link> to{" "}
              <Link href="/services/freight-forwarding">freight forwarding</Link>.
            </p>
          </Prose>
        </SplitSection>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead kicker="By the numbers" title="Where we are today" lead="A few numbers that describe the work." />
          </div>
          <div className="-mb-px">
            <StatRow
              stats={[
                { n: "200", s: "+", label: "Countries we deliver to" },
                { n: "900", s: "+", label: "Carrier networks" },
                { n: "70", s: "%", label: "Shipping savings, up to" },
                { n: "500", s: "+", label: "Shipments delivered" },
              ]}
            />
          </div>
        </Section>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead
              kicker="What we do"
              title="Four ways we can"
              accent="help you ship."
              lead="Pick the one that fits. Not sure which? Call us and we'll point you the right way."
              action={
                <Link href="/services" className="btn btn-secondary btn-lg">
                  All services <ArrowRightIcon size={15} />
                </Link>
              }
            />
          </div>
          <div className="-mb-px">
            <CardGrid
              columns={4}
              cards={[
                {
                  icon: <GlobeIcon size={22} />,
                  title: "Worldwide shipping",
                  body: "Parcels and documents to 200+ countries, at discounted FedEx, DHL, UPS and USPS rates.",
                  href: "/services/parcel-shipping",
                },
                {
                  icon: <HouseLineIcon size={22} />,
                  title: "Relocation and moving",
                  body: "Home moves within the US and abroad, planned door to door.",
                  href: "/services/international-relocation",
                },
                {
                  icon: <CarProfileIcon size={22} />,
                  title: "Auto transport",
                  body: "Cars, SUVs and motorcycles, shipped safely and insured.",
                  href: "/services/auto-transport",
                },
                {
                  icon: <ShippingContainerIcon size={22} />,
                  title: "Freight forwarding",
                  body: "Commercial and household cargo by air, ocean, rail or road.",
                  href: "/services/freight-forwarding",
                },
              ]}
            />
          </div>
        </Section>

        <TopicScroller
          topics={[
            {
              id: "a-real-person",
              title: "A real person on every shipment",
              lead: "You get an advisor who knows your shipment, not a ticket number.",
              content: (
                <Checklist
                  items={[
                    "One point of contact from quote to delivery",
                    "Help with packing, paperwork and customs questions",
                    "Support around the clock, by phone or email",
                  ]}
                />
              ),
            },
            {
              id: "carriers-you-trust",
              title: "Carriers you already trust",
              lead: "We aren't tied to one carrier, so we can pick the right one for each shipment.",
              content: (
                <Prose>
                  <p>
                    Your shipment travels on networks you already know: FedEx, DHL, UPS and USPS,
                    plus our air, ocean and ground partners for bigger loads. We weigh them up on
                    speed, cost and reliability, then book the best fit at a rate below the retail
                    counter price.
                  </p>
                  <p>
                    See how we work with the <Link href="/carriers">major carriers</Link>, or
                    check our <Link href="/shipping-rates">shipping rates</Link> to get a feel for
                    prices.
                  </p>
                </Prose>
              ),
            },
            {
              id: "tracked-door-to-door",
              title: "Tracked, door to door",
              lead: "On most shipments we handle pickup and delivery, start to finish.",
              content: (
                <Prose>
                  <p>
                    We arrange collection from your home or business, and every shipment comes with
                    a tracking number. You can follow it from pickup to the front door, and so can
                    the person receiving it.
                  </p>
                  <p>
                    <Link href="/tracking">How tracking works</Link>
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand />
      </PageBody>
    </>
  );
}
