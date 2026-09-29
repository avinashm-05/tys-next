import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceIntro, ServiceFaq } from "@/components/public/service-page-sections";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { CardGrid, CtaBand, PAD, PageBody, Prose, Section, SectionHead, Steps } from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  BabyIcon,
  BookOpenTextIcon,
  GolfIcon,
  GlobeHemisphereWestIcon,
  MapPinLineIcon,
  PackageIcon,
  HouseLineIcon,
  HourglassIcon,
  StudentIcon,
  SuitcaseRollingIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Baggage Shipping: Send Luggage Ahead | TYS Global Logistics",
  description:
    "Ship your luggage instead of checking it. We collect your bags from your door in the US and deliver them worldwide, tracked the whole way.",
  path: "/services/baggage-shipping",
});

// Added 2026-08-21. Highest-volume gap found in the keyword research
// (~70,530 monthly searches) with no competing page from SFL, so this is the
// single best organic opening identified in the audit.
// Renovated 2026-09-29 onto the page kit; FAQ added for the common queries.
export default function BaggageShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Baggage Shipping", path: "/services/baggage-shipping" },
        ]}
      />
      <ServiceJsonLd
        name="Baggage Shipping"
        description="Door-to-door luggage and excess baggage shipping from the United States worldwide."
        slug="baggage-shipping"
      />
      <PageHeroBand
        title="Baggage shipping that"
        accent="travels ahead of you."
        subtitle="Send your suitcases and boxes before you fly. We collect them from your door and deliver them to wherever you're staying, tracked the whole way."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Luggage shipping"
          heading="Why ship your baggage instead of checking it"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "Collected from you" },
            { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Countries" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "24/7", sub: "Expert support" },
          ]}
        >
          <p>
            Airline baggage allowances are tight, and the fees for going over them add up fast.
            That&rsquo;s especially true for a second or third bag, or when you&rsquo;re flying with
            everything you own because you&rsquo;re moving. Baggage shipping is often cheaper than
            those fees, and you travel with just a carry-on.
          </p>
          <p>
            We collect your bags or boxes from your home, hotel or university address and deliver
            them to the address you&rsquo;re heading to. You can follow them door to door instead of
            hoping they made the connection.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Who it's for"
              title="Who ships their luggage"
              accent="with us"
              lead="Most people who send bags ahead fall into one of these groups."
            />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <StudentIcon size={22} />,
                title: "Students",
                body: "Heading to or from university with more than a term's worth of clothes, books and bedding, especially overseas.",
              },
              {
                icon: <HouseLineIcon size={22} />,
                title: "People relocating",
                body: (
                  <>
                    When you fly to a new country to live, excess baggage on the things you need can rival the fare. Moving a whole home? See{" "}
                    <Link href="/services/international-relocation" className="font-medium text-brand underline-offset-4 hover:underline">
                      international relocation
                    </Link>
                    .
                  </>
                ),
              },
              {
                icon: <SuitcaseRollingIcon size={22} />,
                title: "Long stays",
                body: "Sabbaticals, seasonal moves and extended trips where one suitcase won't cover it.",
              },
              {
                icon: <GolfIcon size={22} />,
                title: "Sports and specialist gear",
                body: "Golf clubs, skis, bikes and instruments. Airlines charge oversize fees for them and don't always handle them gently.",
              },
              {
                icon: <BabyIcon size={22} />,
                title: "Families",
                body: "Strollers, car seats and a suitcase each add up to more bags than hands. Send the bulk ahead and board light.",
              },
              {
                icon: <HourglassIcon size={22} />,
                title: "Anyone who hates the wait",
                body: "No bag drop line, no carousel, no lost luggage desk at the other end.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="How baggage shipping works" lead="You pack. We take it from your front door." />
          </div>
          <Steps
            steps={[
              {
                title: "Get a quote",
                body: "Tell us where your bags are going and roughly what they weigh.",
              },
              {
                title: "We book the pickup",
                body: "A driver collects from your address at an agreed time. You don't need to go anywhere.",
              },
              {
                title: "Track it",
                body: (
                  <>
                    You get a reference number to follow on our{" "}
                    <Link href="/tracking" className="font-medium text-brand underline-offset-4 hover:underline">
                      tracking page
                    </Link>
                    .
                  </>
                ),
              },
              {
                title: "It arrives",
                body: "Delivered to your destination address, wherever you're staying.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "timing",
              title: "Send it early",
              content: (
                <Prose>
                  <p>
                    Baggage shipping isn&rsquo;t same day. Give your bags enough time to arrive before
                    you do, or soon after. International shipments also clear customs on arrival, which
                    can add time that nobody controls.
                  </p>
                  <p>Your quote includes an estimated transit time, so you can plan the pickup date around your flight.</p>
                </Prose>
              ),
            },
            {
              id: "packing",
              title: "Pack it like freight",
              content: (
                <Prose>
                  <p>
                    Pack as if your bag is freight, not as if it&rsquo;s going in the hold. A hard case
                    or a well-taped box survives the trip better than a soft duffel.
                  </p>
                  <p>
                    Bags going overseas pass through more hands than checked luggage does. Fill empty
                    space so nothing shifts, and put a copy of your contact details inside.
                  </p>
                </Prose>
              ),
            },
            {
              id: "declaring",
              title: "Declare what's inside",
              content: (
                <Prose>
                  <p>
                    A bag crossing a border is an import like any other shipment, so list the contents
                    accurately. The same{" "}
                    <Link href="/resources/prohibited-items">prohibited item rules</Link> apply.
                  </p>
                  <p>
                    Keep passports, cash, medication and anything irreplaceable in your carry-on. Those
                    should travel with you.
                  </p>
                </Prose>
              ),
            },
            {
              id: "pricing",
              title: "How the price works",
              content: (
                <Prose>
                  <p>
                    You pay on chargeable weight. A big but light bag is billed on the space it takes up,
                    not just what it weighs. Here&rsquo;s{" "}
                    <Link href="/resources/volumetric-weight">how volumetric weight works</Link>.
                  </p>
                  <p>Packing into a snug case or box, rather than an oversized one, usually keeps the cost down.</p>
                </Prose>
              ),
            },
          ]}
        />

        <ServiceFaq
          title="Baggage shipping questions"
          faqs={[
            {
              q: "Is it cheaper to ship luggage than to check it?",
              a: "Often, yes, especially for a second or third bag, an oversized item, or when you're moving with everything you own. It depends on the weight, size and destination, so get a quote and compare it with your airline's excess baggage fees.",
            },
            {
              q: "How far ahead should I ship my luggage?",
              a: "Earlier than you think. Shipping isn't same day, and international bags clear customs on arrival. Your quote includes an estimated transit time so you can pick a pickup date that works with your flight.",
            },
            {
              q: "Can I ship luggage internationally?",
              a: "Yes. We ship bags and boxes from the US to more than 200 countries, collected from your door and tracked to the delivery address.",
            },
            {
              q: "Can you pick up from a hotel or a dorm?",
              a: "Yes. We can collect from a home, hotel or university address. Just give us the details and a time that works.",
            },
            {
              q: "What can't I pack in shipped luggage?",
              a: "The usual prohibited item rules apply, the same as any shipment. Keep passports, cash, medication and anything irreplaceable with you in your carry-on.",
            },
            {
              q: "How is luggage shipping priced?",
              a: "On chargeable weight, which is the greater of the actual weight and the volumetric weight. A large, light bag is billed on the space it takes up.",
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
                icon: <PackageIcon size={22} />,
                title: "Parcel shipping",
                body: "Sending boxes rather than suitcases? Discounted FedEx, DHL, UPS and USPS rates to 200+ countries.",
                href: "/services/parcel-shipping",
              },
              {
                icon: <HouseLineIcon size={22} />,
                title: "International relocation",
                body: "Moving your whole household abroad, packed and delivered door to door.",
                href: "/services/international-relocation",
              },
              {
                icon: <BookOpenTextIcon size={22} />,
                title: "Customs duty guide",
                body: "When shipped belongings get taxed at the border, and how to keep it simple.",
                href: "/resources/customs-duty",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Shipping to India",
                body: "Sending bags home to India from the US: what to know before you pack.",
                href: "/destinations/india",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Shipping to the UK",
                body: "Luggage and boxes from the US to the UK, collected from your door.",
                href: "/destinations/uk",
              },
              {
                icon: <GlobeHemisphereWestIcon size={22} />,
                title: "All destinations",
                body: "Shipping from the US to 200+ countries. Pick yours to start a quote or read a country guide.",
                href: "/destinations",
              },
            ]}
          />
        </Section>

        <TrustedReviewsSection />
        <CtaBand title="Traveling soon?" accent="Get a baggage quote." />
      </PageBody>
    </>
  );
}
