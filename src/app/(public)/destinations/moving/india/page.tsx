import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
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
  Steps,
} from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  ArmchairIcon,
  ArrowRightIcon,
  GlobeHemisphereWestIcon,
  HeartIcon,
  HouseLineIcon,
  PackageIcon,
  PlugIcon,
  ProhibitIcon,
  ReceiptIcon,
  SuitcaseRollingIcon,
} from "@phosphor-icons/react/dist/ssr";

// Moving to India from the USA (new 2026-09-29, SEO page under worldwide
// moving). Outbound only: household goods leaving the US for India.
//
// Regulatory facts, all from official Indian sources, checked 2026-09-29:
// - Baggage Rules, 2026 (Notification 14/2026-Customs (N.T.), 1 Feb 2026,
//   in force 2 Feb 2026, supersedes the Baggage Rules, 2016). Rule 7 and
//   Appendix I: Transfer of Residence allowance tiers by time abroad (three
//   to twelve months; at least one year in the preceding two; two years or
//   more), not more than one unit each of Annexure II articles, the
//   short-visit (six months) and three-year conditions. Rule 10:
//   unaccompanied baggage timing. Source: indiabudget.gov.in/doc/cen/cus1426.pdf,
//   PIB release PRID 2222384, CBIC "Guide for International Travellers"
//   (Feb 2026) and Bengaluru Customs FAQ 2026.
// - Customs Baggage (Declaration and Processing) Regulations, 2026
//   (Notification 15/2026): unaccompanied baggage declared electronically in
//   Form CBD-II (passport details, travel dates, short visits, TR history,
//   itemized list, transport documents); an authorised person may file it.
//   "Tourist of Indian origin" includes NRIs and OCI cardholders.
// - Cars: CBIC "Transfer of Residence Rules at a Glance": vehicles are not
//   covered by baggage concessions and pay duty at the tariff rate. Kept
//   general on purpose.
// Rupee value caps are deliberately left off the page: they changed in 2026
// and may change again. We link to CBIC instead.

const LINK = "font-medium text-brand hover:underline";
const QUOTE_IN = "/quotes?to_country=IN";
const CBIC_GUIDE = "https://www.cbic.gov.in/resources/htdocs-cbec/travellerguide_atithi.pdf";

export const metadata: Metadata = pageMetadata({
  title: "Moving to India from the USA | TYS Global Logistics",
  description:
    "Moving to India from the USA? Ship household goods and unaccompanied baggage, learn the Transfer of Residence basics, and get a free moving quote.",
  path: "/destinations/moving/india",
});

