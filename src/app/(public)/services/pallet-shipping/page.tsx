import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceIntro, ServiceFaq } from "@/components/public/service-page-sections";
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
} from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  AirplaneTiltIcon,
  BoatIcon,
  PackageIcon,
  ShippingContainerIcon,
  StackIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

// Pallet shipping (new 2026-09-29). Palletized freight within the US (LTL)
// and from the US to other countries by air or ocean. We arrange it through
// carrier partners: no claim of our own trucks or warehouses, no pallets or
// wrapping supplied, no prices, no transit promises, no cover included.

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "Pallet Shipping: LTL and International | TYS Global Logistics",
  description:
    "Ship pallets across the US by LTL freight or overseas by air and ocean. How pallets are measured and priced, freight class made simple, and a free quote.",
  path: "/services/pallet-shipping",
});

export default function PalletShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Pallet shipping", path: "/services/pallet-shipping" },
        ]}
      />
      <ServiceJsonLd
        name="Pallet Shipping"
        description="Palletized freight shipping within the United States by LTL, and from the United States to other countries by air and ocean freight."
        slug="pallet-shipping"
      />
      <PageHeroBand
        title="Pallet shipping,"
        accent="across the US or around the world."
        subtitle="One pallet or several, sent by LTL freight within the US or by air and ocean to other countries. We arrange it with trusted carriers and explain every step."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Palletized freight"
          heading="When your shipment is too big for boxes"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "US and worldwide" },
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Export", sub: "Paperwork help" },
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Free", sub: "Pallet quotes" },
          ]}
        >
          <p>
            Once you have lots of boxes, heavy goods or stock for a business, a pallet is often the
            simpler and safer way to ship. Everything is stacked, wrapped and moved as one piece, so
            nothing gets split up on the way.
          </p>
          <p>
            TYS Global Logistics is based in Atlanta, Georgia. We arrange pallet shipping from
            anywhere in the US, to other US addresses or to other countries. For containers and
            larger cargo, see our{" "}
            <Link href="/services/freight-forwarding" className={LINK}>
              freight forwarding
            </Link>{" "}
            service.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Ways to ship" title="Three ways" accent="to move a pallet." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <TruckIcon size={22} />,
                title: "LTL within the US",
                body: "Less than truckload. Your pallets share a truck with other shipments, so you only pay for the space you use.",
              },
              {
                icon: <AirplaneTiltIcon size={22} />,
                title: "Air freight abroad",
                body: "The faster way to send a pallet overseas. Priced on weight or size, whichever is greater.",
              },
              {
                icon: <BoatIcon size={22} />,
                title: "Ocean freight abroad",
                body: "Usually the better value for heavy pallets when time is less pressing. Shares a container with other cargo.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "how-pallets-are-measured",
              title: "How pallets are measured",
              lead: "Measure the whole pallet, as it will ship, not just the boxes on it.",
              content: (
                <Prose>
                  <p>
                    Carriers price a pallet on its size and weight, so both need to be right. A
                    standard pallet in the US is 48 by 40 inches, but what matters is the size of the
                    finished load.
                  </p>
                  <ul>
                    <li>
                      <strong>Length and width:</strong> measure the widest points, including any
                      boxes that hang over the edge.
                    </li>
                    <li>
                      <strong>Height:</strong> measure from the floor to the top of the load,
                      including the pallet itself.
                    </li>
                    <li>
                      <strong>Weight:</strong> weigh the whole thing, pallet and all.
                    </li>
                  </ul>
                  <p>
                    If the numbers on your quote are too low, the carrier re-measures and bills the
                    difference later. Getting them right at the start avoids that surprise.
                  </p>
                </Prose>
              ),
            },
            {
              id: "freight-class",
              title: "Freight class, in plain English",
              lead: "For LTL within the US, your pallet gets a freight class. Here's what that means.",
              content: (
                <Prose>
                  <p>
                    Freight class is a number, from 50 up to 500, that US LTL carriers use to price
                    freight. The main thing that decides it is <strong>density</strong>: how heavy the
                    pallet is for the space it takes up.
                  </p>
                  <p>
                    Dense, heavy freight, like tiles or metal parts, usually gets a lower class and a
                    lower rate per pound. Light, bulky freight, like furniture or foam, gets a higher
                    class. How easy the goods are to handle and how fragile they are can play a part
                    too.
                  </p>
                  <p>
                    You don&rsquo;t need to work out the class yourself. Give us accurate
                    measurements, the weight and what&rsquo;s on the pallet, and we&rsquo;ll get it
                    right.
                  </p>
                </Prose>
              ),
            },
            {
              id: "international-pallets",
              title: "Sending a pallet overseas",
              lead: "International pallets are priced a little differently, and need export paperwork.",
              content: (
                <Prose>
                  <p>
                    <strong>By air</strong>, a pallet is billed on its actual weight or its volumetric
                    weight, whichever is greater. Our{" "}
                    <Link href="/resources/volumetric-weight">volumetric weight guide</Link> explains
                    how that works.
                  </p>
                  <p>
                    <strong>By ocean</strong>, smaller loads usually share a container with other
                    cargo and are priced mostly on the space they take up.
                  </p>
                  <p>
                    Many countries require wooden pallets to be heat treated and stamped with the
                    ISPM 15 mark, to stop pests traveling with the wood. Plastic pallets avoid the
                    issue. We&rsquo;ll also help with the export paperwork, and our{" "}
                    <Link href="/resources/customs-duty">customs duty guide</Link> explains the costs
                    that may apply at the other end.
                  </p>
                </Prose>
              ),
            },
            {
              id: "packing-a-pallet",
              title: "How to pack and wrap a pallet",
              lead: "A well built pallet travels better and is less likely to be damaged.",
              content: (
                <Checklist
                  items={[
                    "Use a sturdy pallet with no broken or missing boards.",
                    "Put the heaviest boxes on the bottom and stack them square, like bricks.",
                    "Keep everything within the edges of the pallet. Overhang gets crushed.",
                    "Keep the top as flat as you can.",
                    "Wrap the load tightly in stretch wrap, including a few turns around the pallet itself.",
                    "Add straps or corner boards for heavy or tall loads.",
                    "Label the pallet on at least two sides.",
                  ]}
                />
              ),
            },
          ]}
        />

        <SplitSection
          kicker="Pickup and delivery"
          title="No loading dock?"
          accent="Tell us up front."
          lead="Extra services at either end change the price, so it helps to know about them when you ask for a quote."
        >
          <Checklist
            items={[
              <>
                <strong className="font-semibold">Liftgate.</strong> A truck with a lift at the back,
                for places with no loading dock or forklift.
              </>,
              <>
                <strong className="font-semibold">Residential pickup or delivery.</strong> Homes are
                harder for big trucks to reach, so carriers often charge extra.
              </>,
              <>
                <strong className="font-semibold">Limited access.</strong> Schools, farms, storage
                units, building sites and similar places.
              </>,
              <>
                <strong className="font-semibold">Inside delivery.</strong> Moving the pallet past the
                door, rather than leaving it at the curb or dock.
              </>,
              <>
                <strong className="font-semibold">Appointment.</strong> A call ahead or a set delivery
                window, when someone needs to be there.
              </>,
            ]}
          />
        </SplitSection>

        <SplitSection
          kicker="Get a quote"
          title="What we need"
          accent="for a pallet quote."
          lead="Have these to hand and your quote will be quicker and more accurate."
        >
          <Checklist
            items={[
              "Pickup address or ZIP code in the US",
              "Delivery address, or city and country for international",
              "How many pallets",
              "Length, width and height of each pallet, as it will ship",
              "Weight of each pallet, including the pallet",
              "What's on the pallet, and whether any of it is hazardous",
              "Whether each end is a business or a home, and has a loading dock",
              "For international, the value of the goods",
            ]}
          />
        </SplitSection>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related services" title="Not quite" accent="a pallet?" />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Freight forwarding",
                body: "Containers and larger cargo by air, ocean, rail or road.",
                href: "/services/freight-forwarding",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Ship boxes internationally",
                body: "A few boxes to send abroad? Often simpler than a pallet.",
                href: "/services/ship-boxes-internationally",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Domestic shipping",
                body: "Parcels and freight anywhere in the United States.",
                href: "/services/domestic-shipping",
              },
              {
                icon: <StackIcon size={22} />,
                title: "Volume shipping",
                body: "Shipping pallets or parcels every week? Ask about volume rates.",
                href: "/services/volume-shipping",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Pallet shipping questions"
          faqs={[
            {
              q: "How is the cost of shipping a pallet worked out?",
              a: "It depends on the pallet's size and weight, where it's going, and any extra services such as a liftgate or residential delivery. For LTL within the US, the freight class also plays a part. Ask for a free quote and we'll price it for you.",
            },
            {
              q: "What is LTL shipping?",
              a: "LTL means less than truckload. Your pallets share a truck with other shipments, so you only pay for the space you use rather than a whole truck.",
            },
            {
              q: "What is freight class?",
              a: "It's a number from 50 to 500 that US LTL carriers use to price freight. It mostly depends on density: heavy, compact freight gets a lower class, and light, bulky freight gets a higher one.",
            },
            {
              q: "Can you ship a pallet to another country?",
              a: "Yes. We ship pallets from the US to other countries by air or ocean freight, and help with the export paperwork. Wooden pallets may need to be heat treated and carry the ISPM 15 mark.",
            },
            {
              q: "What if I don't have a loading dock?",
              a: "Tell us when you ask for a quote. We can book a truck with a liftgate, which lowers the pallet to the ground. It usually adds to the price, so it's best to know up front.",
            },
            {
              q: "Can a pallet be picked up from my home?",
              a: "Yes, in most places. Residential pickup is arranged with the carrier and often costs a little more than a business address, so let us know when you ask for a quote.",
            },
            {
              q: "Do you supply the pallet and wrapping?",
              a: "No. Your goods need to be on a sturdy pallet and wrapped before pickup. We're happy to explain how to pack it so it travels safely.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Got a pallet to ship?"
          accent="Get a free quote."
          lead="Send us the size, weight and addresses. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
