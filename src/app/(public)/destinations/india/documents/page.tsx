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
  BuildingsIcon,
  CertificateIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  IdentificationCardIcon,
  LaptopIcon,
  PackageIcon,
  ReceiptIcon,
  ScrollIcon,
  SignatureIcon,
  TagIcon,
} from "@phosphor-icons/react/dist/ssr";

// Send documents to India from the USA (new 2026-09-29, SEO page under the
// India guide). Outbound only: papers going from the US to India.
// "What counts as a document" paraphrases the definition in India's Courier
// Imports and Exports (Electronic Declaration and Processing) Regulations,
// 2010 (courier.cbic.gov.in): information on paper, cards or photographs with
// no commercial value, not liable to duty and not prohibited. No transit
// times are promised; timing comes with the quote.

const LINK = "font-medium text-brand hover:underline";
const QUOTE_IN = "/quotes?to_country=IN";

export const metadata: Metadata = pageMetadata({
  title: "Send Documents to India from the USA | TYS Global Logistics",
  description:
    "Send passports, OCI and visa papers, property papers and certificates to India from the USA by express courier, tracked to signature, collected from your door.",
  path: "/destinations/india/documents",
});

export default function IndiaDocumentsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: "Shipping to India", path: "/destinations/india" },
          { name: "Documents to India", path: "/destinations/india/documents" },
        ]}
      />
      <PageHeroBand
        title="Send documents to India"
        accent="from the USA."
        subtitle="Passports, OCI and visa papers, property papers and certificates, sent by express courier with tracking and a signature at the other end."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Documents to India"
          heading="Important papers deserve a safe trip"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "Collected from your home" },
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Free", sub: "Document quote for India" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Real people", sub: "Reply usually within 24 hours" },
          ]}
        >
          <p>
            Some papers are hard or slow to replace. A signed power of attorney for a property sale in
            India. A degree certificate. A passport going back to a family member. When papers like
            these have to reach India, you want to know where they are and who signed for them.
          </p>
          <p>
            We send documents from anywhere in the US to any PIN code in India with FedEx, DHL or UPS,
            collected from your door. See our{" "}
            <Link href="/services/document-shipping" className={LINK}>
              document shipping service
            </Link>{" "}
            for how it works on every route.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What people send"
              title="Documents people send"
              accent="to India."
              lead="If it is paper and it matters, it usually belongs in an express envelope."
            />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <IdentificationCardIcon size={22} />,
                title: "Passports",
                body: "Sending a passport to a family member in India. Always by a tracked service with a signature on delivery.",
              },
              {
                icon: <FileTextIcon size={22} />,
                title: "OCI and visa papers",
                body: "Forms, copies and supporting papers. If they belong to an application, follow the instructions from the office handling it.",
              },
              {
                icon: <SignatureIcon size={22} />,
                title: "Legal and property papers",
                body: "Power of attorney, sale deeds, affidavits and signed agreements for a lawyer or relative in India.",
              },
              {
                icon: <CertificateIcon size={22} />,
                title: "Certificates",
                body: "Birth, marriage and degree certificates, transcripts and other originals.",
              },
              {
                icon: <BuildingsIcon size={22} />,
                title: "Bank and pension papers",
                body: "Signed forms, life certificates and letters for banks and offices in India.",
              },
              {
                icon: <ScrollIcon size={22} />,
                title: "Business papers",
                body: "Contracts, tenders and signed documents for a company or partner in India.",
              },
            ]}
          />
        </Section>

        <TopicScroller
          topics={[
            {
              id: "what-counts-as-a-document",
              title: "What counts as a document",
              lead: "Customs and carriers treat documents differently from goods, so it helps to know the line.",
              content: (
                <Prose>
                  <p>
                    Indian customs rules for courier shipments describe documents as information on
                    paper, cards or photographs that has <strong>no commercial value</strong>. Letters,
                    legal papers, certificates, forms and passports fit that description.
                  </p>
                  <p>
                    Anything with a value of its own is treated as goods, not documents. That includes
                    books, printed items for sale, gift cards and anything else tucked into the
                    envelope. Goods need their own customs declaration and may be charged duty.
                  </p>
                  <p>
                    If you want to send papers and a small gift together, tell us. We will set it up as
                    a parcel so it is declared properly. Our{" "}
                    <Link href="/services/parcel-shipping">parcel shipping</Link> page explains how
                    that works.
                  </p>
                </Prose>
              ),
            },
            {
              id: "courier-or-mail",
              title: "Courier or regular mail?",
              lead: "Both reach India. The difference is speed, tracking and proof of delivery.",
              content: (
                <Prose>
                  <p>
                    <strong>Express courier</strong> (FedEx, DHL or UPS) is the fastest option. You get
                    detailed tracking the whole way and a signature when it is delivered. It is the
                    one we suggest for anything hard to replace, like a passport or an original
                    certificate.
                  </p>
                  <p>
                    <strong>Postal mail</strong> can cost less. Tracking is usually less detailed once
                    the envelope reaches India, and it takes longer. It can suit copies and everyday
                    letters that aren&rsquo;t urgent.
                  </p>
                  <p>Not sure which you need? Tell us what the papers are and when they are needed.</p>
                </Prose>
              ),
            },
            {
              id: "packing-documents",
              title: "Packing your papers",
              lead: "A few minutes of care keeps papers flat, dry and in one piece.",
              content: (
                <Checklist
                  items={[
                    "Keep papers flat. Don't fold certificates or anything with a seal.",
                    "Slip them into a clear plastic sleeve to keep out damp.",
                    "Add a piece of stiff card behind certificates so they don't bend.",
                    "Take photos or copies of everything before it leaves your hands.",
                    "Put only papers in a document envelope. No cash, jewelry or gifts.",
                    "Write down the tracking number and share it with the person in India.",
                  ]}
                />
              ),
            },
            {
              id: "tracking-and-delivery",
              title: "Tracking and delivery",
              lead: "You can follow the envelope from your door to theirs.",
              content: (
                <Prose>
                  <p>
                    With express courier you get a tracking number as soon as it is booked. You can see
                    when it is collected, when it leaves the US, when it clears customs in India and
                    when it is signed for.
                  </p>
                  <p>
                    Give us the receiver&rsquo;s full address with the six-digit PIN code and a phone
                    number that works in India. Carriers often call before delivery, and a wrong or
                    missing number is one of the most common reasons for delays.
                  </p>
                </Prose>
              ),
            },
            {
              id: "how-fast",
              title: "How fast documents reach India",
              lead: "Speed depends on the service you pick and where in India it is going.",
              content: (
                <Prose>
                  <p>
                    Express courier is the quickest way to get papers to India. Big cities are usually
                    the fastest to reach. Smaller towns and remote PIN codes can take a little longer.
                  </p>
                  <p>
                    We don&rsquo;t publish delivery times that might not match your address. When you
                    ask for a quote, we give you the expected timing for your PIN code along with the
                    price, so you can plan around a deadline.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="How it works"
              title="Sending documents to India"
              accent="in four steps."
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
                title: "Tell us about it",
                body: "What the papers are, where in India they are going, and when they need to arrive.",
              },
              {
                title: "Get your options",
                body: "We come back with prices and timing from the carriers that serve that PIN code.",
              },
              {
                title: "Pickup from your door",
                body: "Your envelope is collected from your home or office anywhere in the US.",
              },
              {
                title: "Tracked to signature",
                body: "Follow it all the way. Someone in India signs for it on delivery.",
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
                icon: <EnvelopeSimpleIcon size={22} />,
                title: "Document shipping",
                body: "Our express document service, to India and around the world.",
                href: "/services/document-shipping",
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
                icon: <LaptopIcon size={22} />,
                title: "Electronics to India",
                body: "Laptops, phones and TVs: batteries, BIS rules and duty.",
                href: "/destinations/india/electronics",
              },
              {
                icon: <ReceiptIcon size={22} />,
                title: "Customs and duties",
                body: "What customs may charge on arrival, and how to avoid surprises.",
                href: "/resources/customs-duty",
              },
              {
                icon: <FileTextIcon size={22} />,
                title: "Prohibited items",
                body: "What can't go in an envelope or a box, and what needs extra paperwork.",
                href: "/resources/prohibited-items",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="Sending documents to India: questions"
          faqs={[
            {
              q: "Can I send a passport to India from the USA?",
              a: "Yes. Send it by express courier so it is tracked the whole way and signed for on delivery. Take a photo of the photo page before you send it, and give us a phone number for the receiver that works in India. If the passport is part of an application, follow the instructions from the office handling it.",
            },
            {
              q: "How long does it take to send documents to India?",
              a: "Express courier is the fastest way, and big cities are usually the quickest to reach. Timing depends on the service and the PIN code, so we give you the expected delivery time for your address along with your quote.",
            },
            {
              q: "Do I pay customs duty on documents sent to India?",
              a: "Papers with no commercial value, like letters, certificates and legal papers, are treated as documents rather than goods. Anything with a value of its own, like books or gifts in the same envelope, is treated as goods and may be charged duty. Keep a document envelope to papers only.",
            },
            {
              q: "Is courier or regular mail better for documents to India?",
              a: "For anything hard to replace, express courier is the safer choice. You get detailed tracking and a signature on delivery. Postal mail can cost less and suits copies and everyday letters that aren't urgent.",
            },
            {
              q: "What details do I need for the person receiving it in India?",
              a: "Their full name, full address with the six-digit PIN code, and a phone number that works in India. Carriers often call before delivering, so a working number helps avoid delays.",
            },
            {
              q: "Can I put cash or a small gift in a document envelope?",
              a: "No. A document envelope should hold papers only. Carriers don't accept cash, and a gift makes it a parcel that has to be declared as goods. If you want to send papers and a gift together, tell us and we will set it up as a parcel.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Papers going to India?"
          accent="Get a free quote."
          lead="Tell us what you are sending and the PIN code. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
