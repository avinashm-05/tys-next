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
  BookOpenIcon,
  CalculatorIcon,
  GiftIcon,
  HouseLineIcon,
  PackageIcon,
  ProhibitIcon,
  ReceiptIcon,
  ShippingContainerIcon,
  SuitcaseIcon,
} from "@phosphor-icons/react/dist/ssr";

// Ship boxes internationally (new 2026-09-29). For people sending moving
// boxes, care packages or several boxes from the US to family abroad.
// Outbound only (US to the world). No prices, no transit promises, no
// packing supplies offered, and no claim that duties or cover are included.

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "Ship Boxes Internationally from the US | TYS Global Logistics",
  description:
    "Send boxes abroad from the US with FedEx, DHL, UPS or USPS at discounted rates. Packing tips, customs help and a free quote for one box or many.",
  path: "/services/ship-boxes-internationally",
});

export default function ShipBoxesInternationallyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Ship boxes internationally", path: "/services/ship-boxes-internationally" },
        ]}
      />
      <ServiceJsonLd
        name="International Box Shipping"
        description="Shipping moving boxes, care packages and multi-box shipments from the United States to destinations worldwide with FedEx, DHL, UPS and USPS."
        slug="ship-boxes-internationally"
      />
      <PageHeroBand
        title="Ship boxes internationally,"
        accent="from the US to anywhere."
        subtitle="Moving boxes, care packages or a few boxes for family overseas. We compare carriers, help with the customs paperwork and get your boxes on their way."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Send boxes abroad"
          heading="Sending boxes overseas, made simple"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Discounted", sub: "Carrier rates" },
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs", sub: "Paperwork help" },
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "US to the world" },
          ]}
        >
          <p>
            Shipping a box to another country can feel confusing. Which carrier? What size box? What
            goes on the customs form? We answer those questions every day, so you don&rsquo;t have to
            work it out alone.
          </p>
          <p>
            TYS Global Logistics is based in Atlanta, Georgia. We send boxes from anywhere in the US
            to the world with FedEx, DHL, UPS and USPS, using discounted rates on our carrier accounts.
            Sending just one parcel? Our{" "}
            <Link href="/services/parcel-shipping" className={LINK}>
              parcel shipping
            </Link>{" "}
            page covers that too.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What people send"
              title="One box or ten,"
              accent="we can help."
              lead="These are the boxes we help people send most often."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <HouseLineIcon size={22} />,
                title: "Moving boxes",
                body: "Clothes, books and kitchen things for a move abroad, when you don't need a full household move.",
              },
              {
                icon: <GiftIcon size={22} />,
                title: "Care packages",
                body: "Gifts, snacks and little comforts for family and friends in another country.",
              },
              {
                icon: <BookOpenIcon size={22} />,
                title: "Student boxes",
                body: "Books, bedding and the things a student needs for a year of study overseas.",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Several boxes at once",
                body: "A handful of boxes to one address, each labeled and tracked on the same shipment.",
              },
            ]}
          />
        </Section>

        <SplitSection
          kicker="What sets the price"
          title="Box size matters"
          accent="as much as weight."
          lead="Carriers charge for the space a box takes up, not only what it weighs."
        >
          <Prose>
            <p>
              Every carrier works out two weights for your box. One is the <strong>actual weight</strong>{" "}
              on the scale. The other is the <strong>dimensional weight</strong>, which comes from
              the length, width and height. You pay for whichever is greater.
            </p>
            <p>
              So a big box of pillows can cost more than a small box of books. That surprises a lot
              of people. Our{" "}
              <Link href="/resources/volumetric-weight">volumetric weight guide</Link> explains how it
              works, and our <Link href="/shipping-calculator">shipping calculator</Link> lets you add
              all your boxes and see the weight you&rsquo;ll be billed on.
            </p>
            <p>
              The other things that shape the price are the destination country, how fast you want
              it there, and the carrier. Our{" "}
              <Link href="/shipping-rates">shipping rates page</Link> walks through each one.
            </p>
          </Prose>
        </SplitSection>

        <TopicScroller
          topics={[
            {
              id: "packing-tips",
              title: "Packing tips for international boxes",
              lead: "Boxes going overseas get handled many times. Pack them to take it.",
              content: (
                <Checklist
                  items={[
                    "Use a strong, sturdy box. A double-wall box is best for heavy things.",
                    "Pick a box that fits. Too big wastes money, too small can burst.",
                    "Fill empty space with paper or bubble wrap, so nothing moves when you shake it.",
                    "Put heavy things at the bottom and lighter things on top.",
                    "Wrap anything fragile on its own before it goes in the box.",
                    "Tape every seam with strong packing tape, top and bottom.",
                    "Take off or cover old labels and barcodes from reused boxes.",
                  ]}
                />
              ),
            },
            {
              id: "labeling-several-boxes",
              title: "Labeling several boxes",
              lead: "When you send more than one box, a little labeling saves a lot of worry.",
              content: (
                <Checklist
                  items={[
                    "Number your boxes, for example 1 of 4, 2 of 4, and so on.",
                    "Write the name and address of the person receiving them inside each box too.",
                    "Keep a simple list of what is in each box. It helps with customs and with any claim.",
                    "Stick the shipping label on the largest flat side, not over a seam.",
                    "Each box gets its own label and tracking number, so you can follow every one.",
                  ]}
                />
              ),
            },
            {
              id: "customs-contents-list",
              title: "Your customs list of contents",
              lead: "Every box leaving the US needs a list of what is inside. We help you fill it in.",
              content: (
                <Prose>
                  <p>
                    Customs officers in the destination country use your list to decide if duties or
                    taxes are due. Be clear and honest. Write &ldquo;3 cotton shirts, used&rdquo;
                    rather than &ldquo;clothes&rdquo;, and give a fair value for each item.
                  </p>
                  <ul>
                    <li>What each item is, in plain words</li>
                    <li>How many of each item</li>
                    <li>The value of each item</li>
                    <li>Whether items are new, used or gifts</li>
                  </ul>
                  <p>
                    Some countries charge duty on gifts and used goods, and the person receiving the
                    box may be asked to pay it. Our{" "}
                    <Link href="/resources/customs-duty">customs duty guide</Link> explains who pays
                    and why. Before you pack, check our list of{" "}
                    <Link href="/resources/prohibited-items">prohibited items</Link>.
                  </p>
                </Prose>
              ),
            },
            {
              id: "heavy-or-light-boxes",
              title: "Heavy boxes or light boxes: which carrier?",
              lead: "There is no single best carrier. It depends on the box and where it's going.",
              content: (
                <Prose>
                  <p>
                    <strong>Heavier boxes</strong> often suit the express services from FedEx, DHL
                    and UPS. They are fully tracked door to door, and the price per pound can drop as
                    the weight goes up.
                  </p>
                  <p>
                    <strong>Smaller, lighter boxes</strong> can be good value with USPS international
                    services. USPS has lower size and weight limits, and tracking can vary once the
                    box reaches the other country.
                  </p>
                  <p>
                    You don&rsquo;t need to work this out yourself. When you ask for a quote, we
                    compare the options for your boxes and destination, and tell you which makes most
                    sense.
                  </p>
                </Prose>
              ),
            },
            {
              id: "when-to-switch-to-freight",
              title: "When to switch to freight",
              lead: "Past a certain point, sending boxes one by one stops being the cheapest way.",
              content: (
                <Prose>
                  <p>
                    If you have a lot of boxes, or they are very heavy, it can cost less to stack them
                    on a pallet and send them as freight. It also keeps everything together as one
                    shipment.
                  </p>
                  <p>
                    Not sure where that line is for you? Tell us how many boxes you have and roughly
                    what they weigh. We&rsquo;ll check both ways and tell you honestly which is
                    better. Read more about{" "}
                    <Link href="/services/pallet-shipping">pallet shipping</Link> and{" "}
                    <Link href="/services/freight-forwarding">freight forwarding</Link>.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="How it works" title="How to ship boxes" accent="overseas with us." />
          </div>
          <Steps
            steps={[
              {
                title: "Get a free quote",
                body: "Tell us how many boxes, their size and weight, and where they're going.",
              },
              {
                title: "Pick your option",
                body: "We compare carriers and explain the choices in plain words. You choose.",
              },
              {
                title: "Pickup or drop-off",
                body: "We arrange a pickup with the carrier, or you drop your boxes at a nearby carrier location.",
              },
              {
                title: "Track every box",
                body: "Each box gets a tracking number, so you can follow it all the way to the door.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related" title="More ways" accent="we can help." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <CalculatorIcon size={22} />,
                title: "Shipping calculator",
                body: "Add all your boxes and see the weight carriers will bill you on.",
                href: "/shipping-calculator",
              },
              {
                icon: <SuitcaseIcon size={22} />,
                title: "Baggage shipping",
                body: "Send suitcases and luggage ahead instead of paying airline bag fees.",
                href: "/services/baggage-shipping",
              },
              {
                icon: <HouseLineIcon size={22} />,
                title: "International relocation",
                body: "Moving your whole home abroad? We handle the full move.",
                href: "/services/international-relocation",
              },
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Pallet shipping",
                body: "Lots of boxes? A pallet can be the simpler, cheaper way.",
                href: "/services/pallet-shipping",
              },
              {
                icon: <ReceiptIcon size={22} />,
                title: "Customs duty guide",
                body: "Who pays duty and import tax, and what decides the amount.",
                href: "/resources/customs-duty",
              },
              {
                icon: <ProhibitIcon size={22} />,
                title: "Prohibited items",
                body: "What can't go in your box, and what needs extra paperwork.",
                href: "/resources/prohibited-items",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Questions about shipping boxes abroad"
          faqs={[
            {
              q: "What is the cheapest way to ship boxes overseas?",
              a: "It depends on the size, weight and destination of your boxes. Small, light boxes can be good value with USPS, while heavier boxes often work out better with FedEx, DHL or UPS. With a lot of boxes, freight can be cheaper still. Ask for a free quote and we'll compare the options for you.",
            },
            {
              q: "How is the price of an international box worked out?",
              a: "Carriers charge for the actual weight or the dimensional weight, whichever is greater. Dimensional weight comes from the box's length, width and height. The destination, the speed you choose and the carrier also affect the price.",
            },
            {
              q: "Can I send several boxes to the same address?",
              a: "Yes. Each box gets its own label and tracking number, and they can travel together on one shipment. Number your boxes and keep a list of what is in each one.",
            },
            {
              q: "Do I need to fill in a customs form?",
              a: "Yes. Every box leaving the US needs a list of its contents, with the quantity and value of each item. We help you fill it in correctly so your boxes aren't held up.",
            },
            {
              q: "Will the person receiving the boxes have to pay duty?",
              a: "They might. Each country sets its own rules on duties and taxes, including for gifts and used items. Our customs duty guide explains how it works, and we can tell you what to expect for your destination.",
            },
            {
              q: "Do you pick up the boxes from my home?",
              a: "We can arrange a pickup from your home or business with the carrier, anywhere in the US. You can also drop your boxes off at a nearby carrier location if that's easier.",
            },
            {
              q: "Can you ship boxes to the US from another country?",
              a: "No. We only ship from the United States, to other countries and within the US.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Got boxes to send?"
          accent="Get a free quote."
          lead="Tell us how many boxes and where they're going. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
