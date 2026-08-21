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

      {/* Expanded from 262 words (audit, 2026-08-21). Local search is the one
          area a national freight-forwarding competitor cannot structurally
          out-rank us, so the Atlanta base and the nationwide collection model
          both need to be stated in indexable body copy rather than implied by
          an address block alone. Every claim here is already true elsewhere
          on the site — nothing new is asserted. */}
      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">
            Based in Atlanta, collecting nationwide
          </h2>
          <div className="mt-4 space-y-4 text-ink-muted">
            <p>
              Our operation is headquartered in Atlanta, Georgia. Atlanta is one of the
              best-connected freight hubs in the United States — Hartsfield-Jackson handles more
              international cargo than almost any other US airport, and the interstate network
              running through the city reaches most of the South East within a day&rsquo;s drive.
              That is a large part of why we are based here.
            </p>
            <p>
              You do not need to be in Georgia to ship with us. We arrange collection from
              residential and commercial addresses across all fifty states through our carrier
              partners, so for most customers the whole process happens at their own door — we
              book the collection, the driver arrives, and the shipment joins the network. There
              is no requirement to drop anything off, and no need to visit us in person.
            </p>
            <p>
              If you are local to Atlanta and would rather hand your shipment over directly, or
              you want to talk through a complex move face to face, call ahead on{" "}
              <a href="tel:+14047938759" className="text-brand hover:underline">
                +1 (404) 793-8759
              </a>{" "}
              and we will arrange a time.
            </p>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-ink md:text-3xl">Where we ship</h2>
          <div className="mt-4 space-y-4 text-ink-muted">
            <p>
              From that single US base we ship to more than 200 destinations worldwide —
              parcels, documents, household goods, vehicles and commercial freight. Transit
              times and customs requirements vary by destination, so the{" "}
              <a href="/destinations" className="text-brand hover:underline">
                destinations guide
              </a>{" "}
              covers what to expect country by country.
            </p>
            <p>
              For domestic moves within the United States we handle both{" "}
              <a href="/services/domestic-shipping" className="text-brand hover:underline">
                domestic shipping
              </a>{" "}
              and{" "}
              <a href="/services/domestic-moving" className="text-brand hover:underline">
                domestic moving
              </a>
              , collected and delivered door to door.
            </p>
          </div>
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}
