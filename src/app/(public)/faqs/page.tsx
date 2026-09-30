import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { FaqJsonLd } from "@/components/public/faq-json-ld";
import { DEFAULT_FAQS, type Faq } from "@/lib/default-faqs";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { TopicScroller } from "@/components/public/topic-scroller";
import { ContactDetails } from "@/app/(public)/contact-us/contact-details";
import { CtaBand, PAD, PageBody, Section, SectionHead } from "@/components/public/page-kit";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Shipping and Moving FAQs, Answered | TYS Global Logistics",
  description:
    "Answers to common questions about shipping and moving with TYS Global Logistics: quotes, prices, carriers, car shipping, tracking, customs and payment.",
  path: "/faqs",
});

// FAQ page, 2026-09-29 renovation. The five DEFAULT_FAQS (shared with the
// home page teaser) are kept word for word; the rest are answered only with
// facts already published on the site (contact, pay, tracking, locations,
// carriers and "is TYS legit" pages). The FAQPage JSON-LD lists every
// question on this page and is emitted here only, never on the home page.
const fromDefaults = (...qs: string[]): Faq[] => DEFAULT_FAQS.filter((f) => qs.includes(f.q));

type Group = { id: string; title: string; lead: string; faqs: Faq[]; related?: ReactNode };

