import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  CarSimpleIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  GlobeHemisphereWestIcon,
  HouseLineIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  ShippingContainerIcon,
  SuitcaseIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceFaq } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { Reveal } from "@/components/public/home/reveal";
import { CONTACT } from "@/app/(public)/contact-us/contact-details";
import {
  CardGrid,
  CtaBand,
  LINE,
  PAD,
  PageBody,
  Prose,
  Section,
  SectionHead,
  SplitSection,
  Steps,
} from "@/components/public/page-kit";

// Atlanta local landing page (new 2026-09-29). For people in Atlanta and
// across Georgia searching for international shipping near them. Contact
// facts come from CONTACT (contact-details.tsx) so they never drift. The
// site-wide OrganizationJsonLd (public layout) already carries the Atlanta
// address as LocalBusiness, so no extra schema here beyond breadcrumbs.
// Pickups are arranged with the carrier: we don't run our own trucks.

export const metadata: Metadata = pageMetadata({
  title: "International Shipping in Atlanta, GA | TYS Global Logistics",
  description:
    "Atlanta based international shipping for Georgia homes and businesses. Parcels, boxes and freight sent worldwide with FedEx, DHL, UPS and USPS. Free quotes.",
  path: "/locations/atlanta",
});

const OFFICE = [
  { icon: <PhoneIcon size={20} />, label: "Call us", value: CONTACT.phone, href: CONTACT.tel, external: false },
  { icon: <EnvelopeSimpleIcon size={20} />, label: "Email us", value: CONTACT.email, href: CONTACT.mailto, external: false },
  {
    icon: <MapPinIcon size={20} />,
    label: "Atlanta office",
    value: (
      <>
        {CONTACT.street}
        <br />
        {CONTACT.city}
      </>
    ),
    href: CONTACT.maps,
    external: true,
  },
];

