import type { Metadata } from "next";
import Link from "next/link";
import {
  CurrencyDollarIcon,
  FactoryIcon,
  GlobeHemisphereWestIcon,
  ProhibitIcon,
  ScalesIcon,
  TagIcon,
} from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceFaq } from "@/components/public/service-page-sections";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import type { Faq } from "@/lib/default-faqs";
import {
  CardGrid,
  Checklist,
  CtaBand,
  PAD,
  PageBody,
  Prose,
  Rail,
  SectionHead,
  SplitSection,
  Steps,
} from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Customs Duty Guide for Shipping | TYS Global Logistics",
  description:
    "A plain guide to customs duty on international shipments from the US: what it is, who pays it, what decides the amount and how to avoid delays at customs.",
  path: "/resources/customs-duty",
});

// General and accurate only: no rates or thresholds, because every country
// sets its own and they change.
const FAQS: Faq[] = [
  {
    q: "Do I have to pay customs duty when I ship internationally?",
    a: "Often, but not always. It depends on the destination country, what you are sending and its value. Many countries set a value below which no duty is charged, and those limits vary. Import taxes such as VAT or GST can still apply even when no duty is due.",
  },
  {
    q: "Who pays customs duty, the sender or the recipient?",
    a: "Usually the recipient, when the shipment arrives. On some services the sender can arrange to pay duty and taxes in advance so the recipient has nothing to pay. Ask us whether that is possible for your shipment.",
  },
  {
    q: "Are gifts exempt from customs duty?",
    a: "Some countries give an allowance for genuine gifts between individuals, but the rules and limits differ by country. A gift still has to be declared with an honest description and value.",
  },
  {
    q: "Does TYS Global Logistics charge customs duty?",
    a: "No. Duty and import taxes are set and collected by the destination country's customs authority, separately from your shipping cost. Some carriers add a handling fee when they pay duty on the recipient's behalf.",
  },
  {
    q: "Can I find out the duty before I ship?",
    a: "We can tell you what to expect for your route and the type of goods. The exact amount is decided by customs when the shipment arrives, based on the declaration.",
  },
];

export default function CustomsDutyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Customs Duty Guide", path: "/resources/customs-duty" },
        ]}
      />
      <PageHeroBand
        title="Customs duty,"
        accent="explained"
        subtitle="What customs duty is, who pays it, and what decides the amount when you ship from the US to another country."
      />

      <PageBody>
        <SplitSection kicker="The basics" title="What customs duty is">
          <Prose>
            <p>
              Customs duty is a tax a country charges on goods coming across its border. Most
              international shipments are assessed for it when they arrive, and the amount follows
              the destination country&rsquo;s own rules.
            </p>
            <p>
              That means duty isn&rsquo;t set by the carrier or by us. We can&rsquo;t raise it or
              waive it. What we can do is help you declare the shipment properly, so it is assessed
              correctly and clears without a hold.
            </p>
          </Prose>
        </SplitSection>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead
                title="What decides"
                accent="how much you pay"
                lead="Four things, and every country weighs them its own way."
              />
            </div>
            <CardGrid
              columns={4}
              cards={[
                {
                  icon: <CurrencyDollarIcon size={22} />,
                  title: "Declared value",
                  body: "Duty is usually a percentage of what the goods are worth, so the value on the declaration matters most.",
                },
                {
                  icon: <TagIcon size={22} />,
                  title: "What the item is",
                  body: "Clothing, electronics, food and gifts can each be taxed at different rates.",
                },
                {
                  icon: <GlobeHemisphereWestIcon size={22} />,
                  title: "Where it's going",
                  body: "Each country sets its own duty rates and the value below which nothing is charged.",
                },
                {
                  icon: <FactoryIcon size={22} />,
                  title: "Where it was made",
                  body: "Trade agreements can reduce or remove duty on goods from certain countries of origin.",
                },
              ]}
            />
          </Rail>
        </section>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead kicker="Clearance" title="How customs clearance" accent="usually works" />
            </div>
            <Steps
              steps={[
                {
                  title: "You declare it",
                  body: "The shipment travels with a declaration listing what is inside and what it is worth.",
                },
                {
                  title: "Customs reviews it",
                  body: "On arrival, customs checks the declaration and may inspect the goods.",
                },
                {
                  title: "Duty and tax are assessed",
                  body: "Any duty and import tax is worked out and billed, usually to the recipient.",
                },
                {
                  title: "It is released",
                  body: "Once charges are paid, the shipment goes out for delivery.",
                },
              ]}
            />
          </Rail>
        </section>

        <TopicScroller
          topics={[
            {
              id: "who-pays",
              title: "Who pays customs duty",
              content: (
                <Prose>
                  <p>
                    In most cases the recipient pays duty and any import tax when the shipment
                    arrives. That is separate from the shipping cost you pay when you book. Some
                    countries require payment before the shipment is released for delivery.
                  </p>
                  <p>
                    On some services the sender can pay duty and taxes in advance, so the recipient
                    has nothing to pay at the door. That is handy for gifts and for customers who
                    don&rsquo;t expect a bill. Ask us whether it is possible on your route.
                  </p>
                  <p>
                    If charges go unpaid, the shipment can be held, returned or abandoned, and the
                    cost can come back to the sender. It is worth agreeing who pays before you ship.
                  </p>
                </Prose>
              ),
            },
            {
              id: "import-taxes",
              title: "Duty is not the only charge",
              content: (
                <Prose>
                  <p>
                    Many countries also charge an import tax, such as VAT or GST, on top of any
                    duty. In many places it is worked out on the value of the goods plus shipping
                    and duty, so it can be the larger of the two.
                  </p>
                  <p>
                    Some countries charge no duty below a certain value but still charge import tax.
                    Those limits vary by country and change from time to time, so we don&rsquo;t
                    publish them here. Tell us where you are shipping and we will tell you what to
                    expect.
                  </p>
                </Prose>
              ),
            },
            {
              id: "avoid-delays",
              title: "How to avoid customs delays",
              content: (
                <Checklist
                  items={[
                    "Declare the real value. Under-declaring can lead to holds, fines or a returned shipment.",
                    "Describe each item clearly, for example “men's cotton shirts” rather than “clothes”.",
                    "Give full sender and recipient details, including a phone number for the recipient.",
                    <>
                      Check your items against the{" "}
                      <Link href="/resources/prohibited-items" className="font-medium text-brand hover:underline">
                        prohibited items guide
                      </Link>{" "}
                      and your destination&rsquo;s rules.
                    </>,
                    "Tell us if it is a move or a gift. Used personal effects and gifts are often treated differently.",
                  ]}
                />
              ),
            },
          ]}
        />

        <ServiceFaq title="Customs duty questions" faqs={FAQS} />

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead title="Related" accent="guides" />
            </div>
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: <ScalesIcon size={22} />,
                  title: "Volumetric weight",
                  body: "Why the size of the box can matter more than its weight.",
                  href: "/resources/volumetric-weight",
                },
                {
                  icon: <ProhibitIcon size={22} />,
                  title: "Prohibited items",
                  body: "What can't be shipped, and what needs extra paperwork.",
                  href: "/resources/prohibited-items",
                },
                {
                  icon: <CurrencyDollarIcon size={22} />,
                  title: "Shipping rates",
                  body: "How we price your shipment, separately from duty and tax.",
                  href: "/shipping-rates",
                },
              ]}
            />
          </Rail>
        </section>

        <TrustedReviewsSection />
        <CtaBand
          title="Not sure what customs will charge?"
          accent="Ask us."
          lead="Tell us what you are sending and where. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