const GROUPS: Group[] = [
  {
    id: "quotes-and-pricing",
    title: "Quotes and pricing",
    lead: "How to get a price, what affects it, and how to pay.",
    faqs: [
      ...fromDefaults("How do I get a quote?"),
      {
        q: "How long does a quote take?",
        a: "The quote form takes about 30 seconds to fill in. A real person then replies with a price, usually within 24 hours.",
      },
      {
        q: "How much can I save compared with going to the carrier?",
        a: "Up to 70% on the carrier's retail counter price. The exact saving depends on the carrier, the destination and the size of your shipment.",
      },
      {
        q: "Why does the size of my box affect the price?",
        a: "Carriers charge for the space a parcel takes up as well as its weight. For most parcels you pay for whichever is greater: the actual weight or the volumetric weight, which is worked out from the box's dimensions.",
      },
      {
        q: "How do I pay?",
        a: "You can pay online in a few clicks through our payment page. We accept all major credit cards, Zelle and ACH payments.",
      },
    ],
    related: (
      <>
        <Link href="/shipping-rates">Shipping rates</Link>
        <Link href="/resources/volumetric-weight">Volumetric weight explained</Link>
        <Link href="/contact-us/pay">Make a payment</Link>
      </>
    ),
  },
  {
    id: "shipping-and-carriers",
    title: "Shipping and carriers",
    lead: "Who carries your shipment, where it can go, and what can't be sent.",
    faqs: [
      {
        q: "Which carriers do you use?",
        a: "We book FedEx, DHL, UPS and USPS, plus air, ocean and ground partners for larger loads. We aren't tied to one carrier, so we pick the best fit for speed, cost and reliability.",
      },
      {
        q: "Where can you ship to?",
        a: "More than 200 countries, from anywhere in the United States. Transit times and customs rules vary by destination.",
      },
      ...fromDefaults("Can I send documents only?"),
      {
        q: "Do I have to drop my shipment off?",
        a: "No. We arrange collection from homes and businesses in all 50 states. If you're in Atlanta and would rather hand it over in person, call ahead and we'll set a time.",
      },
      {
        q: "Is there anything you can't ship?",
        a: "Yes. Some items are restricted or banned by the carriers or by the destination country. Our prohibited items guide lists the common ones. If you're unsure about something, ask us before you book.",
      },
    ],
    related: (
      <>
        <Link href="/carriers">Major carriers</Link>
        <Link href="/resources/prohibited-items">Prohibited items</Link>
        <Link href="/services/parcel-shipping">Parcel shipping</Link>
        <Link href="/services/document-shipping">Document shipping</Link>
      </>
    ),
  },
  {
    id: "moving-and-vehicles",
    title: "Moving and vehicles",
    lead: "Household moves, packing and car shipping.",
    faqs: [
      {
        q: "Do you handle international moves?",
        a: "Yes. We plan household moves door to door, both within the US and to other countries.",
      },
      ...fromDefaults("What if I need packing help?", "Do you ship cars?"),
    ],
    related: (
      <>
        <Link href="/services/international-relocation">International relocation</Link>
        <Link href="/services/domestic-moving">Domestic moving</Link>
        <Link href="/services/auto-transport">Auto transport</Link>
      </>
    ),
  },
  {
    id: "tracking-and-customs",
    title: "Tracking and customs",
    lead: "Following your shipment, and what happens at the border.",
    faqs: [
      ...fromDefaults("Can I track my shipment?"),
      {
        q: "Why hasn't my tracking updated?",
        a: "The first carrier scan can take up to 24 hours after collection. After that, quiet spells are normal, especially while a shipment is between countries or waiting on customs. If nothing has moved for longer than you'd expect, contact us and we'll chase it with the carrier.",
      },
      {
        q: "Will I have to pay customs duty?",
        a: "It depends on the destination and what you're sending. Duty and tax are charged by the destination country's customs authority. We'll tell you in advance if your shipment is likely to attract them.",
      },
      {
        q: "I got a message asking me to pay a customs fee. Is it real?",
        a: "Be careful. A surprise message demanding a small customs fee by card is a common scam. If it's about a TYS shipment, call us on +1 (404) 793-8759 before you pay anything.",
      },
    ],
    related: (
      <>
        <Link href="/tracking">Track a shipment</Link>
        <Link href="/resources/customs-duty">Customs duty explained</Link>
      </>
    ),
  },
  {
    id: "about-tys",
    title: "About TYS",
    lead: "Who we are and how to reach us.",
    faqs: [
      {
        q: "Where are you based?",
        a: "Our office is at 6111 Morgan Pl Ct NE, Atlanta, GA 30324. We ship from anywhere in the US, so most customers never need to visit.",
      },
      {
        q: "Is TYS Global Logistics legit?",
        a: "Yes. We're a registered US logistics company based in Atlanta, Georgia, rated 4.5 on Google. You can call us before you book, and our terms and privacy policy are published in full.",
      },
      {
        q: "How do I reach a real person?",
        a: "Call +1 (404) 793-8759 or email sales@tysgloballogistics.com.",
      },
    ],
    related: (
      <>
        <Link href="/about-us">About us</Link>
        <Link href="/contact-us">Contact us</Link>
      </>
    ),
  },
];

const ALL_FAQS: Faq[] = GROUPS.flatMap((g) => g.faqs);

export default function FaqsPage() {
  return (
    <>
      <FaqJsonLd faqs={ALL_FAQS} />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "FAQs", path: "/faqs" },
        ]}
      />
      <PageHeroBand quote={false}
        title="Frequently asked"
        accent="questions"
        subtitle="Straight answers about quotes, shipping, moving, tracking and customs. If yours isn't here, call us and talk to a person."
      />

      <PageBody>
        <TopicScroller
          topics={GROUPS.map((g) => ({
            id: g.id,
            title: g.title,
            lead: g.lead,
            content: (
              <>
                <FaqAccordion faqs={g.faqs} />
                {g.related && (
                  <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14.5px] text-ink-muted [&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline">
                    <span>Related:</span>
                    {g.related}
                  </p>
                )}
              </>
            ),
          }))}
        />

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead
              kicker="Still stuck?"
              title="Ask us"
              accent="directly."
              lead="Call or email and a real person will help."
            />
          </div>
          <div className="-mb-px">
            <ContactDetails />
          </div>
        </Section>

        <TrustedReviewsSection />
        <CtaBand />
      </PageBody>
    </>
  );
}
