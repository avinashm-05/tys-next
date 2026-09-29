import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceIntro, ServiceFaq } from "@/components/public/service-page-sections";
import { CardGrid, Checklist, CtaBand, PAD, PageBody, Prose, Section, SectionHead } from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  AirplaneTiltIcon,
  AnchorIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  StackIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "International Parcel Shipping from the USA | TYS Global Logistics",
  description:
    "Ship parcels from anywhere in the US to 200+ countries with FedEx, DHL, UPS and USPS. Save up to 70% on retail rates, with tracking door to door.",
  path: "/services/parcel-shipping",
});

export default function ParcelShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Parcel Shipping", path: "/services/parcel-shipping" },
        ]}
      />
      <ServiceJsonLd
        name="Parcel Shipping"
        description="International parcel shipping from anywhere in the US to more than 200 countries, with FedEx, DHL, UPS and USPS at discounted rates."
        slug="parcel-shipping"
      />
      <PageHeroBand
        title="Parcel shipping from the US"
        accent="to 200+ countries."
        subtitle="Any size, any destination, with the carriers you already trust. Discounted rates and tracking from pickup to the front door."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Worldwide parcel shipping"
          heading="Send a parcel abroad for less than the counter price"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Up to 70%", sub: "Off retail rates" },
            { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Countries" },
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Paperwork help" },
          ]}
        >
          <p>
            TYS Global Logistics handles international parcel shipping from anywhere in the US to more
            than 200 countries. A care package for family, samples for a client, an order for a
            customer overseas: we book it with FedEx, DHL, UPS or USPS and you can save up to 70% on
            what you&rsquo;d pay at the counter.
          </p>
          <p>
            Every parcel is tracked from pickup to delivery, so you and the person on the other end
            always know where it is. If something needs sorting out, you talk to a real person.
          </p>
          <p>
            Popular routes include{" "}
            <Link href="/destinations/canada" className="font-medium text-brand hover:underline">Canada</Link>,{" "}
            <Link href="/destinations/india" className="font-medium text-brand hover:underline">India</Link> and the{" "}
            <Link href="/destinations/uk" className="font-medium text-brand hover:underline">UK</Link>.{" "}
            <Link href="/destinations" className="font-medium text-brand hover:underline">See every destination</Link>.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Ways to ship"
              title="Pick the speed that fits"
              accent="your budget."
              lead="Three ways to get a parcel there. Tell us what you're sending and we'll say which one makes sense."
            />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <AirplaneTiltIcon size={22} />,
                title: "Air",
                body: "The fastest way to ship a parcel abroad. On some routes it can arrive as soon as the next day.",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Ground",
                body: "The budget choice when you aren't in a hurry, moved through our network of ground carriers.",
              },
              {
                icon: <AnchorIcon size={22} />,
                title: "Ocean",
                body: "The cheapest way to move bigger, heavier shipments. Plan on a few weeks in transit.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "parcel-shipping-tips",
              title: "Ship smarter, spend less",
              lead: (
                <>
                  Parcel prices depend on size as much as weight (here&rsquo;s{" "}
                  <Link href="/resources/volumetric-weight" className="font-medium text-brand hover:underline">
                    how volumetric weight works
                  </Link>
                  ). A few small choices make a real difference.
                </>
              ),
              content: (
                <Checklist
                  items={[
                    "Use a box that fits the item. Empty space adds to the dimensional weight you pay for.",
                    "Air is fastest, ground is cheaper, and ocean costs least for large, heavy loads.",
                    "Insure anything valuable or fragile before it leaves your hands.",
                    "Fill in customs details accurately so your parcel doesn't sit at the border.",
                    "Check what your destination country allows before you pack.",
                  ]}
                />
              ),
            },
            {
              id: "parcel-documents",
              title: "Documents you may need",
              lead: (
                <>
                  Most parcels need only the first three. We&rsquo;ll tell you if yours needs more, and
                  our{" "}
                  <Link href="/resources/customs-duty" className="font-medium text-brand hover:underline">
                    customs duty guide
                  </Link>{" "}
                  explains what the receiver may pay on arrival.
                </>
              ),
              content: (
                <Checklist
                  items={[
                    "Commercial invoice",
                    "Shipping label with tracking",
                    "Packing list",
                    "Certificate of origin, for some destinations",
                    "Export information, for higher-value shipments",
                  ]}
                />
              ),
            },
            {
              id: "parcel-restricted-items",
              title: "Items with restrictions",
              content: (
                <Prose>
                  <p>
                    Every country keeps its own list of prohibited and restricted items, and the lists
                    change. Batteries, liquids, food, medicine and anything high in value are the usual
                    ones to ask about. Our{" "}
                    <Link href="/resources/prohibited-items">prohibited items guide</Link> covers the
                    common ones.
                  </p>
                  <p>
                    Not sure about something? Call us on{" "}
                    <a href="tel:+14047938759">+1 (404) 793-8759</a> before you book and we&rsquo;ll
                    check it for your destination.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related services" title="Sending something" accent="else?" />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <EnvelopeIcon size={22} />,
                title: "Document shipping",
                body: "Passports, contracts and certificates, sent with tracking all the way.",
                href: "/services/document-shipping",
              },
              {
                icon: <StackIcon size={22} />,
                title: "Volume shipping",
                body: "Shipping every week? Get business rates and one account for every parcel.",
                href: "/services/volume-shipping",
              },
              {
                icon: <ShoppingBagIcon size={22} />,
                title: "Global shopper",
                body: "Shop US stores with a free US address. We combine your orders and ship them to you.",
                href: "/services/global-shopper",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Parcel shipping questions"
          faqs={[
            {
              q: "How long does international parcel shipping take?",
              a: "It depends on how you ship. Air is fastest and can arrive as soon as the next day on some routes. Ground takes longer and costs less. Ocean is the cheapest for large shipments and usually takes a few weeks.",
            },
            {
              q: "What documents do I need for an international parcel?",
              a: "Most parcels need a commercial invoice, a shipping label and a packing list. Higher-value shipments, and some destinations, may also need a certificate of origin or export information. We'll tell you what yours needs.",
            },
            {
              q: "Should I insure my parcel?",
              a: "If it's valuable or fragile, yes. Insurance protects you if something is lost or damaged in transit. Ask about it when you get your quote.",
            },
            {
              q: "How is my shipping cost calculated?",
              a: "By the parcel's dimensional weight (its size, not only what it weighs), the destination and the way you ship it. A snug box is the easiest way to keep the price down.",
            },
            {
              q: "Can I track my parcel?",
              a: "Yes. Every shipment comes with a tracking number you can follow from pickup to delivery.",
            },
            {
              q: "Are there items I can't ship internationally?",
              a: "Yes. Prohibited and restricted items vary by country. If you're unsure about anything, ask us before you book and we'll check it for your destination.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand title="Ready to send it?" />
      </PageBody>
    </>
  );
}
