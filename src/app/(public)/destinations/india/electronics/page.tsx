import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
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
  Steps,
} from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  ArrowRightIcon,
  CameraIcon,
  DeviceMobileIcon,
  EnvelopeSimpleIcon,
  LaptopIcon,
  PackageIcon,
  ProhibitIcon,
  ReceiptIcon,
  TagIcon,
  TelevisionIcon,
} from "@phosphor-icons/react/dist/ssr";

// Ship electronics to India (new 2026-09-29, SEO page under the India guide).
// Sources for the India-specific rules:
// - BIS Compulsory Registration Scheme: crsbis.in "What is CRS" and
//   bis.gov.in Scheme II product list (laptops/tablets, mobile phones,
//   LCD/LED TVs, digital cameras, power banks, smart watches). The order says
//   no person shall import, sell or distribute goods that don't conform. No
//   personal-use exemption was found on an official source, so the copy
//   stays general and asks people to check with us.
// - Drones: DGFT notification 54/2015-20 of 9 Feb 2022 (civilaviation.gov.in
//   Drone Import Policy): import of drones prohibited, narrow exceptions.
// - Satellite phones: indianembassyusa.gov.in, not allowed without DoT
//   permission (Thuraya/Iridium banned).
// - Loose lithium batteries: a carrier rule, matching /resources/prohibited-items.
// No duty rates are given: they vary by item and change.

const LINK = "font-medium text-brand hover:underline";
const QUOTE_IN = "/quotes?to_country=IN";

export const metadata: Metadata = pageMetadata({
  title: "Ship Electronics to India from the US | TYS Global Logistics",
  description:
    "Ship a laptop, phone, TV or camera to India from the US. Battery rules, BIS registration, customs duty on arrival, packing tips, and what can't be sent.",
  path: "/destinations/india/electronics",
});

