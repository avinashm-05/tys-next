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
  BookOpenTextIcon,
  CarSimpleIcon,
  HouseLineIcon,
  MotorcycleIcon,
  ShieldCheckIcon,
  ShippingContainerIcon,
  SteeringWheelIcon,
  TruckIcon,
  VanIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Car Shipping & Auto Transport | TYS Global Logistics",
  description:
    "Ship your car, SUV or motorcycle anywhere in the US on an open or enclosed carrier. Door to door, inspected at both ends, with updates all the way.",
  path: "/services/auto-transport",
});

// Renovated 2026-09-29 onto the page kit. Transit times were removed from
// the FAQ (they weren't sourced); the quote gives the estimate instead.
export default function AutoTransportPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Auto Transport", path: "/services/auto-transport" },
        ]}
      />
      <ServiceJsonLd name="Auto Transport" description="Nationwide auto transport for cars, motorcycles, and fleet vehicles." slug="auto-transport" />
      <PageHeroBand
        title="Car shipping and auto transport"
        accent="across the US."
        subtitle="Cars, SUVs, motorcycles and vans, collected from your door and delivered on an open or enclosed carrier. Inspected at both ends, with updates in between."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Auto transport"
          heading="Auto transport you can follow from pickup to delivery"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "Pickup and delivery" },
            { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Vetted", sub: "Carriers" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "24/7", sub: "Expert support" },
          ]}
        >
          <p>
            Our auto transport service moves cars, SUVs, motorcycles and vans between any two
            addresses in the United States. We book the carrier, arrange the pickup and keep you
            posted until the keys are back in your hand.
          </p>
          <p>
            Moving house as well? We can line up your car with your{" "}
            <Link href="/services/domestic-moving" className="font-medium text-brand underline-offset-4 hover:underline">
              household move
            </Link>{" "}
            so both arrive on one plan.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Two ways to ship"
              title="Open or enclosed car shipping?"
              lead="Both get your car there. The difference is how exposed it is on the way, and what you pay for that."
            />
          </div>
          <CardGrid
            columns={2}
            cards={[
              {
                icon: <TruckIcon size={22} />,
                title: "Open carrier",
                body: "The multi-car trailers you see on the highway. It's the most affordable way to ship and suits most everyday cars. Your car rides in the open, much as it would on a road trip.",
              },
              {
                icon: <ShieldCheckIcon size={22} />,
                title: "Enclosed trailer",
                body: "A covered trailer that keeps out rain, sun and road grit. It costs more, and it's the usual choice for luxury, classic and freshly restored cars.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="How auto transport works" lead="Four steps. We handle the booking and the updates in between." />
          </div>
          <Steps
            steps={[
              {
                title: "Get a quote",
                body: "Tell us the pickup and delivery addresses and what you drive. You get a clear price and an estimated timeline.",
              },
              {
                title: "Pickup and inspection",
                body: "The driver checks your car with you and notes its condition before it's loaded.",
              },
              {
                title: "On the road",
                body: "Your car travels with a vetted, insured carrier, and we keep you posted along the way.",
              },
              {
                title: "Delivery and handover",
                body: "The car is checked against the pickup notes before you sign and take the keys.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="Vehicles we ship" accent="door to door." />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <CarSimpleIcon size={22} />,
                title: "Cars, SUVs and pickups",
                body: "The everyday vehicles we move most. They fit on open carriers and in most enclosed trailers.",
              },
              {
                icon: <SteeringWheelIcon size={22} />,
                title: "Luxury and classic cars",
                body: "Loaded with care, strapped at the right points, and usually sent enclosed.",
              },
              {
                icon: <MotorcycleIcon size={22} />,
                title: "Motorcycles",
                body: "Secured upright with proper tie-downs so they travel steady from pickup to delivery.",
              },
              {
                icon: <VanIcon size={22} />,
                title: "Vans and oversized vehicles",
                body: "We check height, length and weight first, then confirm the right equipment before booking.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "paperwork",
              title: "Paperwork to have ready",
              lead: "Nothing complicated, but keep it to hand before pickup day.",
              content: (
                <Checklist
                  items={[
                    "The vehicle's registration and title, or other proof you're allowed to ship it",
                    "A photo ID for whoever hands over the car",
                    "Contact details for the person receiving it, if that isn't you",
                  ]}
                />
              ),
            },
            {
              id: "car-ready",
              title: "Getting the car ready",
              lead: "A few minutes of prep makes the pickup inspection quicker and more accurate.",
              content: (
                <Checklist
                  items={[
                    "Take out personal belongings and anything loose in the cabin or trunk",
                    "Give it a wash so existing marks are easy to see and note",
                    "Write down the mileage and fuel level",
                    "Take your own photos from every side, for your records",
                  ]}
                />
              ),
            },
            {
              id: "special-cases",
              title: "Special cases",
              content: (
                <Prose>
                  <p>
                    <strong>Cars that don&rsquo;t run.</strong> We can ship them, but tell us when you
                    book. They need a carrier with a winch or lift.
                  </p>
                  <p>
                    <strong>Modified, lifted or lowered cars.</strong> Ground clearance and height change
                    the equipment we send, so share the details up front.
                  </p>
                  <p>
                    <strong>Shipping a car abroad?</strong> That goes as ocean freight, with export
                    paperwork and customs. Our{" "}
                    <Link href="/services/freight-forwarding">freight forwarding</Link> team handles it.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <ServiceFaq
          title="Auto transport questions"
          faqs={[
            {
              q: "How long does auto transport take?",
              a: "It depends on the distance, the route and the carrier's schedule. A trip between neighboring states is quicker than a coast to coast move. Your quote includes an estimated pickup window and transit time, and we keep you updated until delivery.",
            },
            {
              q: "What's the difference between open and enclosed transport?",
              a: "Open carriers are the most affordable option and suit most cars. Enclosed trailers cost more but keep the car out of the weather and away from road debris, which is why people choose them for luxury, classic and high-value vehicles.",
            },
            {
              q: "Can you ship a car that doesn't run?",
              a: "Yes. Tell us when you book, because a non-running car needs a carrier with a winch or lift to load it.",
            },
            {
              q: "Do I need to empty my car before shipping it?",
              a: "Yes. Please remove personal belongings and anything loose before pickup. Car carriers aren't set up to move household items inside a vehicle.",
            },
            {
              q: "What documents do I need to ship my vehicle?",
              a: "Usually the registration and title, or other proof that you're allowed to ship it, plus a photo ID at pickup. We'll tell you if your shipment needs anything else.",
            },
            {
              q: "Can I ship a motorcycle or an oversized vehicle?",
              a: "Yes. Motorcycles are secured upright with proper tie-downs. For vans and oversized vehicles we check height, length and weight before we confirm the booking.",
            },
            {
              q: "Can you ship my car overseas?",
              a: "Yes. International car shipping goes as ocean freight, and our freight forwarding team handles the export paperwork and customs clearance. Call us or request a quote with your destination.",
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
                title: "Domestic moving",
                body: "Moving house too? We pack, load and deliver your household on the same plan as your car.",
                href: "/services/domestic-moving",
              },
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Freight forwarding",
                body: "For cars going overseas: ocean freight, export paperwork and customs clearance.",
                href: "/services/freight-forwarding",
              },
              {
                icon: <BookOpenTextIcon size={22} />,
                title: "Customs duty guide",
                body: "Importing a car abroad? How duty is worked out, and who pays it.",
                href: "/resources/customs-duty",
              },
            ]}
          />
        </Section>

        <TrustedReviewsSection />
        <CtaBand title="Ready to ship your car?" accent="Get a free quote." />
      </PageBody>
    </>
  );
}
