import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { Reveal } from "@/components/public/home/reveal";
import { BrandMark, CARRIERS } from "@/components/public/home/brand-logos";
import {
  CardGrid,
  Checklist,
  CtaBand,
  LINE,
  PAD,
  PageBody,
  Section,
  SectionHead,
  SplitSection,
  Steps,
} from "@/components/public/page-kit";
import { EnvelopeSimpleIcon, PackageIcon, StackIcon } from "@phosphor-icons/react/dist/ssr";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Major Carriers: FedEx, DHL, UPS, USPS | TYS Global Logistics",
  description:
    "Book FedEx, DHL, UPS and USPS through TYS Global Logistics at rates below the retail counter. Same carrier networks and tracking, up to 70% lower cost.",
  path: "/carriers",
});

// The carriers are shown with their official marks from Simple Icons (the
// same CC0 set the home page's logo wall uses), in ink. No hover effect,
// since the tiles aren't links. Slugs match CARRIERS in brand-logos.tsx.
const CARRIER_NOTES: Record<string, { name: string; body: string }> = {
  fedex: { name: "FedEx", body: "Fast, reliable express and ground delivery, at home and worldwide." },
  dhl: { name: "DHL", body: "A trusted name for international express and customs handling." },
  ups: { name: "UPS", body: "Dependable ground and air delivery across the US and abroad." },
  usps: { name: "USPS", body: "Cost-effective delivery with wide domestic and international reach." },
};

export default function CarriersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Our Carriers", path: "/carriers" },
        ]}
      />
      <PageHeroBand
        title="Major carriers,"
        accent="for less."
        subtitle="We book FedEx, DHL, UPS and USPS for you at rates below their retail counter price. Same networks, same tracking, lower cost."
      />

      <PageBody>
        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead
              kicker="Our carriers"
              title="The major carriers"
              accent="you already know."
              lead="Four global networks, one place to book them. We pick the one that suits each shipment."
            />
          </div>
          <div className={`-mb-px grid grid-cols-1 border-t ${LINE} sm:grid-cols-2 lg:grid-cols-4`}>
            {CARRIERS.map((c, i) => {
              const note = CARRIER_NOTES[c.slug];
              return (
                <Reveal
                  key={c.slug}
                  delay={i * 60}
                  className={`border-b ${LINE} p-6 sm:p-8 ${i % 2 === 0 ? "sm:border-r" : ""} ${i < 3 ? "lg:border-r" : "lg:border-r-0"}`}
                >
                  <div className="flex h-28 items-center justify-center rounded-2xl bg-[#F5F8FE] [background-image:radial-gradient(#DCE5F5_1px,transparent_1px)] [background-size:14px_14px]">
                    <BrandMark
                      icon={c}
                      title={note?.name ?? c.title}
                      className="h-9 w-auto max-w-[60%] text-ink/80"
                    />
                  </div>
                  <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.015em] text-ink">{note?.name ?? c.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{note?.body}</p>
                </Reveal>
              );
            })}
          </div>
        </Section>

        <SplitSection
          kicker="Why book through us"
          title="Not tied to"
          accent="one carrier."
          lead="Carriers sell to the public at a retail counter price. We book the same services at our own rates and pass the savings on."
        >
          <Checklist
            items={[
              "We compare the carriers on speed, cost and reliability for your shipment",
              "You save up to 70% compared with the retail counter price",
              "Your shipment moves on the carrier's own network, with the carrier's own tracking",
              "One team to call if anything needs sorting, whichever carrier it's with",
            ]}
          />
        </SplitSection>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead kicker="How it works" title="From quote to doorstep" lead="Booking a major carrier through TYS takes a few minutes." />
          </div>
          <div className="-mb-px">
            <Steps
              steps={[
                { title: "Tell us what you're sending", body: "Where it's going, what it is and roughly how big. The quote form takes about 30 seconds." },
                { title: "We compare the carriers", body: "We look at FedEx, DHL, UPS and USPS and find the best balance of speed and price." },
                { title: "Book at our rate", body: "You pay our discounted rate, not the retail counter price." },
                { title: "Track it on their network", body: "You get a tracking number and can follow it from pickup to delivery." },
              ]}
            />
          </div>
        </Section>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead kicker="Ship with them" title="What you can send" accent="with the majors." />
          </div>
          <div className="-mb-px">
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: <PackageIcon size={22} />,
                  title: "Parcel shipping",
                  body: "Boxes and packages worldwide at discounted FedEx, DHL, UPS and USPS rates.",
                  href: "/services/parcel-shipping",
                },
                {
                  icon: <EnvelopeSimpleIcon size={22} />,
                  title: "Document shipping",
                  body: "Important papers sent tracked, with express options when it's urgent.",
                  href: "/services/document-shipping",
                },
                {
                  icon: <StackIcon size={22} />,
                  title: "Volume shipping",
                  body: "Ship regularly? A business account gets better rates as you ship more.",
                  href: "/services/volume-shipping",
                },
              ]}
            />
          </div>
        </Section>

        <TrustedReviewsSection />
        <CtaBand />
      </PageBody>
    </>
  );
}
