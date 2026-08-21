import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ContinentCard, BrandName } from "@/components/public/continent-card";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import type { DestinationCountry } from "@/components/public/destination-pill-grid";

export const metadata: Metadata = pageMetadata({
  title: "Worldwide Destinations — TYS Global Logistics",
  description: "We ship from the US to over 200 destinations worldwide. Find transit times, restrictions and pricing for your country.",
  path: "/destinations",
});

const ASIA: DestinationCountry[] = [
  { code: "CN", label: "China" },
  { code: "IN", label: "India" },
  { code: "ID", label: "Indonesia" },
  { code: "JP", label: "Japan" },
  { code: "NP", label: "Nepal" },
  { code: "PK", label: "Pakistan" },
  { code: "AE", label: "UAE" },
  { code: "MY", label: "Malaysia" },
  { code: "PH", label: "Philippines" },
  { code: "SG", label: "Singapore" },
  { code: "TW", label: "Taiwan" },
  { code: "TH", label: "Thailand" },
  { code: "KW", label: "Kuwait" },
  { code: "IL", label: "Israel" },
  { code: "SA", label: "Saudi Arabia" },
  { code: "LB", label: "Lebanon" },
];

const AFRICA: DestinationCountry[] = [
  { code: "KE", label: "Kenya" },
  { code: "NG", label: "Nigeria" },
  { code: "ZA", label: "South Africa" },
  { code: "GH", label: "Ghana" },
];

const EUROPE: DestinationCountry[] = [
  { code: "FR", label: "France" },
  { code: "DE", label: "Germany" },
  { code: "IT", label: "Italy" },
  { code: "ES", label: "Spain" },
  { code: "GB", label: "UK" },
  { code: "RU", label: "Russia" },
  { code: "GR", label: "Greece" },
  { code: "FI", label: "Finland" },
  { code: "DK", label: "Denmark" },
  { code: "BE", label: "Belgium" },
  { code: "NO", label: "Norway" },
  { code: "NL", label: "Netherlands" },
  { code: "IE", label: "Ireland" },
  { code: "PL", label: "Poland" },
  { code: "PT", label: "Portugal" },
  { code: "TR", label: "Turkey" },
  { code: "CH", label: "Switzerland" },
  { code: "SE", label: "Sweden" },
  { code: "RO", label: "Romania" },
];

const NORTH_AMERICA: DestinationCountry[] = [
  { code: "CA", label: "Canada" },
  { code: "MX", label: "Mexico" },
  { code: "DO", label: "Dominican-Republic" },
  { code: "HT", label: "Haiti" },
  { code: "JM", label: "Jamaica" },
  { code: "PR", label: "Puerto Rico" },
  { code: "TT", label: "Trinidad & Tobago" },
  { code: "CO", label: "Colombia" },
  { code: "CL", label: "Chile" },
  { code: "BR", label: "Brazil" },
];

const AUSTRALIA_OCEANIA: DestinationCountry[] = [
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
];

export default function DestinationsPage() {
  return (
    <>
      <PageHeroBand title="Worldwide Destinations" />

      <section className="bg-gray-50 px-4 py-12 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <ContinentCard name="Asia" countries={ASIA}>
            <BrandName />{" "}offers reliable international shipping solutions to destinations
            across Asia. Backed by a strong global network and trusted carrier partnerships, we
            provide
            cost-effective parcel delivery and freight services tailored to regional shipping
            requirements. Every shipment includes real-time tracking, giving you complete
            visibility from pickup to final delivery.
          </ContinentCard>

          <ContinentCard name="Africa" countries={AFRICA}>
            Need to ship high-volume or oversized cargo to Africa? <BrandName /> offers reliable
            door-to-door shipping solutions for bulk, commercial, and heavy shipments. With secure
            packaging, specialized handling, and flexible freight options, we ensure your cargo
            reaches its destination safely and on time, regardless of size or weight.
          </ContinentCard>

          <ContinentCard name="Europe" countries={EUROPE}>
            Expand your global reach with <BrandName />
            &rsquo; reliable shipping solutions to Europe. We provide secure domestic and
            international shipping services for both personal and commercial shipments through our
            trusted logistics network. From parcel pickup to doorstep delivery, every shipment is
            handled with care and backed by real-time tracking.
          </ContinentCard>

          <ContinentCard name="North America" countries={NORTH_AMERICA}>
            Reach customers across North America with confidence. <BrandName /> offers dependable
            shipping services for personal and commercial shipments throughout the United States.
            From New York to Los Angeles, Houston to Seattle, our trusted logistics network ensures
            fast, secure, and reliable door-to-door delivery.
          </ContinentCard>

          <ContinentCard name="Australia/Oceania" countries={AUSTRALIA_OCEANIA}>
            Australia and New Zealand are among the most popular shipping destinations in Oceania.{" "}
            <BrandName /> provides reliable international shipping solutions across these markets,
            along with island destinations including Fiji, Papua New Guinea, and American Samoa.
            Backed by our trusted logistics network, we ensure secure, efficient, and door-to-door
            delivery across the region.
          </ContinentCard>
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}
