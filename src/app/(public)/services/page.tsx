import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { CardGrid, CtaBand, PAD, PageBody, Section, SectionHead, StatRow, Steps } from "@/components/public/page-kit";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  BriefcaseIcon,
  CalculatorIcon,
  CarProfileIcon,
  CubeIcon,
  EnvelopeSimpleIcon,
  GlobeHemisphereWestIcon,
  HeadsetIcon,
  HouseLineIcon,
  MapPinAreaIcon,
  MusicNotesIcon,
  PackageIcon,
  ShippingContainerIcon,
  ShoppingBagIcon,
  StackIcon,
  StorefrontIcon,
  SuitcaseRollingIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Shipping, Moving & Freight Services | TYS Global Logistics",
  description:
    "Every TYS service in one place: parcel, document and baggage shipping, home moves, car shipping and freight forwarding, from the US to 200+ countries.",
  path: "/services",
});

// Services index, renovated 2026-09-29 onto the page kit: every service as
// a linked card, grouped by what the visitor is doing (shipping, moving,
// business), so no service page is orphaned.
export default function ServicesPage() {
  return (
    <>
      <PageHeroBand
        title="Shipping, moving and freight services"
        accent="from one team."
        subtitle="Parcels, documents, households, cars and cargo, sent from the US to 200+ countries. Pick what you're sending to see how it works."
      />

      <PageBody>
        <Section flush id="shipping">
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Shipping"
              title="Send parcels, documents"
              accent="and bags."
              lead="Discounted rates with FedEx, DHL, UPS and USPS, and tracking on every shipment."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <PackageIcon size={22} />,
                title: "Parcel shipping",
                body: "Boxes of any size sent from the US to 200+ countries, at up to 70% off retail rates.",
                href: "/services/parcel-shipping",
              },
              {
                icon: <EnvelopeSimpleIcon size={22} />,
                title: "Document shipping",
                body: "Contracts, visa papers and legal filings by express courier, tracked to signature.",
                href: "/services/document-shipping",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Domestic shipping",
                body: "Parcels, heavy boxes and pallets to any address in the 50 states, ground or express.",
                href: "/services/domestic-shipping",
              },
              {
                icon: <SuitcaseRollingIcon size={22} />,
                title: "Baggage shipping",
                body: "Send your suitcases ahead, collected from your door, and fly with just a carry-on.",
                href: "/services/baggage-shipping",
              },
              {
                icon: <ShoppingBagIcon size={22} />,
                title: "Global Shopper",
                body: "A free US address for shopping American stores. We combine your orders and ship them to you.",
                href: "/services/global-shopper",
              },
              {
                icon: <MapPinAreaIcon size={22} />,
                title: "Track a shipment",
                body: "Already shipped with us? See where it is, from pickup to the front door.",
                href: "/tracking",
              },
              {
                icon: <CubeIcon size={22} />,
                title: "Ship boxes internationally",
                body: "One box or a whole stack, sent overseas with packing and customs help.",
                href: "/services/ship-boxes-internationally",
              },
              {
                icon: <CalculatorIcon size={22} />,
                title: "Shipping calculator",
                body: "Work out the weight carriers will bill you on before you ship.",
                href: "/shipping-calculator",
              },
            ]}
          />
        </Section>

        <Section flush id="moving">
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Moving"
              title="Move a home, a car"
              accent="or a piano."
              lead="Packed, moved and delivered door to door, across town, across the US or overseas."
            />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <GlobeHemisphereWestIcon size={22} />,
                title: "International relocation",
                body: "Your whole household packed, shipped and delivered to your new home abroad.",
                href: "/services/international-relocation",
              },
              {
                icon: <HouseLineIcon size={22} />,
                title: "Domestic moving",
                body: "Moves within the US, with one advisor and a crew that packs, loads and unpacks.",
                href: "/services/domestic-moving",
              },
              {
                icon: <CarProfileIcon size={22} />,
                title: "Auto transport",
                body: "Cars, SUVs and motorcycles shipped anywhere in the US on open or enclosed carriers.",
                href: "/services/auto-transport",
              },
              {
                icon: <MusicNotesIcon size={22} />,
                title: "Piano moving",
                body: "Upright and grand pianos moved across town or across the US.",
                href: "/services/piano-moving",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Packers and movers",
                body: "Your home packed, shipped by air or ocean, and delivered abroad.",
                href: "/services/packers-and-movers",
              },
              {
                icon: <HouseLineIcon size={22} />,
                title: "Moving to India",
                body: "Household goods and Transfer of Residence basics for a move to India.",
                href: "/destinations/moving/india",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Why TYS" title="Big carrier networks," accent="small-team care." />
          </div>
          <StatRow
            stats={[
              { n: "200", s: "+", label: "Countries we deliver to" },
              { n: "900", s: "+", label: "Trusted carrier networks" },
              { n: "70", s: "%", label: "Shipping savings, up to" },
              { n: "24", s: "/7", label: "Expert support" },
            ]}
          />
        </Section>

        <Section flush id="business">
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Business"
              title="Shipping for"
              accent="your business."
              lead="From weekly parcels to full containers, with rates and support that grow with you."
            />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Freight forwarding",
                body: "Containers, pallets and commercial cargo by air, ocean, rail or road, with customs handled.",
                href: "/services/freight-forwarding",
              },
              {
                icon: <StackIcon size={22} />,
                title: "Volume shipping",
                body: "Ship often? Get better rates the more you send, and priority support.",
                href: "/services/volume-shipping",
              },
              {
                icon: <StorefrontIcon size={22} />,
                title: "Retailer shipping",
                body: "Shipping for online stores and sellers, with rates built for regular orders.",
                href: "/services/retailer-shipping",
              },
              {
                icon: <BriefcaseIcon size={22} />,
                title: "Small business shipping",
                body: "Discounted carrier rates and one contact person for growing businesses.",
                href: "/services/small-business-shipping",
              },
              {
                icon: <StackIcon size={22} />,
                title: "Pallet shipping",
                body: "Palletized freight across the US or overseas by air and ocean.",
                href: "/services/pallet-shipping",
              },
              {
                icon: <HeadsetIcon size={22} />,
                title: "Talk to our team",
                body: "Tell us what your business ships and we'll suggest the best setup.",
                href: "/contact-us",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="How it works," accent="whatever you're sending." />
          </div>
          <Steps
            steps={[
              {
                title: "Get a free quote",
                body: "Tell us where it's coming from, where it's going and what it is. It takes about 30 seconds.",
              },
              {
                title: "Pick your option",
                body: "Compare carriers, prices and delivery dates, or talk it through with our team.",
              },
              {
                title: "We collect it",
                body: "Book a pickup from your door, or drop it off nearby.",
              },
              {
                title: "Follow it home",
                body: "Track it from pickup to delivery, with a real person on hand if you need one.",
              },
            ]}
          />
        </Section>

        <TrustedReviewsSection />
        <CtaBand />
      </PageBody>
    </>
  );
}
