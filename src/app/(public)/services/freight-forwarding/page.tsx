import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceIntro, ServiceFaq } from "@/components/public/service-page-sections";
import { CardGrid, Checklist, CtaBand, PAD, PageBody, Prose, Section, SectionHead, Steps } from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  AirplaneTiltIcon,
  BoatIcon,
  BookOpenTextIcon,
  CarProfileIcon,
  HouseLineIcon,
  MapPinLineIcon,
  StackIcon,
  TrainIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Freight Forwarding: Air, Ocean & Road | TYS Global Logistics",
  description:
    "Air, ocean, rail and road freight for commercial cargo, household goods and vehicles. We handle export paperwork, customs and delivery at both ends.",
  path: "/services/freight-forwarding",
});

// Renovated 2026-09-29 onto the page kit. The origin and destination
// checklists now sit in one TopicScroller instead of two stacked sections.
export default function FreightForwardingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Freight Forwarding", path: "/services/freight-forwarding" },
        ]}
      />
      <ServiceJsonLd name="Freight Forwarding" description="Origin and destination freight services for household, auto, and commercial cargo." slug="freight-forwarding" />
      <PageHeroBand
        title="Freight forwarding"
        accent="by air, ocean, rail and road."
        subtitle="Containers, pallets and commercial cargo moved from pickup to final delivery, with export paperwork and customs handled at both ends."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Freight forwarding"
          heading="Freight forwarding from origin to destination"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "900+", sub: "Carrier networks" },
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Handled at both ends" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "1", sub: "Dedicated coordinator" },
          ]}
        >
          <p>
            Our freight forwarding service moves commercial cargo, household goods and vehicles
            between the US and the rest of the world. We book the space, prepare the paperwork and
            manage every handoff between trucks, ports, airports and customs, so your cargo keeps
            moving.
          </p>
          <p>
            One coordinator looks after your shipment from the first quote to final delivery, and
            you always know who to call.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Four ways to move it"
              title="The right mode for"
              accent="your cargo."
              lead="We pick the mode, or the mix of modes, that fits your budget and your deadline."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <AirplaneTiltIcon size={22} />,
                title: "Air freight",
                body: "The fastest way to move cargo across borders, for urgent, perishable or high-value goods.",
              },
              {
                icon: <BoatIcon size={22} />,
                title: "Ocean freight",
                body: "Full containers, or shared container space for smaller loads. The economical choice for heavy cargo.",
              },
              {
                icon: <TrainIcon size={22} />,
                title: "Rail freight",
                body: "A cost-effective option for long overland legs, often paired with ocean or road.",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Road freight",
                body: "Trucking to and from ports and airports, and door delivery at the end of the journey.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="How freight forwarding works" lead="Your coordinator runs each stage and keeps you posted." />
          </div>
          <Steps
            steps={[
              {
                title: "Survey and quote",
                body: "We look at your cargo, on site or online, and quote the route and mode that fit.",
              },
              {
                title: "Packing and paperwork",
                body: "Export packing, loading and inventory, plus the export documents and customs filing.",
              },
              {
                title: "In transit",
                body: "Your cargo moves by air, ocean, rail or road, and you get status updates along the way.",
              },
              {
                title: "Customs and delivery",
                body: "Clearance at the destination, then transport to the final address and unloading.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "origin-services",
              title: "Origin services",
              lead: "Everything that happens before your cargo leaves the US.",
              content: (
                <Checklist
                  items={[
                    "Cargo survey, on site or online",
                    "Export documentation and customs filing",
                    "Export packing, loading and a full inventory",
                    "Consolidation of smaller shipments into shared containers",
                    "Haulage to the port, airport or container yard",
                    "The main freight leg to your destination",
                  ]}
                />
              ),
            },
            {
              id: "destination-services",
              title: "Destination services",
              lead: "Picking up where origin leaves off, through to the final address.",
              content: (
                <Checklist
                  items={[
                    "Customs clearance at the destination",
                    "Haulage from the port or container yard",
                    "Ground transport to the final delivery address",
                    "Unloading, unpacking and assembly",
                    "A proof of delivery inventory",
                    "Removal of pallets, crates and packing debris",
                  ]}
                />
              ),
            },
            {
              id: "customs",
              title: "Customs and paperwork",
              content: (
                <Prose>
                  <p>
                    Most freight delays start with paperwork. We prepare your export documents in the US
                    and work with you on clearance at the other end, so there are no surprises when your
                    cargo lands.
                  </p>
                  <p>
                    Duties and taxes are set by the destination country and are usually paid by the
                    importer. Our <Link href="/resources/customs-duty">customs duty guide</Link> explains
                    how they&rsquo;re worked out.
                  </p>
                  <p>
                    Some goods need permits, and some can&rsquo;t be shipped at all. Check the{" "}
                    <Link href="/resources/prohibited-items">prohibited items list</Link> before you book.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <ServiceFaq
          title="Freight forwarding questions"
          faqs={[
            {
              q: "What's the difference between origin and destination services?",
              a: "Origin services cover everything before your cargo ships: the survey, packing, export paperwork and loading. Destination services take over from there with customs clearance, unloading and final delivery.",
            },
            {
              q: "Do you handle customs clearance?",
              a: "Yes. We manage the customs paperwork and clearance at both origin and destination.",
            },
            {
              q: "Can you ship commercial cargo and household goods together?",
              a: "We plan freight for household goods, vehicles and commercial cargo. Whether they can travel together depends on the goods and the destination, so ask your coordinator.",
            },
            {
              q: "Will I have one point of contact?",
              a: "Yes. A dedicated coordinator manages your shipment from your first quote to final delivery.",
            },
            {
              q: "Do you offer storage if my cargo arrives before I'm ready?",
              a: "Yes, storage can be arranged at origin or destination. Tell us your dates and we'll plan around them.",
            },
            {
              q: "What modes of transport do you support?",
              a: "Air, ocean, rail and road. Many shipments combine two or more, depending on the cargo, the budget and the timeline.",
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Keep reading" title="Related services and guides" />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <HouseLineIcon size={22} />,
                title: "International relocation",
                body: "Moving your household abroad, packed and delivered door to door.",
                href: "/services/international-relocation",
              },
              {
                icon: <CarProfileIcon size={22} />,
                title: "Auto transport",
                body: "Cars and motorcycles moved anywhere in the US, on open or enclosed carriers.",
                href: "/services/auto-transport",
              },
              {
                icon: <StackIcon size={22} />,
                title: "Volume shipping",
                body: "Regular parcel shipments at business rates, alongside your freight.",
                href: "/services/volume-shipping",
              },
              {
                icon: <BookOpenTextIcon size={22} />,
                title: "Customs duty guide",
                body: "What customs duty is, how it's calculated, and who pays it.",
                href: "/resources/customs-duty",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Shipping to India",
                body: "Freight and parcels from the US to India, and what to know first.",
                href: "/destinations/india",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Shipping to Canada",
                body: "Cross-border shipping from the US to Canada, explained.",
                href: "/destinations/canada",
              },
            ]}
          />
        </Section>

        <TrustedReviewsSection />
        <CtaBand title="Have cargo to move?" accent="Get a freight quote." />
      </PageBody>
    </>
  );
}
