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
  HouseLineIcon,
  MusicNotesIcon,
  PackageIcon,
  PianoKeysIcon,
} from "@phosphor-icons/react/dist/ssr";

// Piano moving (new 2026-09-29, built for the Google Ads piano campaign).
// Scope decided from the ads: US domestic only, local and long distance,
// uprights and grands, plus pool tables. No international,
// no storage, no prices, and no promise of tuning or coverage.

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "Piano Movers | Local & Long-Distance Piano Moving | TYS",
  description:
    "Piano movers for upright and grand pianos, local or long distance across the US. Padded, strapped to a piano board and carried with care on stairs.",
  path: "/services/piano-moving",
});

export default function PianoMovingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Piano moving", path: "/services/piano-moving" },
        ]}
      />
      <ServiceJsonLd
        name="Piano Moving"
        description="Local and long-distance piano moving within the United States for upright, grand, baby grand and spinet pianos, plus pool tables."
        slug="piano-moving"
        domestic
      />
      <PageHeroBand
        title="Careful piano moving,"
        accent="across town or across the country."
        subtitle="Uprights, grands, spinets and baby grands, padded, strapped to a piano board and moved anywhere in the US by people who take it seriously."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Piano movers"
          heading="A piano is not just heavy furniture"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Room to room", sub: "Anywhere in the US" },
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Free", sub: "Piano moving quote" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "24/7", sub: "Expert support" },
          ]}
        >
          <p>
            Most of a piano&rsquo;s weight sits in its cast-iron plate, high up and off center. The
            case scratches easily, the legs aren&rsquo;t built to take sideways force, and the action
            inside is delicate. That&rsquo;s why piano moving needs a plan, the right equipment and a
            steady crew.
          </p>
          <p>
            TYS Global Logistics moves pianos locally and long distance within the United States, from
            one room to the next or from one state to another. Moving the rest of your home as well?
            See our{" "}
            <Link href="/services/domestic-moving" className={LINK}>
              domestic moving service
            </Link>
            .
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Pianos we move"
              title="Upright or grand,"
              accent="we move it."
              lead="Each type moves differently. We plan around the one you have."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <PianoKeysIcon size={22} />,
                title: "Upright pianos",
                body: "Tall, top-heavy and common in homes. Wrapped whole and moved upright on a dolly.",
              },
              {
                icon: <MusicNotesIcon size={22} />,
                title: "Grand pianos",
                body: "Legs and pedal lyre come off, and the body travels on its side, strapped to a piano board.",
              },
              {
                icon: <PianoKeysIcon size={22} />,
                title: "Baby grands",
                body: "Smaller than a concert grand but just as delicate, and moved the same careful way.",
              },
              {
                icon: <MusicNotesIcon size={22} />,
                title: "Spinets and consoles",
                body: "Compact, but still heavier than they look. Padded and strapped like any other piano.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="How it works" title="How we move" accent="your piano." />
          </div>
          <Steps
            steps={[
              {
                title: "Quote and survey",
                body: "Tell us the piano, both addresses and any stairs. We ask the right questions and quote for free.",
              },
              {
                title: "Prep and protect",
                body: "We pad floors and door frames, then wrap the piano in thick blankets. Grands have legs and lyre removed.",
              },
              {
                title: "Board and transport",
                body: "The piano is strapped to a padded piano board or skid, carried out and secured in the truck.",
              },
              {
                title: "Placement",
                body: "We carry it in, reassemble what came apart and set it exactly where you want it.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "stairs-and-tight-spaces",
              title: "Stairs and tight spaces",
              lead: "Stairs are part of the job, not a surprise on the day. We plan the route before anyone lifts.",
              content: (
                <Checklist
                  items={[
                    "We ask about steps, landings, turns and door widths when you request a quote.",
                    "We measure the piano against the tightest point on the route.",
                    "Grands are turned on their side on a piano board, which gets them through narrow doors.",
                    "Crew size is set by the piano and the stairs, never by guesswork.",
                    "Banisters, door frames and floors are padded before the piano moves.",
                    "If a route won't work safely, we tell you before moving day, not on it.",
                  ]}
                />
              ),
            },
            {
              id: "piano-moving-cost",
              title: "What affects the cost",
              lead: "Every piano move is quoted on its own. These are the things that shape the price.",
              content: (
                <Checklist
                  items={[
                    <>
                      <strong className="font-semibold">Piano type and size.</strong> A spinet and a
                      grand need different crews and equipment.
                    </>,
                    <>
                      <strong className="font-semibold">Distance.</strong> Across town, across the
                      state or across the country.
                    </>,
                    <>
                      <strong className="font-semibold">Stairs and floors.</strong> How many steps, and
                      at which end of the move.
                    </>,
                    <>
                      <strong className="font-semibold">Access.</strong> Narrow doors, tight turns,
                      elevators and how close the truck can park.
                    </>,
                    <>
                      <strong className="font-semibold">Special handling.</strong> Antique cases,
                      extra disassembly or unusual shapes.
                    </>,
                    <>
                      <strong className="font-semibold">Timing.</strong> Your preferred date and how
                      flexible you can be.
                    </>,
                  ]}
                />
              ),
            },
            {
              id: "pool-tables",
              title: "Pool tables",
              lead: "Heavy, fragile and precise, so they get the same patience as a piano.",
              content: (
                <Prose>
                  <p>
                    We take the table down, protect the slate and the
                    felt, and move it in pieces so nothing cracks or warps on the way. Ask about
                    setting it up again at the other end when you book.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related services" title="Moving more" accent="than the piano?" />
          </div>
          <CardGrid
            columns={2}
            cards={[
              {
                icon: <HouseLineIcon size={22} />,
                title: "Domestic moving",
                body: "Your whole household, packed and moved anywhere in the US.",
                href: "/services/domestic-moving",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Domestic shipping",
                body: "Boxes and parcels sent across the US with FedEx, UPS and USPS.",
                href: "/services/domestic-shipping",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Piano moving questions"
          faqs={[
            {
              q: "How much does it cost to move a piano?",
              a: "It depends on the piano, the distance and the access at each end. An upright moving across town on one level costs less than a grand going up a flight of stairs in another state. Tell us the piano type, both addresses and any stairs, and we'll give you a free quote.",
            },
            {
              q: "Can you move a piano upstairs?",
              a: "Yes. Stairs are a normal part of piano moving. We ask about steps, turns and landings when you request a quote and plan the crew and equipment around them. If a staircase is too tight for the piano to pass safely, we'll tell you before moving day.",
            },
            {
              q: "Do you move grand pianos?",
              a: "Yes, including baby grands. A grand is usually moved on its side: the legs and pedal lyre come off, the body is padded and strapped to a piano board, and it's put back together once it's in place.",
            },
            {
              q: "Do you do long-distance piano moving?",
              a: "Yes. We move pianos anywhere within the US, across the state or across the country. A long-distance piano gets the same wrapping and strapping as a local one and stays secured for the whole trip.",
            },
            {
              q: "Is my piano insured during the move?",
              a: "Every piano is padded, wrapped and strapped before it leaves the room. For coverage, ask about coverage options when you request your quote, so you know exactly what's protected before moving day.",
            },
            {
              q: "How should I prepare my piano for moving?",
              a: "Close and lock the lid if it has a lock, take everything off the top, and clear a path to the door. Tell us about stairs, tight turns and parking ahead of time. Pianos often drift out of tune after a move, so plan to have yours tuned once it has settled into its new room.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Moving a piano?"
          accent="Get a free quote."
          lead="Tell us the piano and both addresses. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
