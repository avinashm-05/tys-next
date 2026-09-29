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
  StatRow,
} from "@/components/public/page-kit";
import { Reveal } from "@/components/public/home/reveal";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  HeadsetIcon,
  PackageIcon,
  ScalesIcon,
  ShippingContainerIcon,
  StorefrontIcon,
  TruckIcon,
  UsersIcon,
} from "@phosphor-icons/react/dist/ssr";

const LINK = "font-medium text-brand hover:underline";

export const metadata: Metadata = pageMetadata({
  title: "Business Volume Shipping Discounts | TYS Global Logistics",
  description:
    "Shipping every week? Get discounted FedEx, DHL, UPS and USPS rates, one business account for every shipment, and a dedicated advisor. US and international.",
  path: "/services/volume-shipping",
});

export default function VolumeShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Volume Shipping", path: "/services/volume-shipping" },
        ]}
      />
      <ServiceJsonLd
        name="Volume Shipping"
        description="Consistent rates and dedicated support for businesses shipping in volume."
        slug="volume-shipping"
      />
      <PageHeroBand
        title="Volume shipping rates that"
        accent="get better as you ship more."
        subtitle="For businesses that ship every week: discounted carrier rates, steady pickups and one advisor who knows your account."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="For frequent shippers"
          heading="Shipping that keeps up with your business"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-business-accounts.svg", label: "1 account", sub: "For every shipment" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Priority", sub: "Support" },
            { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "4 carriers", sub: "FedEx, DHL, UPS, USPS" },
          ]}
        >
          <p>
            Our volume shipping program is built for businesses that ship often, not once in a while.
            A few boxes a week or hundreds a month, you get consistent pricing, pickups you can plan
            around, and a dedicated advisor who already knows how you ship.
          </p>
          <p>
            It covers domestic routes and{" "}
            <Link href="/destinations" className={LINK}>
              international destinations
            </Link>{" "}
            alike, all from one business account.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="The network behind" accent="your shipments." />
          </div>
          <StatRow
            stats={[
              { n: "500", s: "+", label: "Shipments delivered" },
              { n: "900", s: "+", label: "Trusted carrier networks" },
              { n: "70", s: "%", label: "Shipping savings, up to" },
              { n: "24", s: "/7", label: "Expert support" },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What you get"
              title="Built for"
              accent="frequent shippers."
              lead="Less time on shipping admin, more time running the business."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <ScalesIcon size={22} />,
                title: "Rate comparison",
                body: "Compare prices and delivery times across carriers before you book.",
              },
              {
                icon: <HeadsetIcon size={22} />,
                title: "A dedicated advisor",
                body: "One point of contact who looks after your shipments from pickup to delivery.",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "The right carrier each time",
                body: "Match every shipment to the carrier that suits its budget and deadline.",
              },
              {
                icon: <UsersIcon size={22} />,
                title: "Business support",
                body: "A team you can reach whenever a shipping question comes up.",
              },
            ]}
          />
        </Section>

        <SplitSection
          kicker="Cost savings"
          title="Four ways to cut"
          accent="your shipping bill."
          lead={
            <>
              Rates are only half of it. How you pack and book matters too. Start with{" "}
              <Link href="/resources/volumetric-weight" className={LINK}>
                how volumetric weight works
              </Link>
              .
            </>
          }
        >
          <Reveal className="relative aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-[var(--line)]">
            <Image
              src="/frontend/images/home/business.webp"
              alt="A large, bright warehouse full of boxed orders"
              fill
              sizes="(min-width: 1320px) 640px, (min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="mt-8">
            <Checklist
              items={[
                "Group smaller shipments into larger ones when you can.",
                "Use boxes that fit. Extra packaging adds to dimensional weight.",
                "Book the service level you need. A day or two slower can cost a lot less.",
                <>
                  Keep customs paperwork accurate and complete to avoid delays. Our{" "}
                  <Link href="/resources/customs-duty" className={LINK}>
                    customs duty guide
                  </Link>{" "}
                  explains the basics.
                </>,
              ]}
            />
          </div>
        </SplitSection>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related services" title="More ways" accent="to ship." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <StorefrontIcon size={22} />,
                title: "Retailer shipping",
                body: "Order shipping and easy returns for online stores and wholesalers.",
                href: "/services/retailer-shipping",
              },
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Freight forwarding",
                body: "Pallets, containers and cargo by air, ocean, rail or road.",
                href: "/services/freight-forwarding",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Parcel shipping",
                body: "One-off parcels from the US to 200+ countries at discounted rates.",
                href: "/services/parcel-shipping",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Volume shipping questions"
          faqs={[
            {
              q: "How much volume do I need to ship to qualify?",
              a: "There's no strict minimum. The program is for businesses that ship regularly, whether that's a few packages a week or hundreds a month.",
            },
            {
              q: "Will I have one point of contact?",
              a: "Yes. Every volume shipping account has a dedicated advisor who looks after your shipments from pickup to delivery.",
            },
            {
              q: "Can I compare rates across carriers?",
              a: "Yes. We help you compare prices and delivery times across carriers so you can pick what fits your budget and timeline.",
            },
            {
              q: "How can I lower my shipping costs?",
              a: "Group smaller shipments together, use boxes that fit, and book the service level you actually need. A day or two slower can cost a lot less.",
            },
            {
              q: "Do you support both domestic and international volume shipping?",
              a: "Yes. The volume shipping program covers both domestic and international routes.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand title="Ready to talk volume?" />
      </PageBody>
    </>
  );
}