export default function AtlantaPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
          { name: "Atlanta", path: "/locations/atlanta" },
        ]}
      />
      <PageHeroBand
        title="International shipping in Atlanta,"
        accent="from a local team."
        subtitle="We're based in Atlanta, Georgia. We help people and businesses across the state send parcels, boxes and freight to the world at discounted carrier rates."
      />

      <PageBody>
        <SplitSection
          kicker="Our Atlanta office"
          title="Local, and easy"
          accent="to reach."
          lead="Our US head office is in Atlanta. Call or email us, and call ahead if you'd like to visit."
        >
          <Reveal as="ul" className={`divide-y divide-[var(--line)] overflow-hidden rounded-2xl border ${LINE} bg-white`}>
            {OFFICE.map((it) => (
              <li key={it.label}>
                <a
                  href={it.href}
                  {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[#F8FAFE] sm:px-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-ink/70 transition-colors group-hover:text-brand">
                    {it.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] text-ink-muted">{it.label}</span>
                    <span className="block break-words text-[15.5px] font-medium leading-snug text-ink">{it.value}</span>
                  </span>
                  <ArrowUpRightIcon
                    size={15}
                    className="mt-1 shrink-0 text-[#B7C0CD] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                  />
                </a>
              </li>
            ))}
          </Reveal>
          <Prose className="mt-8">
            <p>
              Most customers never need to visit. You can get a quote online, talk to us on the phone,
              and have your shipment picked up by the carrier. If you&rsquo;d rather talk face to
              face, call <a href={CONTACT.tel}>{CONTACT.phone}</a> first and we&rsquo;ll set a time.
            </p>
          </Prose>
        </SplitSection>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What we ship"
              title="What you can ship"
              accent="from Atlanta."
              lead="From a single envelope to a pallet of stock, sent from Georgia to other countries or across the US."
            />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <PackageIcon size={22} />,
                title: "Parcels",
                body: "Everyday parcels to countries around the world with FedEx, DHL, UPS and USPS.",
                href: "/services/parcel-shipping",
              },
              {
                icon: <HouseLineIcon size={22} />,
                title: "Boxes for family abroad",
                body: "Moving boxes and care packages, one box or many.",
                href: "/services/ship-boxes-internationally",
              },
              {
                icon: <FileTextIcon size={22} />,
                title: "Documents",
                body: "Contracts, certificates and paperwork, tracked to the door.",
                href: "/services/document-shipping",
              },
              {
                icon: <SuitcaseIcon size={22} />,
                title: "Baggage",
                body: "Suitcases and luggage sent ahead of your trip or move.",
                href: "/services/baggage-shipping",
              },
              {
                icon: <ShippingContainerIcon size={22} />,
                title: "Pallets and freight",
                body: "Business stock and heavy goods by LTL, air or ocean.",
                href: "/services/pallet-shipping",
              },
              {
                icon: <CarSimpleIcon size={22} />,
                title: "Vehicles",
                body: "Cars, SUVs and motorcycles moved from Atlanta to anywhere in the US.",
                href: "/services/auto-transport",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="How it works"
              title="Shipping from Atlanta,"
              accent="step by step."
              lead="No need to drive across town. The carrier comes to you, or you drop off nearby."
            />
          </div>
          <Steps
            steps={[
              {
                title: "Get a free quote",
                body: "Tell us what you're sending and where. It takes about 30 seconds online.",
              },
              {
                title: "We compare carriers",
                body: "We check FedEx, DHL, UPS and USPS and explain your options in plain words.",
              },
              {
                title: "Pickup or drop-off",
                body: "We arrange a pickup with the carrier at your home or business, or you drop off at a nearby carrier location.",
              },
              {
                title: "Tracked to the door",
                body: "You get a tracking number and can follow your shipment all the way.",
              },
            ]}
          />
        </Section>

        <SplitSection
          kicker="Areas we serve"
          title="Atlanta and"
          accent="across Georgia."
          lead="Wherever you are in the state, the process is the same."
        >
          <Prose>
            <p>
              We help customers in Atlanta and across Georgia, from homes in the suburbs to small
              businesses and offices downtown. Pickups are arranged with the carrier at your address,
              so where you live in Georgia doesn&rsquo;t change how easy it is.
            </p>
            <p>
              Atlanta is a major freight hub, with Hartsfield-Jackson airport and interstates that
              reach across the Southeast. That&rsquo;s a big part of why we&rsquo;re based here.
            </p>
            <p>
              Not in Georgia? We work with customers across the US. See our{" "}
              <Link href="/locations">locations page</Link> for how that works, and our{" "}
              <Link href="/services/domestic-shipping">domestic shipping</Link> service for sending
              within the US.
            </p>
          </Prose>
        </SplitSection>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Popular destinations"
              title="Where Atlanta"
              accent="ships to."
              lead="A few of the places our customers send to most. Each guide covers customs and what to expect."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <GlobeHemisphereWestIcon size={22} />,
                title: "Shipping to India",
                body: "Parcels, boxes and documents to family and businesses in India.",
                href: "/destinations/india",
              },
              {
                icon: <GlobeHemisphereWestIcon size={22} />,
                title: "Shipping to the UK",
                body: "Sending to England, Scotland, Wales and Northern Ireland.",
                href: "/destinations/uk",
              },
              {
                icon: <GlobeHemisphereWestIcon size={22} />,
                title: "Shipping to Canada",
                body: "Parcels and freight across the northern border.",
                href: "/destinations/canada",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "All destinations",
                body: "See every country we ship to from the US.",
                href: "/destinations",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Atlanta shipping questions"
          faqs={[
            {
              q: "Do I need to visit your Atlanta office to ship something?",
              a: "No. Most customers never visit. You can get a quote online or by phone, and the carrier picks up from your address or you drop off at a nearby carrier location. If you'd like to meet in person, call ahead and we'll set a time.",
            },
            {
              q: "Can you pick up from my home in Atlanta?",
              a: "Yes. We arrange a pickup with the carrier at your home or business, anywhere in Atlanta and across Georgia.",
            },
            {
              q: "What can I ship internationally from Atlanta?",
              a: "Parcels, boxes, documents, baggage, pallets and household goods. Some items are restricted, so check our prohibited items guide or ask us before you pack.",
            },
            {
              q: "How much does international shipping from Atlanta cost?",
              a: "It depends on the size and weight of your shipment, where it's going, how fast you need it there and the carrier. Ask for a free quote and a real person replies, usually within 24 hours.",
            },
            {
              q: "Do you help with customs paperwork?",
              a: "Yes. We help you fill in the customs forms correctly, so your shipment isn't held up at the border.",
            },
            {
              q: "Do you ship within the US from Atlanta too?",
              a: "Yes. We ship parcels and freight from Atlanta to anywhere in the United States, as well as to other countries.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Shipping from Atlanta?"
          accent="Get a free quote."
          lead="Tell us what you're sending and where. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
