import type { Metadata } from "next";
import Link from "next/link";
import { PageHeroBand } from "@/components/public/page-hero-band";

export const metadata: Metadata = { title: "Sitemap — TYS Global Logistics" };

// "Book Shipment" and the whole "My Account" group are temporarily hidden —
// see the matching note in site-header.tsx.
const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Main",
    links: [
      { href: "/", label: "Home" },
      { href: "/quotes", label: "Get a Free Quote" },
      { href: "/tracking", label: "Track a Shipment" },
      { href: "/contact-us", label: "Contact Us" },
      { href: "/contact-us/support", label: "Contact Support" },
      { href: "/contact-us/pay", label: "Online Payment" },
    ],
  },
  {
    title: "Destinations",
    links: [
      { href: "/destinations", label: "Worldwide Destinations" },
      { href: "/destinations/moving", label: "Worldwide Moving" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/services/international-relocation", label: "International Relocation" },
      { href: "/services/auto-transport", label: "Auto Transport" },
      { href: "/services/document-shipping", label: "Document Shipping" },
      { href: "/services/parcel-shipping", label: "Parcel Shipping" },
      { href: "/services/freight-forwarding", label: "Freight Forwarding" },
      { href: "/services/domestic-shipping", label: "Domestic Shipping" },
      { href: "/services/domestic-moving", label: "Domestic Moving" },
      { href: "/services/volume-shipping", label: "Volume Shipping" },
      { href: "/services/retailer-shipping", label: "Retailer Shipping" },
      { href: "/services/global-shopper", label: "Global Shopper" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/security", label: "Security" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <PageHeroBand title="Sitemap" subtitle="Every page on the TYS Global Logistics website" />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-brand">{group.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-muted hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
