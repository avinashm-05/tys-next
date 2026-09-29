import type { Metadata } from "next";
import Image from "next/image";
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
  Section,
  SectionHead,
  SplitSection,
  Steps,
} from "@/components/public/page-kit";
import { Reveal } from "@/components/public/home/reveal";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  CarSimpleIcon,
  PackageIcon,
  ShippingContainerIcon,
  StackIcon,
  StorefrontIcon,
  WarehouseIcon,
} from "@phosphor-icons/react/dist/ssr";

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "Ecommerce Shipping for Online Stores | TYS Global Logistics",
  description:
    "Shipping for online stores, retailers and wholesalers: discounted FedEx, DHL, UPS and USPS rates, easy returns, and every order tracked in one account.",
  path: "/services/retailer-shipping",
});

export default function RetailerShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Retailer Shipping", path: "/services/retailer-shipping" },
        ]}
      />
      <ServiceJsonLd
        name="Retailer Shipping"
        description="Ecommerce and retail shipping for online stores, retailers and wholesalers, with returns and tracking for every order."
        slug="retailer-shipping"
      />
      <PageHeroBand
        title="Ecommerce shipping for retailers and"
        accent="online stores."
        subtitle="Get orders out the door and returns back in, with discounted carrier rates and tracking your customers can follow."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="For retailers and ecommerce"
          heading="Shipping that brings customers back"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-business-accounts.svg", label: "1 account", sub: "For every shipment" },
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Up to 70%", sub: "Off retail rates" },
            { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Countries" },
          ]}
        >
          <p>
            Your customers judge you on delivery as much as on the product. TYS Global Logistics
            handles ecommerce shipping for online stores, wholesalers and fulfillment centers, with
            steady transit times and tracking from checkout to doorstep. Returns are handled too.
          </p>
          <p>
            Selling abroad? We ship to{" "}
            <Link href="/destinations" className={LINK}>
              more than 200 countries
            </Link>
            . Our guides to{" "}
            <Link href="/resources/volumetric-weight" className={LINK}>
              volumetric weight
            </Link>{" "}
            and{" "}
            <Link href="/resources/prohibited-items" className={LINK}>
              prohibited items
            </Link>{" "}
            help you price and pack right.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Who it's for" title="Built for the way" accent="you sell." />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <StorefrontIcon size={22} />,
                title: "Wholesalers and retailers",
                body: "Regular shipping schedules that keep shelves stocked and orders moving.",
              },
              {
                icon: <WarehouseIcon size={22} />,
                title: "Fulfillment centers",
                body: "Dependable pickups and transit times that keep customer orders on schedule.",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Online stores",
                body: "Direct-to-customer orders to anywhere, with tracking your buyers can follow.",
              },
              {
                icon: <CarSimpleIcon size={22} />,
                title: "Auto and equipment dealers",
                body: "Coordinated shipping for businesses that move larger items as well as parcels.",
              },
            ]}
          />
        </Section>

        <SplitSection
          kicker="Returns"
          title="Returns that don't"
          accent="lose you the customer."
          lead="A painless return is often what earns the next order. We make it easy on your buyers and on you."
        >
          <Reveal className="relative aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
            <Image
              src="/frontend/images/home/parcels.webp"
              alt="Cardboard parcels stacked in the back of a delivery van"
              fill
              sizes="(min-width: 1320px) 640px, (min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="mt-8">
            <Checklist
              items={[
                "Prepaid return labels for your customers",
                "Scheduled pickups for return shipments",
                "Call tags, so customers can hand a return to a driver instead of finding a drop-off point",
                "Tracking on every order going out and every return coming back",
              ]}
            />
          </div>
        </SplitSection>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Getting started" title="Set up once," accent="ship every day." />
          </div>
          <Steps
            steps={[
              {
                title: "Tell us how you ship",
                body: "Order volume, parcel sizes, where your customers are. A short call is enough.",
              },
              {
                title: "Get your business account",
                body: "Your rates and every shipment in one place, with priority support behind it.",
              },
              {
                title: "Ship, track and return",
                body: "Send orders, follow each one to the door, and handle returns from the same account.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related services" title="Growing" accent="fast?" />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <StackIcon size={22} />,
                title: "Volume shipping",
                body: "Better rates and a dedicated advisor once you're shipping every week.",
                href: "/services/volume-shipping",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Parcel shipping",
                body: "Single parcels to 200+ countries with FedEx, DHL, UPS and USPS.",
                href: "/services/parcel-shipping",
              },
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Freight forwarding",
                body: "Pallets and containers for stock, by air, ocean, rail or road.",
                href: "/services/freight-forwarding",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Ecommerce shipping questions"
          faqs={[
            {
              q: "Do you support e-commerce order fulfillment?",
              a: "Yes. We ship direct-to-customer orders for online stores, with tracking your customers can follow.",
            },
            {
              q: "Can you handle returns for my business?",
              a: "Yes. We offer prepaid return labels, scheduled pickups and call tags, so returning something is easy for your customers.",
            },
            {
              q: "Do you work with fulfillment centers?",
              a: "Yes. We set up dependable pickup and transit schedules with fulfillment centers to keep customer orders on time.",
            },
            {
              q: "Is there a business account option?",
              a: "Yes. A business account lets you manage all your shipments in one place.",
            },
            {
              q: "Can you ship larger items like vehicles or equipment?",
              a: "Yes. We coordinate shipping for dealerships and businesses that move larger items alongside their regular parcels.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand title="Ready to ship your orders?" />
      </PageBody>
    </>
  );
}
