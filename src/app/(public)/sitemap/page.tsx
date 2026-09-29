import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { Reveal } from "@/components/public/home/reveal";
import { CtaBand, LINE, PageBody, Section } from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Sitemap | TYS Global Logistics",
  description:
    "Every page on the TYS Global Logistics website in one place: shipping and moving services, destinations, guides, company pages and legal information.",
  path: "/sitemap",
  noIndex: true,
});

// "Book Shipment" and the whole "My Account" group are temporarily hidden;
// see the matching note in site-header.tsx.
const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Services",
    links: [
      { href: "/services", label: "All services" },
      { href: "/services/international-relocation", label: "International relocation" },
      { href: "/services/auto-transport", label: "Auto transport" },
      { href: "/services/document-shipping", label: "Document shipping" },
      { href: "/services/parcel-shipping", label: "Parcel shipping" },
      { href: "/services/freight-forwarding", label: "Freight forwarding" },
      { href: "/services/domestic-shipping", label: "Domestic shipping" },
      { href: "/services/domestic-moving", label: "Domestic moving" },
      { href: "/services/piano-moving", label: "Piano moving" },
      { href: "/services/baggage-shipping", label: "Baggage shipping" },
      { href: "/services/volume-shipping", label: "Volume shipping" },
      { href: "/services/retailer-shipping", label: "Retailer shipping" },
      { href: "/services/global-shopper", label: "Global shopper" },
      { href: "/services/ship-boxes-internationally", label: "Ship boxes internationally" },
      { href: "/services/packers-and-movers", label: "Packers and movers" },
      { href: "/services/small-business-shipping", label: "Small business shipping" },
      { href: "/services/pallet-shipping", label: "Pallet shipping" },
    ],
  },
  {
    title: "Destinations",
    links: [
      { href: "/destinations", label: "Worldwide destinations" },
      { href: "/destinations/moving", label: "Worldwide moving" },
      { href: "/destinations/uk", label: "Shipping to the UK" },
      { href: "/destinations/india", label: "Shipping to India" },
      { href: "/destinations/india/shipping-cost", label: "USA to India shipping cost" },
      { href: "/destinations/india/documents", label: "Documents to India" },
      { href: "/destinations/india/electronics", label: "Electronics to India" },
      { href: "/destinations/moving/india", label: "Moving to India" },
      { href: "/destinations/canada", label: "Shipping to Canada" },
      { href: "/destinations/pakistan", label: "Shipping to Pakistan" },
      { href: "/destinations/uae", label: "Shipping to the UAE" },
      { href: "/destinations/australia", label: "Shipping to Australia" },
      { href: "/locations", label: "Locations" },
      { href: "/locations/atlanta", label: "Shipping from Atlanta" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "All resources" },
      { href: "/resources/customs-duty", label: "Guide to customs duty" },
      { href: "/resources/prohibited-items", label: "Prohibited shipping items" },
      { href: "/resources/volumetric-weight", label: "Volumetric weight explained" },
      { href: "/shipping-rates", label: "Shipping rates" },
      { href: "/shipping-calculator", label: "Shipping calculator" },
      { href: "/carriers", label: "Major carriers" },
      { href: "/faqs", label: "FAQs" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/about-us", label: "About us" },
      { href: "/quotes", label: "Get a free quote" },
      { href: "/tracking", label: "Track a shipment" },
      { href: "/contact-us", label: "Contact us" },
      { href: "/contact-us/pay", label: "Online payment" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms and conditions" },
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/security", label: "Security" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <PageHeroBand
        quote={false}
        kicker="Sitemap"
        title="Every page,"
        accent="in one place."
        subtitle="Looking for something specific? Start with the group it belongs to."
      />

      <PageBody>
        <Section flush>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {GROUPS.map((group, i) => (
              <Reveal
                key={group.title}
                delay={(i % 3) * 60}
                className={`border-b ${LINE} px-5 py-10 sm:px-10 lg:px-12 ${i % 2 === 0 ? "sm:border-r" : "sm:border-r-0"} ${
                  i % 3 === 2 ? "lg:border-r-0" : "lg:border-r"
                }`}
              >
                <h2 className="text-[20px] font-semibold tracking-[-0.015em] text-ink">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 py-1 text-[15.5px] text-ink-muted transition-colors hover:text-brand"
                      >
                        {link.label}
                        <ArrowRightIcon
                          size={13}
                          className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Section>

        <CtaBand />
      </PageBody>
    </>
  );
}