export default function IndiaElectronicsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: "Shipping to India", path: "/destinations/india" },
          { name: "Electronics to India", path: "/destinations/india/electronics" },
        ]}
      />
      <PageHeroBand
        title="Ship electronics to India,"
        accent="the right way."
        subtitle="Laptops, phones, TVs and cameras for family in India, packed well, declared properly and tracked from your door to theirs."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Electronics to India"
          heading="A new laptop for a nephew, a TV for your parents"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-customs.svg", label: "Customs help", sub: "Paperwork done right" },
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "FedEx, DHL, UPS, USPS" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Real people", sub: "Reply usually within 24 hours" },
          ]}
        >
          <p>
            Electronics are some of the most common things people send from the US to India. They are
            also the things most likely to be held at customs when the paperwork is thin. A few rules
            about batteries, standards and duty make all the difference.
          </p>
          <p>
            Here is what to know before you pack. And if you are unsure about anything, ask us before
            it ships. It is much easier to fix before pickup than after.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What people send"
              title="Electronics we ship"
              accent="to India."
              lead="New or used, boxed or not. Each one just needs to be declared and packed properly."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <LaptopIcon size={22} />,
                title: "Laptops and tablets",
                body: "Battery stays inside. Pack with padding all around and the screen protected.",
              },
              {
                icon: <DeviceMobileIcon size={22} />,
                title: "Phones",
                body: "Switched off, battery inside, in its box or wrapped well. Declare the brand and model.",
              },
              {
                icon: <TelevisionIcon size={22} />,
                title: "TVs",
                body: "The screen is the weak point. The original box is best. Big screens may go as freight.",
              },
              {
                icon: <CameraIcon size={22} />,
                title: "Cameras",
                body: "Battery in the camera, lenses capped and padded. Spare batteries can't go.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "batteries",
              title: "Batteries stay in the device",
              lead: "This is the rule that catches people out most often.",
              content: (
                <Prose>
                  <p>
                    Lithium batteries are fine to ship when they are <strong>inside the device</strong>{" "}
                    they power: the laptop, the phone, the camera. Switch the device off before you pack
                    it so it can&rsquo;t turn on in the box.
                  </p>
                  <p>
                    <strong>Loose and spare lithium batteries</strong>, including power banks, are a
                    different story. Carriers treat them as dangerous goods, and we can&rsquo;t send
                    them for you. Damaged, swollen or recalled batteries can&rsquo;t be shipped at all.
                  </p>
                </Prose>
              ),
            },
            {
              id: "bis-certification",
              title: "India's BIS registration",
              lead: "India has its own safety standard for many electronics.",
              content: (
                <Prose>
                  <p>
                    India&rsquo;s Compulsory Registration Scheme, run by the Bureau of Indian Standards
                    (BIS), covers many everyday electronics. The list includes laptops and tablets,
                    mobile phones, LCD and LED TVs, digital cameras, smart watches and power banks.
                    Products it covers are meant to be registered with BIS and carry its mark before
                    they are imported, sold or distributed in India.
                  </p>
                  <p>
                    How this applies to a single item sent to family can depend on the item and on
                    customs. Some models sold in the US are also sold in India, others are not. Tell us
                    the exact brand and model when you ask for a quote and we will flag anything that
                    could be a problem before it ships.
                  </p>
                </Prose>
              ),
            },
            {
              id: "customs-duty-on-electronics",
              title: "Customs duty on electronics",
              lead: "Plan for it, so it isn't a surprise at the door.",
              content: (
                <Prose>
                  <p>
                    Electronics sent to India are generally charged customs duty and GST. The amount
                    depends on the type of item and its declared value. It is usually paid in India on
                    arrival, before delivery, by the person receiving it.
                  </p>
                  <p>
                    Let your family know to expect it, and to keep their phone on so the carrier can
                    reach them. Our <Link href="/resources/customs-duty">customs duty guide</Link>{" "}
                    explains how duty works, and our{" "}
                    <Link href="/destinations/india/shipping-cost">India shipping cost guide</Link>{" "}
                    covers who can pay it.
                  </p>
                </Prose>
              ),
            },
            {
              id: "declare-accurately",
              title: "Declare it accurately",
              lead: "An honest, detailed list is what gets electronics through customs smoothly.",
              content: (
                <Checklist
                  items={[
                    "Name each item plainly: \"Apple MacBook Air laptop\", not \"electronics\" or \"gift\".",
                    "Give the brand and model for every device.",
                    "Say whether it is new or used.",
                    "Put a fair value on each item. Under-declaring can get a shipment held and can lead to penalties.",
                    "Keep the receipt handy in case customs asks for it.",
                  ]}
                />
              ),
            },
            {
              id: "packing-a-tv",
              title: "Packing a TV",
              lead: "A TV screen cracks easily, so it needs more care than anything else in the box.",
              content: (
                <Checklist
                  items={[
                    "Use the original box and foam inserts if you still have them.",
                    "If not, wrap the screen in soft padding, then a hard sheet of card over the front.",
                    "Keep it upright and make sure it can't move inside the box.",
                    "Pack the stand, remote and cables separately in the same box, wrapped.",
                    "Tell us the screen size and box measurements. Large TVs may need to go as freight instead of as a parcel, and we will tell you which when we quote.",
                  ]}
                />
              ),
            },
            {
              id: "what-cant-go",
              title: "What can't go",
              lead: "A few electronics can't be sent to India at all, or not without a license.",
              content: (
                <>
                  <Checklist
                    items={[
                      <>
                        <strong className="font-semibold">Drones.</strong> India prohibits drone
                        imports, apart from narrow exceptions for approved organizations.
                      </>,
                      <>
                        <strong className="font-semibold">Satellite phones.</strong> Not allowed
                        without permission from India&rsquo;s telecom department.
                      </>,
                      <>
                        <strong className="font-semibold">Loose lithium batteries and power banks.</strong>{" "}
                        Carriers treat them as dangerous goods.
                      </>,
                      <>
                        <strong className="font-semibold">Damaged or recalled batteries</strong>, and any
                        device that has one.
                      </>,
                    ]}
                  />
                  <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">
                    See the full list in our{" "}
                    <Link href="/resources/prohibited-items" className={LINK}>
                      prohibited items guide
                    </Link>
                    .
                  </p>
                </>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="How it works"
              title="Shipping electronics to India"
              accent="step by step."
              action={
                <Link href={QUOTE_IN} className="btn btn-primary btn-lg">
                  Get a free quote <ArrowRightIcon size={15} />
                </Link>
              }
            />
          </div>
          <Steps
            steps={[
              {
                title: "Tell us what it is",
                body: "Brand, model, new or used, and the value. Plus the box size and the PIN code in India.",
              },
              {
                title: "We check it",
                body: "We look for battery, BIS or other issues and flag anything before you pack.",
              },
              {
                title: "Pack and pickup",
                body: "Pack it well, with batteries inside the devices. We collect from your door.",
              },
              {
                title: "Customs and delivery",
                body: "Tracked to India. Any duty is paid on arrival, then it is delivered.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related guides" title="More on shipping" accent="to India." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <ProhibitIcon size={22} />,
                title: "Prohibited items",
                body: "What you can't send internationally, and what needs extra paperwork.",
                href: "/resources/prohibited-items",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Shipping to India",
                body: "Our full guide to the route: customs, gifts, and choosing a service.",
                href: "/destinations/india",
              },
              {
                icon: <TagIcon size={22} />,
                title: "Shipping cost to India",
                body: "What sets the price of a shipment to India, and how to pay less.",
                href: "/destinations/india/shipping-cost",
              },
              {
                icon: <EnvelopeSimpleIcon size={22} />,
                title: "Documents to India",
                body: "Passports, certificates and legal papers, sent by express with tracking.",
                href: "/destinations/india/documents",
              },
              {
                icon: <ReceiptIcon size={22} />,
                title: "Customs and duties",
                body: "What customs may charge on arrival, and how to avoid surprises.",
                href: "/resources/customs-duty",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Parcel shipping",
                body: "Boxes of any size, collected from your door and tracked the whole way.",
                href: "/services/parcel-shipping",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Shipping electronics to India: questions"
          faqs={[
            {
              q: "Can I ship a laptop to India from the USA?",
              a: "Yes. Keep the battery inside the laptop, switch it off, and pack it with padding all around. Declare the brand, model, whether it is new or used, and a fair value. Customs duty and GST are usually charged in India on arrival.",
            },
            {
              q: "Do I have to pay customs duty on electronics sent to India?",
              a: "Electronics are generally charged customs duty and GST in India. The amount depends on the item and its declared value. It is usually paid by the receiver on arrival, before delivery. Duty is a government charge and is separate from the shipping price.",
            },
            {
              q: "Can I ship a phone to India?",
              a: "Yes, with the battery inside and the phone switched off. Declare the brand and model. Spare batteries and power banks can't go, because carriers treat loose lithium batteries as dangerous goods.",
            },
            {
              q: "Do electronics need BIS certification for India?",
              a: "Many electronics, including laptops, phones, TVs and cameras, are covered by India's Compulsory Registration Scheme run by the Bureau of Indian Standards. How it applies to a single personal item can vary. Tell us the exact brand and model and we will flag anything that could be a problem before it ships.",
            },
            {
              q: "How do I ship a TV to India?",
              a: "Use the original box and foam if you have them. If not, pad the screen well, keep the TV upright and make sure it can't move. Tell us the screen size and box measurements. Large TVs may need to go as freight rather than as a parcel, and we will tell you which when we quote.",
            },
            {
              q: "Can I send a drone or a satellite phone to India?",
              a: "No. India prohibits drone imports apart from narrow exceptions for approved organizations, and satellite phones are not allowed without permission from India's telecom department. Check our prohibited items guide for other things that can't go.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Sending electronics to India?"
          accent="Get a free quote."
          lead="Tell us the item, the box size and the PIN code. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
