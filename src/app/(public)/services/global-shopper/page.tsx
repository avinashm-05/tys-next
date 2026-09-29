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
  EnvelopeIcon,
  EnvelopeSimpleIcon,
  HeadsetIcon,
  PackageIcon,
  SuitcaseRollingIcon,
  TruckIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "Free US Address & Package Forwarding | TYS Global Logistics",
  description:
    "Get a free US shipping address, shop American stores, and we'll combine your orders into one box and ship it to 200+ countries. No credit card needed.",
  path: "/services/global-shopper",
});

export default function GlobalShopperPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Global Shopper", path: "/services/global-shopper" },
        ]}
      />
      <ServiceJsonLd
        name="Global Shopper"
        description="Shop US stores with a free US address and ship your purchases anywhere in the world."
        slug="global-shopper"
      />
      <PageHeroBand
        title="Shop US stores with a free"
        accent="US shipping address."
        subtitle="Order from the American brands you love, ship everything to your US address, and we'll forward it to your door in one box."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Global shopper"
          heading="Your own address in the US, free"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Free", sub: "US address" },
            { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Countries" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "24/7", sub: "Expert support" },
          ]}
        >
          <p>
            Plenty of US stores won&rsquo;t ship abroad, or charge a lot when they do. With a free US
            shipping address from TYS Global Logistics, you check out like a local. Order from as many
            stores as you like and we hold every package at your address until you&rsquo;re ready.
          </p>
          <p>
            Then we pack it all into one shipment and send it on to any of{" "}
            <Link href="/destinations" className={LINK}>
              200+ countries
            </Link>
            , including{" "}
            <Link href="/destinations/india" className={LINK}>
              India
            </Link>
            ,{" "}
            <Link href="/destinations/canada" className={LINK}>
              Canada
            </Link>{" "}
            and the{" "}
            <Link href="/destinations/uk" className={LINK}>
              UK
            </Link>
            . One box instead of five is one of the simplest ways to cut the cost of international
            shipping.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="How it works" title="From checkout" accent="to your door." />
          </div>
          <Steps
            steps={[
              { title: "Get your US address", body: "Give us a call and we'll set up your free US shipping address with you, ready to use at checkout." },
              { title: "Shop US stores", body: "Order from any store you like and send it to your new address." },
              { title: "We hold and combine", body: "Your packages wait with us until you're ready, then go into one shipment." },
              { title: "We ship it to you", body: "We pack it, ship it and track it all the way to your door." },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What you get"
              title="More than a"
              accent="forwarding address."
              lead="The address is the start. Here's what comes with it."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <TruckIcon size={22} />,
                title: "Express shipping",
                body: "Faster delivery, with tracking and insurance options for peace of mind.",
              },
              {
                icon: <EnvelopeIcon size={22} />,
                title: "Mail forwarding",
                body: "We hold your mail and packages as they arrive, then ship them together.",
              },
              {
                icon: <HeadsetIcon size={22} />,
                title: "Shipping advisors",
                body: "Real people who help you combine orders and keep the shipping bill low.",
              },
              {
                icon: <UserIcon size={22} />,
                title: "Personal shoppers",
                body: "Optional help placing orders, comparing items and keeping track of purchases.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "personal-shoppers",
              title: "What a personal shopper can do",
              lead: "An optional extra, for a small added cost, when you'd rather hand the shopping to someone else.",
              content: (
                <Checklist
                  items={[
                    "Place the orders on your shopping list for you",
                    "Find the right item and compare prices across stores",
                    "Look out for deals and promotions that save you money",
                    "Deal with stores about stock, cancellations and returns",
                  ]}
                />
              ),
            },
            {
              id: "save-on-shipping",
              title: "How to pay less for shipping",
              content: (
                <Prose>
                  <p>
                    <strong>Combine your orders.</strong> Wait until a few packages have arrived and ship
                    them together. You pay for one shipment instead of several.
                  </p>
                  <p>
                    <strong>Mind the size.</strong> International shipping is priced on box size as
                    well as weight (<Link href="/resources/volumetric-weight">volumetric weight</Link>
                    ), so light but bulky items can cost more than you&rsquo;d expect.
                  </p>
                  <p>
                    <strong>Choose the speed you need.</strong> Express is quick. If you can wait a
                    little longer, a slower service usually costs less.
                  </p>
                </Prose>
              ),
            },
            {
              id: "what-you-can-ship",
              title: "What you can ship",
              content: (
                <Prose>
                  <p>
                    Most everyday shopping ships without any trouble: clothes, shoes, electronics,
                    books, beauty and home goods. Each country has its own rules, though, and some
                    items such as batteries, liquids and supplements can be restricted. Check our{" "}
                    <Link href="/resources/prohibited-items">prohibited items guide</Link>, and the{" "}
                    <Link href="/resources/customs-duty">customs duty guide</Link> for what you may
                    pay when your box arrives.
                  </p>
                  <p>
                    If you&rsquo;re not sure, ask before you order. Call us on{" "}
                    <a href="tel:+14047938759">+1 (404) 793-8759</a>.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related services" title="Sending more" accent="than shopping?" />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <PackageIcon size={22} />,
                title: "Parcel shipping",
                body: "Send a parcel of any size from the US to 200+ countries at discounted rates.",
                href: "/services/parcel-shipping",
              },
              {
                icon: <SuitcaseRollingIcon size={22} />,
                title: "Baggage shipping",
                body: "Ship suitcases and boxes ahead of your trip instead of paying excess baggage fees.",
                href: "/services/baggage-shipping",
              },
              {
                icon: <EnvelopeSimpleIcon size={22} />,
                title: "Document shipping",
                body: "Passports, contracts and certificates, sent with tracking all the way.",
                href: "/services/document-shipping",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Global shopper questions"
          faqs={[
            {
              q: "How do I get my US address, and does it cost anything?",
              a: "Call us on +1 (404) 793-8759 and we'll set it up with you. The address is free, there's no credit card needed, and no minimum amount you have to ship.",
            },
            {
              q: "Can I combine orders from multiple stores into one shipment?",
              a: "Yes, that's the heart of Global Shopper. We hold your packages as they arrive and put them into one shipment when you're ready.",
            },
            {
              q: "Do you offer personal shopping assistance?",
              a: "Yes. For a small extra cost, a personal shopper can place orders for you, compare items and handle communication with stores.",
            },
            {
              q: "Can I track my consolidated shipment?",
              a: "Yes. Every shipment has tracking from pickup to delivery.",
            },
            {
              q: "Which countries can I ship to?",
              a: "We ship from the US to more than 200 countries.",
            },
            {
              q: "Is my package insured?",
              a: "Insurance options are available for extra protection. Ask about them when you're ready to ship.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand title="Ready to ship your order?" />
      </PageBody>
    </>
  );
}
