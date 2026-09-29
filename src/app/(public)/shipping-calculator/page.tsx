import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenIcon,
  CurrencyDollarIcon,
  PackageIcon,
  ProhibitIcon,
  ReceiptIcon,
  ShippingContainerIcon,
} from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceFaq } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import type { Faq } from "@/lib/default-faqs";
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
} from "@/components/public/page-kit";
import { ShipmentCalculator } from "./shipment-calculator";

// Shipping calculator (new 2026-09-29). Estimates a whole shipment: several
// boxes, each with a quantity, adding up the actual, dimensional and
// chargeable weight. The theory lives on /resources/volumetric-weight; this
// page is the practical tool. No prices anywhere: the price comes from a
// quote, which the calculator links to (with the destination, if chosen).

export const metadata: Metadata = pageMetadata({
  title: "Shipping Calculator: Box Weight and Size | TYS Global Logistics",
  description:
    "Free shipping calculator. Add one or more boxes to see the actual, dimensional and chargeable weight carriers bill on, then get your exact price in a quote.",
  path: "/shipping-calculator",
});

const FAQS: Faq[] = [
  {
    q: "Does this calculator show the shipping price?",
    a: "No. It shows the weight carriers will bill you on, which is a big part of the price. The destination, speed and carrier make up the rest. Ask for a free quote to get your exact price.",
  },
  {
    q: "What is chargeable weight?",
    a: "It's the weight you're billed for. For each box, it's whichever is greater: the actual weight on the scale, or the dimensional weight worked out from the box's size.",
  },
  {
    q: "How is dimensional weight calculated?",
    a: "Multiply the length, width and height of the box. In inches, divide by 139 to get pounds. In centimeters, divide by 5000 to get kilograms.",
  },
  {
    q: "Why is each box worked out on its own?",
    a: "Carriers look at every box separately. A heavy small box and a light big box are each billed on their own greater number, and those are added together for the shipment.",
  },
  {
    q: "How accurate is the result?",
    a: "It's a close estimate if your measurements are right. Carriers usually round each box up to the next whole pound or half kilo, and they measure and weigh boxes themselves, so the final number can be a little higher.",
  },
  {
    q: "Can I use this for international and domestic shipments?",
    a: "Yes. The same formula works for shipping within the US and from the US to other countries. Pick where it's going, and we'll carry that over to your quote.",
  },
];

export default function ShippingCalculatorPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Shipping calculator", path: "/shipping-calculator" },
        ]}
      />
      <PageHeroBand
        quote={false}
        title="Shipping calculator"
        accent="for your whole shipment."
        subtitle="Add each box you're sending. See the weight carriers will bill you on, then get your exact price in a free quote."
      />

      <PageBody>
        <Section id="calculator">
          <SectionHead
            kicker="Calculator"
            title="Add your boxes"
            lead="Enter the size and weight of each box. If you have several the same, just change how many."
          />
          <div className="mt-10 max-w-5xl">
            <ShipmentCalculator />
          </div>
        </Section>

        <SplitSection
          kicker="Your results"
          title="What the numbers"
          accent="mean."
          lead="Three weights, and the one that matters most is the last."
        >
          <Prose>
            <p>
              <strong>Actual weight</strong> is what your boxes weigh on a scale, added together.
            </p>
            <p>
              <strong>Dimensional weight</strong> is worked out from each box&rsquo;s size. Carriers
              use it because a big, light box takes up as much room on a plane or truck as a heavy
              one.
            </p>
            <p>
              <strong>Chargeable weight</strong> is what you&rsquo;re billed on. For each box,
              it&rsquo;s whichever is greater, actual or dimensional. The calculator adds those up
              for your whole shipment.
            </p>
            <p>
              Want the full explanation, with worked examples? Read our{" "}
              <Link href="/resources/volumetric-weight">volumetric weight guide</Link>. To see what
              else shapes the price, like the destination and speed, see{" "}
              <Link href="/shipping-rates">how shipping rates work</Link>.
            </p>
          </Prose>
        </SplitSection>

        <SplitSection
          kicker="Measuring tips"
          title="Getting accurate"
          accent="numbers."
          lead="A few minutes with a tape measure saves surprises later."
        >
          <Checklist
            items={[
              "Measure the outside of the box, after it's packed and taped.",
              "Measure at the widest point, including any bulges.",
              "Round each measurement up to the next whole inch or centimeter.",
              "Weigh the packed box. A bathroom scale works: weigh yourself, then weigh yourself holding the box, and subtract.",
              "If some boxes are the same size and weight, enter one and change how many.",
            ]}
          />
        </SplitSection>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related" title="Helpful" accent="next steps." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <BookOpenIcon size={22} />,
                title: "Volumetric weight guide",
                body: "How dimensional weight works, with the formula and worked examples.",
                href: "/resources/volumetric-weight",
              },
              {
                icon: <CurrencyDollarIcon size={22} />,
                title: "Shipping rates",
                body: "Everything else that affects your price, from speed to destination.",
                href: "/shipping-rates",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Ship boxes internationally",
                body: "Packing, labeling and customs tips for sending boxes overseas.",
                href: "/services/ship-boxes-internationally",
              },
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Pallet shipping",
                body: "Lots of boxes? A pallet can work out simpler and cheaper.",
                href: "/services/pallet-shipping",
              },
              {
                icon: <ReceiptIcon size={22} />,
                title: "Customs duty",
                body: "Who pays duty and import tax, and what decides the amount.",
                href: "/resources/customs-duty",
              },
              {
                icon: <ProhibitIcon size={22} />,
                title: "Prohibited items",
                body: "What can't be shipped, and what needs extra paperwork.",
                href: "/resources/prohibited-items",
              },
            ]}
          />
        </Section>

        <ServiceFaq title="Shipping calculator questions" faqs={FAQS} />

        <TrustedReviewsSection />
        <CtaBand
          title="Know your chargeable weight?"
          accent="Get your exact price."
          lead="Enter your boxes in a free quote. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
