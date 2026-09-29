import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceIntro, ServiceFaq } from "@/components/public/service-page-sections";
import { CardGrid, Checklist, CtaBand, PAD, PageBody, Section, SectionHead, SplitSection, Steps } from "@/components/public/page-kit";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  BookOpenTextIcon,
  BriefcaseIcon,
  CertificateIcon,
  GavelIcon,
  IdentificationCardIcon,
  MapPinLineIcon,
  PackageIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "International Document Shipping | TYS Global Logistics",
  description:
    "Send contracts, visa papers and legal filings overseas or across the US by express courier. Discounted FedEx, DHL and UPS rates, tracked to signature.",
  path: "/services/document-shipping",
});

// Renovated 2026-09-29 onto the page kit. The hard "0.5 lb" envelope limit
// was softened: limits vary by carrier and service.
export default function DocumentShippingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Document Shipping", path: "/services/document-shipping" },
        ]}
      />
      <ServiceJsonLd name="Document Shipping" description="Secure, trackable worldwide delivery for contracts, visas, and legal filings." slug="document-shipping" />
      <PageHeroBand
        title="Document shipping"
        accent="you can track to signature."
        subtitle="Contracts, visa applications, legal filings and certificates, sent by express courier from the US to 200+ countries."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Document shipping"
          heading="Send important documents with confidence"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "Trusted", sub: "FedEx, DHL and UPS" },
            { icon: "/frontend/icons/redesign/badge-destinations.svg", label: "200+", sub: "Countries" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "24/7", sub: "Expert support" },
          ]}
        >
          <p>
            Our document shipping service gets contracts, visa papers, legal filings and other
            time-sensitive paperwork where it needs to go, from a single envelope to a full case
            file. Each shipment travels in a carrier express envelope with a tracking number, from
            pickup to signature.
          </p>
          <p>
            Not sure which carrier or service to pick? We&rsquo;ll help you choose, check the weight
            limit, and flag any rules for your destination before you send.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What people send"
              title="Paperwork that"
              accent="can't go missing."
              lead="If it needs to arrive on time and in one piece, it belongs in a tracked express envelope."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <BriefcaseIcon size={22} />,
                title: "Contracts and business papers",
                body: "Signed agreements, tenders and originals your counterparty needs in hand.",
              },
              {
                icon: <IdentificationCardIcon size={22} />,
                title: "Visa and immigration documents",
                body: "Applications and supporting papers that are due at a consulate or embassy by a set date.",
              },
              {
                icon: <GavelIcon size={22} />,
                title: "Legal and court filings",
                body: "Filings, notarized papers and case files where proof of delivery matters.",
              },
              {
                icon: <CertificateIcon size={22} />,
                title: "Certificates and transcripts",
                body: "Degree certificates, transcripts and records for universities and employers abroad.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="How to ship a document" lead="Most people are done in a few minutes." />
          </div>
          <Steps
            steps={[
              {
                title: "Get a quote",
                body: "Enter the sender, the receiver and what you're sending. Compare carriers and delivery dates.",
              },
              {
                title: "Prepare the envelope",
                body: "Put your papers in a carrier express envelope. We'll tell you what's allowed inside.",
              },
              {
                title: "Pickup or drop off",
                body: "Hand it in at a nearby drop-off point, or ask us about a pickup from your door.",
              },
              {
                title: "Track to signature",
                body: (
                  <>
                    Follow it on our{" "}
                    <Link href="/tracking" className="font-medium text-brand underline-offset-4 hover:underline">
                      tracking page
                    </Link>{" "}
                    until someone signs for it.
                  </>
                ),
              },
            ]}
          />
        </Section>

        <SplitSection
          title="Good to know"
          accent="before you ship"
          lead="A few rules decide how fast your documents clear customs, and what you pay."
        >
          <Checklist
            items={[
              "Envelopes with paper only usually clear customs without duties",
              "Keys, jewelry or small gifts turn a document shipment into a parcel and can bring customs charges, so ship those separately",
              "Document envelopes have a weight limit that depends on the carrier and service. We'll check yours before you book",
              <>
                Sending more than paper? Use{" "}
                <Link href="/services/parcel-shipping" className="font-medium text-brand underline-offset-4 hover:underline">
                  parcel shipping
                </Link>{" "}
                instead
              </>,
              "Every shipment gets a tracking number you can follow from pickup to delivery",
            ]}
          />
        </SplitSection>

        <ServiceFaq
          title="Document shipping questions"
          faqs={[
            {
              q: "What's the best way to ship an important document?",
              a: "Send it by express courier in a carrier document envelope. It's one of the fastest and most secure ways to move paperwork, and you get tracking and a signature on delivery.",
            },
            {
              q: "What can I ship in a document envelope?",
              a: "Paper only: contracts, certificates, filings and similar papers. Items like keys or jewelry aren't allowed in a document envelope and can hold up customs, so send them as a parcel.",
            },
            {
              q: "Can I track my document shipment?",
              a: "Yes. Every shipment has a tracking number, so you can follow it from pickup to delivery.",
            },
            {
              q: "Do you offer door pickup for documents?",
              a: "Yes, on most document shipments. Mention it when you request your quote and we'll arrange it.",
            },
            {
              q: "Is there a weight limit for document envelopes?",
              a: "Yes, and it depends on the carrier and the service. If your paperwork runs thick, tell us roughly how much you're sending and we'll pick the right option.",
            },
            {
              q: "Do I pay customs duties on documents?",
              a: "Usually not, if the envelope holds paper only. Anything else inside can be treated as goods and taxed at the destination.",
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Keep reading" title="Related services and guides" />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <PackageIcon size={22} />,
                title: "Parcel shipping",
                body: "For anything that isn't paper. Discounted rates with FedEx, DHL, UPS and USPS.",
                href: "/services/parcel-shipping",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Domestic shipping",
                body: "Envelopes and parcels to any address in the 50 states, ground or express.",
                href: "/services/domestic-shipping",
              },
              {
                icon: <BookOpenTextIcon size={22} />,
                title: "Customs duty guide",
                body: "Why paper-only envelopes usually skip duty, and when they don't.",
                href: "/resources/customs-duty",
              },
              {
                icon: <BookOpenTextIcon size={22} />,
                title: "Prohibited items",
                body: "What can't go in an envelope or a parcel, by carrier and by country.",
                href: "/resources/prohibited-items",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Shipping to India",
                body: "Sending documents to India from the US, from visas to property papers.",
                href: "/destinations/india",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Shipping to the UK",
                body: "Documents and parcels from the US to anywhere in the UK.",
                href: "/destinations/uk",
              },
            ]}
          />
        </Section>

        <TrustedReviewsSection />
        <CtaBand title="Documents ready to go?" accent="Get a free quote." />
      </PageBody>
    </>
  );
}
