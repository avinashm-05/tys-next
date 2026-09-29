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
  Steps,
} from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  ClipboardTextIcon,
  CubeIcon,
  HouseLineIcon,
  PackageIcon,
  ShippingContainerIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "Packers and Movers from the USA | TYS Global Logistics",
  description:
    "International packers and movers from the USA: a free survey, careful packing, shipping by air or ocean, customs clearance and delivery to your new home.",
  path: "/services/packers-and-movers",
});

// Packers and movers (2026-09-30). The phrase most Indian and South Asian
// families in the US search for when they move home abroad, so it gets its
// own page rather than relying on "international relocation". Same service
// and the same claims as /services/international-relocation (free survey in
// person or by video, packing and crating, air or ocean, customs clearance,
// delivery and basic assembly), written for how these customers ask. US to
// the world only: no pickups or moves starting outside the US. No prices.
export default function PackersAndMoversPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Packers and Movers", path: "/services/packers-and-movers" },
        ]}
      />
      <ServiceJsonLd
        name="International Packers and Movers"
        description="Packing, moving and shipping household goods from the USA to a new home abroad, door to door."
        slug="packers-and-movers"
      />
      <PageHeroBand
        title="International packers and movers,"
        accent="from the USA."
        subtitle="We pack your home, ship it by air or ocean, and deliver it to your new front door. One team, one plan, one person to call."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Packers and movers"
          heading="Your whole home, packed and moved abroad"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "US home to new home" },
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Paperwork handled" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "One contact", sub: "Start to finish" },
          ]}
        >
          <p>
            Moving abroad means a lot of boxes and a lot of decisions. As your packers and movers, we
            take care of the heavy part: packing everything safely, shipping it, and getting it
            through customs at the other end.
          </p>
          <p>
            Whether it&rsquo;s a full house or just the things that matter most, you get a free
            quote first and a real person to talk it through. Moving to India? Read our{" "}
            <Link href="/destinations/moving/india" className={LINK}>
              guide to moving to India from the USA
            </Link>
            .
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What we do"
              title="Everything a mover does,"
              accent="plus the shipping."
              lead="Local movers stop at the truck. An international move needs packing, shipping and customs too."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <ClipboardTextIcon size={22} />,
                title: "Free survey",
                body: "We look at what you're moving, in person or on a video call, and plan the move around it.",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Careful packing",
                body: "Proper boxes and wrapping, with custom crates for fragile or valuable pieces.",
              },
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Air or ocean",
                body: "Ocean for a full household, air for what you need soon after you land.",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Delivery",
                body: "Customs cleared, then delivered to your new home and placed where you want it.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "full-or-partial",
              title: "A full move, or just a few things",
              content: (
                <Prose>
                  <p>
                    <strong>A full household move</strong> usually goes by ocean. It&rsquo;s the
                    lowest cost for a large load, and your furniture, kitchen and belongings travel
                    together.
                  </p>
                  <p>
                    <strong>A partial move</strong> is for when you&rsquo;re taking the things that
                    matter and leaving the rest. A few boxes can go as parcels. See{" "}
                    <Link href="/services/ship-boxes-internationally" className={LINK}>
                      shipping boxes internationally
                    </Link>
                    . Extra suitcases can go ahead of you with{" "}
                    <Link href="/services/baggage-shipping" className={LINK}>
                      baggage shipping
                    </Link>
                    .
                  </p>
                  <p>Not sure which fits? Tell us what you&rsquo;re taking and we&rsquo;ll suggest the simplest way.</p>
                </Prose>
              ),
            },
            {
              id: "how-its-priced",
              title: "How a move is priced",
              lead: "Every move is quoted on its own, because no two homes are the same.",
              content: (
                <Checklist
                  items={[
                    "How much you're moving, by volume and weight",
                    "Air or ocean, and how soon you need it there",
                    "How much packing and crating you'd like us to do",
                    "The delivery address, and access at both ends (stairs, elevators, parking)",
                    "Customs duty or taxes at the destination, which depend on that country's rules",
                  ]}
                />
              ),
            },
            {
              id: "before-packing-day",
              title: "Before packing day",
              lead: "A little preparation makes packing day quicker and calmer.",
              content: (
                <Checklist
                  items={[
                    "Decide what's coming, what's being sold and what's staying behind",
                    "Keep passports, documents, jewelry and medicines with you, not in the move",
                    "Use up or give away liquids, food and anything flammable",
                    "Make a simple list of what's in each room, with rough values",
                    <>
                      Check our{" "}
                      <Link href="/resources/prohibited-items" className={LINK}>
                        prohibited items list
                      </Link>{" "}
                      for anything that can&rsquo;t travel
                    </>,
                  ]}
                />
              ),
            },
            {
              id: "customs",
              title: "Customs at the other end",
              content: (
                <Prose>
                  <p>
                    Every country has its own rules for household goods coming in. Many give returning
                    residents or new arrivals an allowance, and most want an itemized list of what&rsquo;s
                    in the shipment.
                  </p>
                  <p>
                    We prepare the paperwork with you and tell you what&rsquo;s needed before anything
                    ships. Our{" "}
                    <Link href="/resources/customs-duty" className={LINK}>
                      customs duty guide
                    </Link>{" "}
                    explains the basics.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="How your move" accent="comes together" />
          </div>
          <Steps
            steps={[
              { title: "Free quote and survey", body: "Tell us where you're going. We look at what you're moving and give you a clear plan and price." },
              { title: "Packing day", body: "Everything is packed, labeled and listed, with crates for anything fragile." },
              { title: "Shipping and customs", body: "Your goods travel by air or ocean, and we handle the customs paperwork." },
              { title: "Delivered home", body: "Delivered to your new address and placed where you want it." },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related" title="More for" accent="your move." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <HouseLineIcon size={22} />,
                title: "Moving to India",
                body: "Household goods, unaccompanied baggage and Transfer of Residence basics.",
                href: "/destinations/moving/india",
              },
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "International relocation",
                body: "The full picture of moving abroad, from documents to delivery.",
                href: "/services/international-relocation",
              },
              {
                icon: <CubeIcon size={22} />,
                title: "Moving within the US",
                body: "Packing and moving from one US state to another.",
                href: "/services/domestic-moving",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Packers and movers questions"
          faqs={[
            {
              q: "What do international packers and movers do?",
              a: "They pack your belongings, move them out of your home, ship them to your new country, handle the customs paperwork and deliver them to your new address. We do all of that as one service, with one person to call.",
            },
            {
              q: "How much do packers and movers cost for an international move?",
              a: "It depends on how much you're moving, air or ocean, how much packing you'd like done and where you're going. Every move is quoted on its own after a free survey, so you know the price before you commit.",
            },
            {
              q: "Do you pack everything for me?",
              a: "Yes, if you'd like us to. Our team packs your home, including custom crates for fragile or valuable pieces. You can also pack some things yourself.",
            },
            {
              q: "How far ahead should I book?",
              a: "As soon as you know your moving date. Booking early gives more room for the survey, packing day and shipping options.",
            },
            {
              q: "Can you move just a few boxes and some furniture?",
              a: "Yes. A partial move is common. A few boxes may be better sent as parcels, and we'll tell you which way costs less.",
            },
            {
              q: "Do you move people into the US?",
              a: "No. We move people from the USA to other countries, and within the US.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand title="Planning a move abroad?" />
      </PageBody>
    </>
  );
}
