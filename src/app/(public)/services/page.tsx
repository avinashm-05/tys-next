import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  HouseIcon,
  CarSimpleIcon,
  FileTextIcon,
  PackageIcon,
  AnchorIcon,
  TruckIcon,
  ScalesIcon,
  StorefrontIcon,
  GlobeIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Our Services — TYS Global Logistics",
  description: "Everything you need to ship, move, or relocate — anywhere in the world.",
  path: "/services",
});

const SERVICES = [
  {
    href: "/services/international-relocation",
    icon: HouseIcon,
    title: "International Relocation",
    body: "Door-to-door relocation for your household and family, anywhere in the world.",
  },
  {
    href: "/services/auto-transport",
    icon: CarSimpleIcon,
    title: "Auto Transport",
    body: "Safe, insured vehicle shipping nationwide.",
  },
  {
    href: "/services/document-shipping",
    icon: FileTextIcon,
    title: "Document Shipping",
    body: "Secure, trackable delivery for time-sensitive paperwork.",
  },
  {
    href: "/services/parcel-shipping",
    icon: PackageIcon,
    title: "Parcel Shipping",
    body: "Ship parcels of any size to nearly 200 destinations worldwide.",
  },
  {
    href: "/services/freight-forwarding",
    icon: AnchorIcon,
    title: "Freight Forwarding",
    body: "Origin and destination services for commercial and household cargo.",
  },
  {
    href: "/services/domestic-shipping",
    icon: TruckIcon,
    title: "Domestic Shipping",
    body: "Fast, affordable shipping across all 50 states.",
  },
  {
    href: "/services/domestic-moving",
    icon: HouseIcon,
    title: "Domestic Moving",
    body: "A simpler way to move within the United States.",
  },
  {
    href: "/services/volume-shipping",
    icon: ScalesIcon,
    title: "Volume Shipping",
    body: "Consistent rates and dedicated support for frequent shippers.",
  },
  {
    href: "/services/retailer-shipping",
    icon: StorefrontIcon,
    title: "Retailer Shipping",
    body: "Fulfillment-ready shipping for retailers and e-commerce brands.",
  },
  {
    href: "/services/global-shopper",
    icon: GlobeIcon,
    title: "Global Shopper",
    body: "Shop US stores with a free U.S. address, shipped anywhere in the world.",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHeroBand
        title="Our Services"
        subtitle="Everything you need to ship, move, or relocate — anywhere in the world."
      />
      <ServiceCtaBanner />

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto grid grid-cols-1 max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-3xl border border-brand-light bg-white p-6 shadow-[0_2px_16px_rgba(16,24,40,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,24,40,0.1)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand">
                <s.icon size={22} />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">{s.title}</h2>
              <p className="mt-1.5 text-sm text-ink-muted">{s.body}</p>
            </Link>
          ))}
        </div>
      </section>


      <TrustedReviewsSection />
    </>
  );
}
