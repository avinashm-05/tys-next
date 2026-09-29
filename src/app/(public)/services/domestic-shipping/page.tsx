import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceIntro, ServiceFaq } from "@/components/public/service-page-sections";
import { CardGrid, Checklist, CtaBand, PAD, PageBody, Section, SectionHead, SplitSection, Steps } from "@/components/public/page-kit";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  AirplaneTiltIcon,
  BookOpenTextIcon,
  CubeIcon,
  EnvelopeSimpleIcon,
  LightningIcon,
  PackageIcon,
  ShieldCheckIcon,
  StackIcon,
  StorefrontIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Discounted Domestic Shipping in the US | TYS Global Logistics",
  description:
    "Ship parcels, heavy boxes and pallets anywhere in the 50 states with FedEx, UPS and USPS at discounted rates. Ground or express, tracked to the door.",
  path: "/services/domestic-shipping",
});

// Renovated 2026-09-29 onto the page kit. Fixed transit-day ranges and the
// same-day claim were removed: they vary by carrier and route, and the quote
// shows the real options.
export default function DomesticShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Domestic Shipping", path: "/services/domestic-shipping" },
        ]}
      />
      <ServiceJsonLd
        name="Domestic Shipping"
        description="Affordable shipping across all 50 states for parcels, heavy boxes and freight."
        slug="domestic-shipping"
        domestic
      />
      <PageHeroBand
        title="Domestic shipping"
        accent="across all 50 states."
        subtitle="Parcels, heavy boxes and pallets, sent with FedEx, UPS and USPS at discounted rates and tracked from pickup to delivery."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Domestic shipping"
          heading="One domestic shipping partner for everything you send"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Up to 70%", sub: "Off retail rates" },
            { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "100%", sub: "Tracked" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "24/7", sub: "Expert support" },
          ]}
        >
          <p>
            Our domestic shipping service covers everything from a single envelope to a pallet of
            stock, sent to any address in the US. Pick ground when price matters most, or express
            when you&rsquo;re up against a deadline.
          </p>
          <p>
            You get discounted rates with the carriers you already know, a tracking number on every
            shipment, and a real person to call if you need help.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Delivery speeds"
              title="Shipping speeds to fit"
              accent="your timeline."
              lead="Transit times depend on the carrier, the service and the distance. Your quote shows the delivery date for each option before you book."
            />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <TruckIcon size={22} />,
                title: "Ground",
                body: "The most economical way to ship, for regional and coast to coast deliveries that aren't in a rush.",
              },
              {
                icon: <AirplaneTiltIcon size={22} />,
                title: "Express",
                body: "Faster air services for shipments on a deadline, when ground won't get there in time.",
              },
              {
                icon: <LightningIcon size={22} />,
                title: "Overnight",
                body: "Next business day delivery where the carrier offers it on your route. Ask us to check yours.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="How to ship within the US" lead="From quote to doorstep in four steps." />
          </div>
          <Steps
            steps={[
              {
                title: "Get a quote",
                body: "Enter where it's going, the weight and the size. Compare carriers and delivery dates side by side.",
              },
              {
                title: "Pick a service",
                body: "Choose ground, express or overnight, based on your budget and your deadline.",
              },
              {
                title: "Pack and label",
                body: "Box it up, attach the shipping label, and book a pickup or drop it off.",
              },
              {
                title: "Track it",
                body: "Follow your shipment from pickup to the front door with your tracking number.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="What we ship" accent="across the US" />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <PackageIcon size={22} />,
                title: "Parcels and packages",
                body: "Everyday parcels, gifts and online orders, sent fast without freight-level paperwork.",
                href: "/services/parcel-shipping",
              },
              {
                icon: <EnvelopeSimpleIcon size={22} />,
                title: "Envelopes and documents",
                body: "Contracts, legal papers and time-sensitive mail, with proof of delivery.",
                href: "/services/document-shipping",
              },
              {
                icon: <CubeIcon size={22} />,
                title: "Heavy boxes and pallets",
                body: "Multi-box shipments and palletized loads for homes and businesses.",
              },
              {
                icon: <ShieldCheckIcon size={22} />,
                title: "Fragile and high-value items",
                body: "Packing advice, careful handling, and insurance available when it matters.",
              },
            ]}
          />
        </Section>

        <SplitSection
          kicker="Packing tips"
          title="Pack it once,"
          accent="pack it right."
          lead="Good packing is the cheapest insurance there is. It also keeps your rate down."
        >
          <Checklist
            items={[
              "Use a box or envelope sized to the item. Oversized boxes cost more and let things move",
              "Wrap fragile items one by one and cushion them on every side",
              "Put heavier items at the bottom and tape every seam",
              "Stick the label flat on the top, away from seams and edges",
              "Remove or cover old labels and barcodes on reused boxes",
            ]}
          />
        </SplitSection>

        <ServiceFaq
          title="Domestic shipping questions"
          faqs={[
            {
              q: "How long does domestic shipping take?",
              a: "It depends on the service and the distance. Ground is the economical choice and takes longer, while express and overnight services are faster. Your quote shows the expected delivery date for each option on your route.",
            },
            {
              q: "Do you offer same-day or next-day delivery?",
              a: "Next-day and overnight services are available on many routes through FedEx and UPS. Same-day depends on the route and the carrier, so call us and we'll check what's possible for yours.",
            },
            {
              q: "Can you ship heavy or freight items domestically?",
              a: "Yes. We ship heavy boxes, crates and pallets across the US as well as regular parcels.",
            },
            {
              q: "Do you support business and e-commerce shipping?",
              a: "Yes. Retailers and online sellers who ship regularly can open a business account with discounted rates and priority support.",
            },
            {
              q: "Can I ship just one package?",
              a: "Yes. One parcel is fine. If you ship often, ask about a business account for better rates.",
            },
            {
              q: "Can I track my domestic shipment?",
              a: "Yes. Every shipment has a tracking number, so you can follow it from pickup to delivery.",
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Keep reading" title="Related services and guides" />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <StackIcon size={22} />,
                title: "Volume shipping",
                body: "Shipping every week? Better rates the more you send.",
                href: "/services/volume-shipping",
              },
              {
                icon: <StorefrontIcon size={22} />,
                title: "Retailer shipping",
                body: "Rates and support built for online stores and sellers.",
                href: "/services/retailer-shipping",
              },
              {
                icon: <BookOpenTextIcon size={22} />,
                title: "Volumetric weight",
                body: "Why a big, light box can cost more than a small, heavy one.",
                href: "/resources/volumetric-weight",
              },
              {
                icon: <BookOpenTextIcon size={22} />,
                title: "Prohibited items",
                body: "What carriers won't take, so nothing gets sent back.",
                href: "/resources/prohibited-items",
              },
            ]}
          />
        </Section>

        <TrustedReviewsSection />
        <CtaBand title="Got something to send?" accent="Get a free quote." />
      </PageBody>
    </>
  );
}