export default function MovingToIndiaPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: "Worldwide moving", path: "/destinations/moving" },
          { name: "Moving to India", path: "/destinations/moving/india" },
        ]}
      />
      <PageHeroBand
        title="Moving to India"
        accent="from the USA."
        subtitle="Your household goods and belongings, packed, shipped and delivered in India, with help on the customs paperwork along the way."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Moving to India"
          heading="Going home, or starting fresh in India"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "US home to India home" },
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs help", sub: "Paperwork explained" },
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Free", sub: "Moving quote for India" },
          ]}
        >
          <p>
            Some people are moving back after years in the US. Others are going to India for work, to
            retire or to be near family. Either way, you have a house full of things to sort, and a
            set of Indian customs rules to get right.
          </p>
          <p>
            We move households and personal belongings from anywhere in the US to India. Our{" "}
            <Link href="/services/international-relocation" className={LINK}>
              international relocation service
            </Link>{" "}
            covers the whole move. This page covers what is special about India.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What you can send"
              title="What people ship"
              accent="when they move to India."
              lead="From a few suitcases to a whole household."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <ArmchairIcon size={22} />,
                title: "Household goods",
                body: "Furniture, kitchenware, books, linens and the things that make a house a home.",
              },
              {
                icon: <SuitcaseRollingIcon size={22} />,
                title: "Unaccompanied baggage",
                body: "Suitcases and boxes sent separately from your flight, so you travel light.",
              },
              {
                icon: <PlugIcon size={22} />,
                title: "Appliances and electronics",
                body: "Laptops, TVs and kitchen appliances. Check the voltage first (see below).",
              },
              {
                icon: <HeartIcon size={22} />,
                title: "Keepsakes",
                body: "Photos, artwork, family papers and the things you could never replace.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "transfer-of-residence",
              title: "Transfer of Residence basics",
              lead: "India gives people moving there a duty-free allowance on their personal and household things.",
              content: (
                <Prose>
                  <p>
                    This is called <strong>Transfer of Residence</strong>, or TR. It is set out in
                    India&rsquo;s Baggage Rules, 2026, which came into force on 2 February 2026 and
                    replaced the older 2016 rules.
                  </p>
                  <ul>
                    <li>
                      <strong>Who it covers.</strong> Indian passport holders and people of Indian
                      origin, including NRIs and OCI cardholders. Foreigners moving to India on a
                      long-term visa have their own set of allowances.
                    </li>
                    <li>
                      <strong>How much.</strong> The duty-free allowance depends on how long you have
                      lived abroad. There are tiers for three to twelve months, at least one year in the
                      last two, and two years or more. Two years or more gets the largest allowance.
                    </li>
                    <li>
                      <strong>Conditions.</strong> For the two-year tier, short visits to India in the
                      two years before your move should add up to no more than six months. The top
                      tiers also require that you haven&rsquo;t used TR in the previous three years.
                    </li>
                    <li>
                      <strong>Appliances.</strong> Listed items like a TV, washing machine, fridge or
                      laptop are generally allowed one of each, within the overall value limit.
                    </li>
                  </ul>
                  <p>
                    Anything above the allowance is charged duty. Customs has the final say on each
                    case, and the exact value limits are in the{" "}
                    <a href={CBIC_GUIDE} target="_blank" rel="noopener noreferrer">
                      CBIC guide for international travellers
                    </a>
                    .
                  </p>
                </Prose>
              ),
            },
            {
              id: "timing-your-shipment",
              title: "Timing your shipment",
              lead: "India has time limits for baggage that travels separately from you.",
              content: (
                <Prose>
                  <p>
                    Under the Baggage Rules, unaccompanied baggage should be things you had with you
                    abroad. It can land in India <strong>up to two months before you arrive</strong>,
                    or be sent <strong>within one month after you arrive</strong>.
                  </p>
                  <p>
                    Customs can allow more time in some cases, for example if illness or a travel
                    disruption delays your own arrival. It is still best to plan around the normal
                    limits.
                  </p>
                  <p>
                    Ocean shipping takes longer than air, so we help you time your booking around
                    your flight. We give you the expected transit time with your quote.
                  </p>
                </Prose>
              ),
            },
            {
              id: "documents-you-need",
              title: "Documents you'll usually need",
              lead: "Your belongings are declared to Indian customs on a form called CBD-II.",
              content: (
                <>
                  <Checklist
                    items={[
                      "Your passport details, including when it expires, and your old passport number if you have one.",
                      "The date you left India and the date you arrive back.",
                      "Dates of any short visits to India in the last two years, if you are claiming TR.",
                      "Whether you have used TR in the last three years.",
                      "A full list of what is packed, with the brand, quantity and value of each item.",
                      "The shipping document for your goods, which we provide.",
                    ]}
                  />
                  <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">
                    The declaration is filed electronically. Someone you authorize, such as a customs
                    broker, can file it for you. Start your packing list early. It is much easier to
                    write it as you pack than afterwards.
                  </p>
                </>
              ),
            },
            {
              id: "ship-or-sell",
              title: "What to ship and what to sell",
              lead: "Not everything is worth the trip. A few questions help you decide.",
              content: (
                <Checklist
                  items={[
                    <>
                      <strong className="font-semibold">Check the voltage.</strong> The US runs on 120
                      volts and India on 230. Many plug-in appliances won&rsquo;t work without a
                      transformer.
                    </>,
                    <>
                      <strong className="font-semibold">Weigh up big furniture.</strong> A bulky sofa
                      takes a lot of space. Compare the cost of shipping it with buying new in India.
                    </>,
                    <>
                      <strong className="font-semibold">Ship what you can&rsquo;t replace.</strong>{" "}
                      Heirlooms, photos, artwork and papers are always worth taking.
                    </>,
                    <>
                      <strong className="font-semibold">Mind the allowance.</strong> Brand new items
                      use up your TR allowance quickly, and only one of each listed appliance is
                      generally allowed.
                    </>,
                    <>
                      <strong className="font-semibold">Leave out restricted items.</strong> Check our{" "}
                      <Link href="/resources/prohibited-items" className={LINK}>
                        prohibited items guide
                      </Link>{" "}
                      before you pack.
                    </>,
                  ]}
                />
              ),
            },
            {
              id: "cars",
              title: "What about your car?",
              lead: "A car is handled very differently from your household goods.",
              content: (
                <Prose>
                  <p>
                    Cars are not part of the baggage or TR allowance. Importing one into India has its
                    own conditions, and customs duty is charged at the full rate.
                  </p>
                  <p>
                    Before you decide to take a car, check the current rules with Indian customs.
                    Many people find it simpler to sell here and buy in India.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <SplitSection
          kicker="Planning ahead"
          title="A simple moving timeline"
          accent="for India."
          lead="Every move is different, but this order of things works for most families."
        >
          <Checklist
            items={[
              <>
                <strong className="font-semibold">Two to three months before.</strong> Decide what to
                ship, sell or give away. Ask us for a moving quote.
              </>,
              <>
                <strong className="font-semibold">Six to eight weeks before.</strong> Book your move
                and choose air, ocean or a mix of both. Start your packing list.
              </>,
              <>
                <strong className="font-semibold">A few weeks before.</strong> Gather your passport
                details and travel dates. Finish packing and confirm the pickup date.
              </>,
              <>
                <strong className="font-semibold">Moving week.</strong> Your belongings are collected
                from your US home. Keep what you need for the first weeks in your suitcase.
              </>,
              <>
                <strong className="font-semibold">After you arrive.</strong> The customs declaration
                is filed, any duty is settled, and your things are delivered to your new home.
              </>,
            ]}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={QUOTE_IN} className="btn btn-primary btn-lg">
              Get a moving quote <ArrowRightIcon size={15} />
            </Link>
          </div>
        </SplitSection>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="How it works" title="How a move to India" accent="comes together." />
          </div>
          <Steps
            steps={[
              {
                title: "Survey and quote",
                body: "Tell us what is moving, in person or on a video call, and we price the move around it.",
              },
              {
                title: "Packing and pickup",
                body: "Your belongings are packed, listed item by item and collected from your door.",
              },
              {
                title: "Air or ocean",
                body: "Your things travel by air, ocean or both, with the paperwork prepared for Indian customs.",
              },
              {
                title: "Customs and delivery",
                body: "Cleared through Indian customs, then delivered to your new home.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related guides" title="Planning your move" accent="in detail." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <HouseLineIcon size={22} />,
                title: "International relocation",
                body: "The full service: survey, packing, transport options and paperwork.",
                href: "/services/international-relocation",
              },
              {
                icon: <GlobeHemisphereWestIcon size={22} />,
                title: "Worldwide moving",
                body: "Moving from the US to another country? See all our moving destinations.",
                href: "/destinations/moving",
              },
              {
                icon: <SuitcaseRollingIcon size={22} />,
                title: "Baggage shipping",
                body: "Send suitcases and boxes ahead of your flight, collected from your door.",
                href: "/services/baggage-shipping",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Shipping to India",
                body: "Just sending a few boxes? Our guide to parcels, gifts and customs.",
                href: "/destinations/india",
              },
              {
                icon: <ReceiptIcon size={22} />,
                title: "Customs and duties",
                body: "How duty works, and why used personal effects are often treated differently.",
                href: "/resources/customs-duty",
              },
              {
                icon: <ProhibitIcon size={22} />,
                title: "Prohibited items",
                body: "What you can't send internationally, and what needs extra paperwork.",
                href: "/resources/prohibited-items",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Moving to India: questions"
          faqs={[
            {
              q: "What is Transfer of Residence for India?",
              a: "Transfer of Residence, or TR, is a duty-free allowance on personal and household things for people moving to India after living abroad. It is set out in India's Baggage Rules, 2026. The allowance depends on how long you have lived abroad, with the largest for two years or more, and it comes with conditions about short visits and past use.",
            },
            {
              q: "Can NRIs and OCI cardholders use Transfer of Residence?",
              a: "Yes. The 2026 rules cover Indian passport holders and people of Indian origin, which includes NRIs and OCI cardholders. Foreigners moving to India on a long-term visa have a separate set of allowances. Customs decides each case, so check the current rules for your situation.",
            },
            {
              q: "Can I ship my belongings before I fly to India?",
              a: "Yes. Under the Baggage Rules, unaccompanied baggage can land in India up to two months before you arrive, or be sent within one month after you arrive. Customs can allow more time in some cases. We help you time the shipment around your flight.",
            },
            {
              q: "How long does it take to move household goods to India?",
              a: "It depends on whether your things go by air or ocean, and where in India they are going. Ocean takes longer than air but usually costs less for a bigger move. We give you the expected timing with your quote.",
            },
            {
              q: "Will I pay customs duty on my household goods?",
              a: "Used personal effects are generally duty free, and if you qualify, TR adds a duty-free allowance for household articles. Anything above the allowance, or anything that doesn't qualify, is charged duty. Cars are not part of the allowance.",
            },
            {
              q: "What documents do I need to move to India?",
              a: "Your belongings are declared on a customs form called CBD-II. It asks for your passport details, your travel dates, any short visits to India in the last two years, whether you have used TR before, and a full list of what is packed with values. We provide the shipping document for your goods.",
            },
            {
              q: "Can I take my car when I move to India?",
              a: "Cars are not part of the baggage or TR allowance. Importing one has its own conditions and full customs duty. Check the current rules with Indian customs before you decide. Many people find it simpler to sell here and buy in India.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Planning a move to India?"
          accent="Get a moving quote."
          lead="Tell us roughly what is moving and where to. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
