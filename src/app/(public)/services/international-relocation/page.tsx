import type { Metadata } from "next";
import Image from "next/image";
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
import { Reveal } from "@/components/public/home/reveal";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  CarProfileIcon,
  HeadsetIcon,
  HouseLineIcon,
  MapPinLineIcon,
  PackageIcon,
  SuitcaseRollingIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "International Moving & Relocation | TYS Global Logistics",
  description:
    "Moving abroad from the US? We plan your international move door to door: survey, packing, air or ocean shipping, customs clearance and delivery.",
  path: "/services/international-relocation",
});

export default function InternationalRelocationPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "International Relocation", path: "/services/international-relocation" },
        ]}
      />
      <ServiceJsonLd
        name="International Relocation"
        description="Door-to-door international relocation for your household, family, and belongings."
        slug="international-relocation"
      />
      <PageHeroBand
        title="International moving and relocation,"
        accent="door to door."
        subtitle="Moving your life to another country is big enough. We plan the packing, shipping and customs so you can focus on the move itself."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Door-to-door relocation"
          heading="One team for your whole move abroad"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "Pickup to delivery" },
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Handled for you" },
            { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Countries" },
          ]}
        >
          <p>
            TYS Global Logistics plans international relocations for families and individuals moving
            from the US to a new country, for a new job, for school or for a fresh start. We handle
            it from the first box packed to the last one delivered.
          </p>
          <p>
            Big move or small, you get one team and one plan, shipped by air, ocean or ground at a
            pace and price that fit your timeline. See the{" "}
            <Link href="/destinations/moving" className={LINK}>
              countries we move to
            </Link>
            .
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Why TYS"
              title="Moving abroad, with someone"
              accent="in your corner."
              lead="An international move has a lot of moving parts. These are the ones we take off your plate."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <HeadsetIcon size={22} />,
                title: "One move coordinator",
                body: "One person who plans your move and answers your questions from start to finish.",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Careful packing",
                body: "Professional packing, with custom crates for fragile and high-value pieces.",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Pickup and delivery",
                body: "We collect from your door and deliver to your new one on most moves.",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Tracking all the way",
                body: "Follow your shipment from the day it leaves to the day it arrives.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "whats-included",
              title: "What's included in your move",
              lead: "Every international move is planned around your home and your dates. Most include:",
              content: (
                <Checklist
                  items={[
                    "A free survey of your belongings, in person or by video",
                    "Professional packing, with custom crating for fragile items",
                    "Export paperwork and insurance options",
                    "Shipping by ocean, air or ground to your new country",
                    "Customs clearance at the destination",
                    "Delivery, unpacking and basic furniture assembly",
                  ]}
                />
              ),
            },
            {
              id: "air-ocean-ground",
              title: "Air, ocean or ground",
              content: (
                <Prose>
                  <p>
                    <strong>Ocean</strong> is the usual choice for a household move. It costs the
                    least for larger loads and takes longer.
                  </p>
                  <p>
                    <strong>Air</strong> is the fastest and costs more. It suits a smaller move, or
                    the things you need soon after you land.
                  </p>
                  <p>
                    <strong>Ground</strong> works for moves within North America. Plenty of people
                    mix them, sending a few essentials by air and the rest by sea. We&rsquo;ll help
                    you find the split that fits your budget and timeline.
                  </p>
                </Prose>
              ),
            },
            {
              id: "moving-documents",
              title: "Documents to prepare",
              lead: (
                <>
                  Start gathering these early. Some take weeks to replace. Our{" "}
                  <Link href="/resources/customs-duty" className={LINK}>
                    customs duty guide
                  </Link>{" "}
                  and{" "}
                  <Link href="/resources/prohibited-items" className={LINK}>
                    prohibited items list
                  </Link>{" "}
                  are worth a read too.
                </>
              ),
              content: (
                <Checklist
                  items={[
                    "Passport",
                    "Visa, if your destination requires one",
                    "Birth certificate",
                    "Marriage certificate, if it applies",
                    "Immunization and medical records",
                    "School records",
                  ]}
                />
              ),
            },
          ]}
        />

        <SplitSection
          kicker="Who we move"
          title="Homes, teams and"
          accent="whole offices."
          lead="Most of our relocation work is families moving house. We also move businesses and institutions."
        >
          <Reveal className="relative aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
            <Image
              src="/frontend/images/home/moving.webp"
              alt="A living room full of packed moving boxes and house plants"
              fill
              sizes="(min-width: 1320px) 640px, (min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="mt-8">
            <Checklist
              items={[
                <>
                  <strong className="font-semibold">Household moves.</strong> Your furniture and
                  belongings, packed and delivered to your new home.
                </>,
                <>
                  <strong className="font-semibold">Office and business moves.</strong> A planned move
                  for companies opening in a new market.
                </>,
                <>
                  <strong className="font-semibold">Employee relocation.</strong> Help for your people
                  as they settle in another country.
                </>,
                <>
                  <strong className="font-semibold">Institutional moves.</strong> Embassies, nonprofits
                  and other organizations moving overseas.
                </>,
              ]}
            />
          </div>
        </SplitSection>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related services" title="More for" accent="your move." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <CarProfileIcon size={22} />,
                title: "Auto transport",
                body: "Bring the car too. We can ship it on the same schedule as your household goods.",
                href: "/services/auto-transport",
              },
              {
                icon: <SuitcaseRollingIcon size={22} />,
                title: "Baggage shipping",
                body: "Send extra suitcases ahead instead of paying airline excess baggage fees.",
                href: "/services/baggage-shipping",
              },
              {
                icon: <HouseLineIcon size={22} />,
                title: "Domestic moving",
                body: "Moving within the US instead? Same careful team, coast to coast.",
                href: "/services/domestic-moving",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Packers and movers",
                body: "What our packers and movers do, from packing day to delivery abroad.",
                href: "/services/packers-and-movers",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Moving to India",
                body: "Household goods, unaccompanied baggage and Transfer of Residence.",
                href: "/destinations/moving/india",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Worldwide moving",
                body: "Country-by-country moving, door to door from the US.",
                href: "/destinations/moving",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="International moving questions"
          faqs={[
            {
              q: "How far in advance should I book my move?",
              a: "As soon as you have a date in mind. Booking early gives us more room with your survey, your packing day and the way we ship.",
            },
            {
              q: "Do you provide packing materials and services?",
              a: "Yes. Our team packs for you, including custom crates for fragile or high-value items.",
            },
            {
              q: "What's the difference between air, ocean, and ground transport?",
              a: "Air is the fastest and the most expensive. Ocean costs the least for a larger household move but takes longer. Ground suits moves within North America. We'll help you choose based on your timeline and budget.",
            },
            {
              q: "Do I need to be present for customs clearance?",
              a: "No. We handle customs clearance at the destination for you, though you may need to send us some documents ahead of time.",
            },
            {
              q: "Can you move my vehicle along with my household goods?",
              a: "Yes. We can arrange auto transport alongside your move so everything follows one schedule.",
            },
            {
              q: "What if my new home isn't ready when my shipment arrives?",
              a: "Tell us as early as you can and we'll look at holding your shipment until you're ready for delivery.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand title="Ready to move?" />
      </PageBody>
    </>
  );
}
