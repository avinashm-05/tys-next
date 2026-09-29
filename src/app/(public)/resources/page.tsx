import type { Metadata } from "next";
import Link from "next/link";
import {
  CalculatorIcon,
  CurrencyDollarIcon,
  GlobeHemisphereWestIcon,
  HouseLineIcon,
  LaptopIcon,
  ProhibitIcon,
  QuestionIcon,
  ReceiptIcon,
  ScalesIcon,
} from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { CardGrid, Checklist, CtaBand, PAD, PageBody, Rail, SectionHead, SplitSection } from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Shipping Guides and Resources | TYS Global Logistics",
  description:
    "Plain-English international shipping guides: volumetric weight, customs duty, prohibited items and shipping rates, so you know what to expect before you book.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ]}
      />
      <PageHeroBand
        title="International shipping guides"
        accent="in plain English"
        subtitle="Short, practical guides to the things that change what you pay and how smoothly your shipment clears customs."
      />

      <PageBody>
        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead
                kicker="Guides"
                title="Start with"
                accent="the basics"
                lead="Most surprises in international shipping come from three things: how the box is weighed, what customs charges, and what isn't allowed in. Each guide takes a few minutes to read."
              />
            </div>
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: <ScalesIcon size={22} />,
                  title: "Volumetric weight",
                  body: "How dimensional weight is calculated, why a big light box can cost more than a small heavy one, and a calculator to check yours.",
                  href: "/resources/volumetric-weight",
                },
                {
                  icon: <ReceiptIcon size={22} />,
                  title: "Customs duty",
                  body: "What customs duty is, who pays it, what decides the amount, and how to avoid delays at the border.",
                  href: "/resources/customs-duty",
                },
                {
                  icon: <ProhibitIcon size={22} />,
                  title: "Prohibited items",
                  body: "What carriers and customs won't accept, what needs extra paperwork, and what to do if you're not sure.",
                  href: "/resources/prohibited-items",
                },
                {
                  icon: <CalculatorIcon size={22} />,
                  title: "Shipping calculator",
                  body: "Add your boxes and see the chargeable weight carriers bill on.",
                  href: "/shipping-calculator",
                },
                {
                  icon: <CurrencyDollarIcon size={22} />,
                  title: "USA to India shipping cost",
                  body: "What sets the price of a shipment to India, and how to pay less.",
                  href: "/destinations/india/shipping-cost",
                },
                {
                  icon: <LaptopIcon size={22} />,
                  title: "Electronics to India",
                  body: "Laptops, phones and TVs: battery rules, BIS and customs duty.",
                  href: "/destinations/india/electronics",
                },
              ]}
            />
          </Rail>
        </section>

        <SplitSection
          title="Before you book,"
          accent="check these"
          lead="A quick list that saves most people a delay, a surcharge or a phone call from customs."
        >
          <Checklist
            items={[
              <>
                Measure the box as well as weighing it. You pay for the greater of the two, see{" "}
                <Link href="/resources/volumetric-weight" className="font-medium text-brand hover:underline">
                  volumetric weight
                </Link>
                .
              </>,
              <>
                List every item with a real value. Vague descriptions like &ldquo;gift&rdquo; are a
                common cause of customs holds.
              </>,
              <>
                Make sure nothing in the box is restricted, see{" "}
                <Link href="/resources/prohibited-items" className="font-medium text-brand hover:underline">
                  prohibited items
                </Link>
                .
              </>,
              <>
                Agree with the recipient who pays any duty and import tax, see{" "}
                <Link href="/resources/customs-duty" className="font-medium text-brand hover:underline">
                  customs duty
                </Link>
                .
              </>,
              <>Give a phone number for the recipient, so customs or the carrier can reach them.</>,
            ]}
          />
        </SplitSection>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead kicker="More help" title="Rates, routes and" accent="moving abroad" />
            </div>
            <CardGrid
              columns={4}
              cards={[
                {
                  icon: <CurrencyDollarIcon size={22} />,
                  title: "Shipping rates",
                  body: "How we price a shipment and what you can do to pay less.",
                  href: "/shipping-rates",
                },
                {
                  icon: <GlobeHemisphereWestIcon size={22} />,
                  title: "Destinations",
                  body: "Country guides for Canada, India and the UK, plus 200+ countries to quote.",
                  href: "/destinations",
                },
                {
                  icon: <HouseLineIcon size={22} />,
                  title: "Relocation process",
                  body: "What to expect, step by step, when you move abroad with us.",
                  href: "/services/international-relocation",
                },
                {
                  icon: <QuestionIcon size={22} />,
                  title: "FAQs",
                  body: "Quick answers to the questions we hear most often.",
                  href: "/faqs",
                },
              ]}
            />
          </Rail>
        </section>

        <TrustedReviewsSection />
        <CtaBand
          title="Still have a question?"
          accent="Ask a real person."
          lead="Call us or start a quote and tell us what you are sending. We reply, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
