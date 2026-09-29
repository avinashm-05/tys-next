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
  SplitSection,
  Steps,
} from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  BriefcaseIcon,
  FileTextIcon,
  HandshakeIcon,
  PackageIcon,
  StackIcon,
  StorefrontIcon,
} from "@phosphor-icons/react/dist/ssr";

// Small business shipping (new 2026-09-29). The entry point for small
// businesses and online sellers. Retailer shipping covers returns and
// ecommerce operations; volume shipping covers weekly shippers. This page
// sends people to both once they outgrow it. No prices, no percentage
// discounts, no transit promises, no "duties included" claims.

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "Small Business Shipping Rates | TYS Global Logistics",
  description:
    "Discounted FedEx, DHL, UPS and USPS rates for small businesses and online sellers, one contact person, and help with customs forms for international orders.",
  path: "/services/small-business-shipping",
});

export default function SmallBusinessShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Small business shipping", path: "/services/small-business-shipping" },
        ]}
      />
      <ServiceJsonLd
        name="Small Business Shipping"
        description="Discounted FedEx, DHL, UPS and USPS shipping for small businesses and online sellers in the US, for domestic and international parcels, with help on customs documents."
        slug="small-business-shipping"
      />
      <PageHeroBand
        title="Small business shipping,"
        accent="with a real person on your side."
        subtitle="Discounted FedEx, DHL, UPS and USPS rates for small businesses and online sellers, and one contact who helps with every order, here or abroad."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="For small businesses"
          heading="Better shipping rates without the big contract"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "4 carriers", sub: "FedEx, DHL, UPS, USPS" },
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Discounted", sub: "Through our accounts" },
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Paperwork help" },
          ]}
        >
          <p>
            Big companies get good shipping rates because they ship a lot. Many small businesses pay
            full retail rates. We can change that. You ship through our carrier accounts, so you get
            discounted rates without having to promise a big volume.
          </p>
          <p>
            TYS Global Logistics is based in Atlanta, Georgia. We ship for small businesses across
            the US, to customers at home and abroad. You get one person who knows your business, and
            help with the customs forms that make international orders feel hard.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Who it's for"
              title="Made for businesses"
              accent="that ship now and then, or every day."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <StorefrontIcon size={22} />,
                title: "Online sellers",
                body: "Orders from your web store or a marketplace, sent to buyers in the US and overseas.",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Makers and small brands",
                body: "Handmade goods and small product lines that need careful, good-value shipping.",
              },
              {
                icon: <HandshakeIcon size={22} />,
                title: "Business to business",
                body: "Samples, spare parts and orders sent to trade customers and partners abroad.",
              },
              {
                icon: <BriefcaseIcon size={22} />,
                title: "Offices and services",
                body: "Documents and packages for clients, sent with tracking you can share.",
              },
            ]}
          />
        </Section>

        <SplitSection
          kicker="One contact"
          title="One person who"
          accent="knows your account."
          lead="No call centers and no chatbots. You talk to someone who remembers how you ship."
        >
          <Checklist
            items={[
              "One contact for quotes, questions and problems.",
              "We compare FedEx, DHL, UPS and USPS for each shipment and suggest the best fit.",
              "Domestic and international parcels from the same place.",
              "Help with commercial invoices, product descriptions and HS codes.",
              "If a parcel is held up, you call us and we chase it with the carrier.",
              <>
                Reach us on <a href="tel:+14047938759" className={LINK}>+1 (404) 793-8759</a> or{" "}
                <a href="mailto:sales@tysgloballogistics.com" className={LINK}>
                  sales@tysgloballogistics.com
                </a>
                .
              </>,
            ]}
          />
        </SplitSection>

        <TopicScroller
          topics={[
            {
              id: "international-orders",
              title: "Selling to customers abroad",
              lead: "Shipping to a person (B2C) and shipping to a business (B2B) work a little differently.",
              content: (
                <Prose>
                  <p>
                    <strong>Business to customer (B2C).</strong> Your buyer is a person. They care
                    about tracking, a fair delivery cost and no nasty surprise at the door. Being
                    clear about duties matters most here.
                  </p>
                  <p>
                    <strong>Business to business (B2B).</strong> Your buyer is a company. They often
                    need accurate paperwork for their own import records, and may have their own
                    customs broker or import account.
                  </p>
                  <p>
                    Either way, we help you pick a carrier and service that fits the order, and
                    get the paperwork right. See the{" "}
                    <Link href="/destinations">countries we ship to</Link>.
                  </p>
                </Prose>
              ),
            },
            {
              id: "customs-documents",
              title: "Customs documents for business shipments",
              lead: "A business shipment needs a little more paperwork than a gift. Here's what it usually involves.",
              content: (
                <Checklist
                  items={[
                    <>
                      <strong className="font-semibold">Commercial invoice.</strong> A list of what
                      you&rsquo;re selling, how many, the price and who is buying. Customs uses it to
                      work out duties.
                    </>,
                    <>
                      <strong className="font-semibold">Clear product descriptions.</strong>{" "}
                      &ldquo;Women&rsquo;s cotton t-shirt&rdquo;, not &ldquo;apparel&rdquo;. Vague
                      words cause delays.
                    </>,
                    <>
                      <strong className="font-semibold">HS codes.</strong> A number that tells customs
                      what kind of product it is. We help you find the right one.
                    </>,
                    <>
                      <strong className="font-semibold">Country of origin.</strong> Where the goods
                      were made, which can change the duty.
                    </>,
                    <>
                      <strong className="font-semibold">Export filing.</strong> Some higher-value or
                      controlled goods need an export filing. We tell you if yours does.
                    </>,
                  ]}
                />
              ),
            },
            {
              id: "ddp-vs-ddu",
              title: "Duties: DDP or DDU?",
              lead: "Someone has to pay import duty and tax. These two terms say who.",
              content: (
                <Prose>
                  <p>
                    <strong>DDU (delivered duty unpaid)</strong>, now often called DAP, means your
                    customer pays any duties and taxes when the parcel arrives. It&rsquo;s simple for
                    you, but a customer who didn&rsquo;t expect a bill may refuse the parcel.
                  </p>
                  <p>
                    <strong>DDP (delivered duty paid)</strong> means you, the seller, pay the duties
                    and taxes. The parcel is billed back to you, and your customer gets it with
                    nothing extra to pay. Many sellers build that cost into their prices.
                  </p>
                  <p>
                    Which one is right depends on your product, your customers and the country. Our{" "}
                    <Link href="/resources/customs-duty">customs duty guide</Link> explains more, and
                    we&rsquo;re happy to talk it through.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="How to start" title="Getting started" accent="is simple." />
          </div>
          <Steps
            steps={[
              {
                title: "Tell us how you ship",
                body: "What you sell, typical box sizes, and where your customers are. A short call or email is enough.",
              },
              {
                title: "Get your rates",
                body: "We show you discounted rates for the carriers and services that suit you.",
              },
              {
                title: "Ship your orders",
                body: "Ask for a quote for each shipment, or talk to us about a regular setup.",
              },
              {
                title: "Grow with us",
                body: "Shipping more? We look at volume rates and a business account with you.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Where to go next"
              title="Outgrowing"
              accent="the basics?"
              lead="This page is the starting point. As your business grows, these services pick up where it leaves off."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <StorefrontIcon size={22} />,
                title: "Retailer shipping",
                body: "For online stores that need returns, call tags and every order in one account.",
                href: "/services/retailer-shipping",
              },
              {
                icon: <StackIcon size={22} />,
                title: "Volume shipping",
                body: "For businesses that ship every week and want rates that improve with volume.",
                href: "/services/volume-shipping",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Parcel shipping",
                body: "Single parcels to countries around the world with FedEx, DHL, UPS and USPS.",
                href: "/services/parcel-shipping",
              },
              {
                icon: <FileTextIcon size={22} />,
                title: "Document shipping",
                body: "Contracts and paperwork sent overseas, tracked all the way.",
                href: "/services/document-shipping",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Small business shipping questions"
          faqs={[
            {
              q: "How can a small business get cheaper shipping rates?",
              a: "Ship through a broker like TYS. You use our discounted carrier accounts with FedEx, DHL, UPS and USPS, so you can get better rates without shipping in huge volumes yourself.",
            },
            {
              q: "Do I need to ship a lot to work with you?",
              a: "No. We work with small businesses that ship now and then, as well as ones that ship every day. If your volume grows, we can look at volume rates with you.",
            },
            {
              q: "Can you help with international customs paperwork?",
              a: "Yes. We help with commercial invoices, clear product descriptions and HS codes, and we tell you if your goods need an export filing.",
            },
            {
              q: "What is the difference between DDP and DDU?",
              a: "With DDU (also called DAP), your customer pays any import duties and taxes when the parcel arrives. With DDP, you pay them, so your customer has nothing extra to pay at the door.",
            },
            {
              q: "What is an HS code?",
              a: "A Harmonized System code is a number that describes a product for customs, like a category. Customs in the destination country uses it to decide the duty rate. We help you find the right code for your products.",
            },
            {
              q: "Do you ship business orders within the US too?",
              a: "Yes. We ship domestic and international parcels, so you can handle all your orders with one contact.",
            },
            {
              q: "How do I get started?",
              a: "Ask for a free quote online, call +1 (404) 793-8759 or email sales@tysgloballogistics.com. Tell us what you sell and where your customers are, and a real person replies, usually within 24 hours.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Ready to ship smarter?"
          accent="Get a free quote."
          lead="Tell us what you sell and where it goes. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
