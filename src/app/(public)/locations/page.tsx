import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { PhoneIcon, EnvelopeSimpleIcon, MapPinIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Locations — TYS Global Logistics",
  description: "TYS Global Logistics is based in Atlanta, Georgia, with nationwide US collection. Find your nearest pickup option.",
  path: "/locations",
});

export default function LocationsPage() {
  return (
    <>
      <PageHeroBand title="Our Locations" subtitle="Where to find us" />
      <ServiceCtaBanner />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-brand-light bg-white p-8 text-center shadow-[0_2px_16px_rgba(16,24,40,0.04)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale">
            <MapPinIcon size={26} className="text-brand" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-ink">TYS Global Logistics HQ</h2>
          <p className="mt-2 text-ink-muted">6111 Morgan Pl Ct NE, Atlanta, GA 30324, USA</p>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <a href="tel:+14047938759" className="flex items-center gap-2 font-semibold text-brand">
              <PhoneIcon size={16} /> +1 (404) 793-8759
            </a>
            <a
              href="mailto:sales@tysgloballogistics.com"
              className="flex items-center gap-2 font-semibold text-brand"
            >
              <EnvelopeSimpleIcon size={16} /> sales@tysgloballogistics.com
            </a>
          </div>
        </div>
      </section>


      <TrustedReviewsSection />
    </>
  );
}
