import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CalculatorIcon, MapPinAreaIcon, PackageIcon, PhoneIcon, QuestionIcon, TruckIcon } from "@phosphor-icons/react/dist/ssr";
import { CardGrid, PAD, PageBody, Section, SectionHead } from "@/components/public/page-kit";

export const metadata: Metadata = {
  title: "Page Not Found | TYS Global Logistics",
  robots: { index: false, follow: true },
};

// 404, in the site's design (2026-09-29). Replaces Next's bare default
// ("404 | This page could not be found."), which dropped visitors on a
// blank white page with no way back. Shown for unknown URLs (via the
// catch-all [...missing] route) and anything that calls notFound(), like a
// blog post that no longer exists.
export default function NotFound() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F9FF_55%,#EDF3FF_100%)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#C9D8F2_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(60%_70%_at_50%_100%,#000,transparent)] opacity-60"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-14 text-center md:px-8 md:pb-20 md:pt-20">
          <span className="tag">Error 404</span>
          <h1 className="mx-auto mt-5 max-w-[720px] text-balance text-[2.3rem] font-bold leading-[1.04] tracking-[-0.035em] text-ink sm:text-[3rem] lg:text-[3.4rem]">
            This page took <span className="text-brand">a wrong turn.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-balance text-[17px] leading-relaxed text-[#3D4656] sm:text-[18px]">
            The link may be old, or the page has moved. Everything else is right where you left it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary btn-lg group w-full sm:w-auto">
              Back to the home page <ArrowRightIcon size={15} />
            </Link>
            <a href="tel:+14047938759" className="btn btn-secondary btn-lg w-full sm:w-auto">
              <PhoneIcon size={15} /> +1 (404) 793-8759
            </a>
          </div>
        </div>
      </section>

      <PageBody>
        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Popular pages" title="Maybe you were looking for" accent="one of these." />
          </div>
          <div className="-mb-px">
            <CardGrid
              columns={4}
              cards={[
                { icon: <CalculatorIcon size={22} />, title: "Get a free quote", body: "Tell us what you're sending and where. It takes about a minute.", href: "/quotes" },
                { icon: <MapPinAreaIcon size={22} />, title: "Track a shipment", body: "Check where your parcel is with your tracking number.", href: "/tracking" },
                { icon: <PackageIcon size={22} />, title: "Our services", body: "Parcels, documents, baggage, moves, cars and freight.", href: "/services" },
                { icon: <QuestionIcon size={22} />, title: "Common questions", body: "Transit times, customs, packing and payments.", href: "/faqs" },
              ]}
            />
          </div>
        </Section>
        <Section flush>
          <div className={`flex flex-col items-start gap-4 py-12 sm:flex-row sm:items-center sm:justify-between ${PAD}`}>
            <p className="flex items-center gap-3 text-[17px] text-ink">
              <TruckIcon size={22} className="shrink-0 text-brand" />
              Still can&rsquo;t find it? A real person can help.
            </p>
            <Link href="/contact-us" className="btn btn-secondary btn-lg">
              Contact us <ArrowRightIcon size={15} />
            </Link>
          </div>
        </Section>
      </PageBody>
    </>
  );
}
