import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, GlobeIcon, HeadsetIcon } from "@phosphor-icons/react/dist/ssr";
import { MiniQuoteForm } from "@/components/public/mini-quote-form";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { TrustpilotFullLogo } from "@/components/public/trustpilot-logo";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { ReviewsCarousel } from "@/components/public/reviews-carousel";
import { OfferCard } from "@/components/public/offer-card";

export const metadata: Metadata = pageMetadata({
  title: "International Shipping & Freight Forwarding | TYS Global Logistics",
  description:
    "Ship parcels, documents and freight from anywhere in the US to 200+ countries. Door to door, fully tracked, free quote in minutes.",
  path: "/",
});

// Home page — B1 redesign. Rebuilt section-by-section from the new Figma
// design (see 03_Website/01_Home_and_form/Home_01.png). Copy is transcribed
// from the mockup, except: FAQ answers reuse the site's existing real copy
// (the mockup's own answer text was unrelated placeholder content), and the
// testimonials are original placeholder copy (the mockup used generic stock
// names/photos unrelated to TYS). Images are cropped directly from the
// mockup — see public/frontend/images/redesign/.
export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-light px-4 pb-10 pt-4 sm:pb-16 sm:pt-8 md:px-8">
        {/* One wrapping container for the whole text+card block. The Figma
            source (published Figma Sites link, DOM-inspected directly) has
            only 2 decorative images in the hero — truck top-left, plane
            top-right — starting at the very top (level with the badge, not
            the headline). Container ship + container truck were added at
            the bottom corners (client-supplied SVGs, same design family) so
            all four vehicles frame the hero content and point inward toward
            the center. They're absolutely positioned against this outer
            wrapper so they overlay the badge/headline column's height
            rather than needing their own spacing. */}
        <div className="relative mx-auto max-w-6xl">
          {/* These two are the actual Lighthouse-flagged Desktop LCP element
              (img.pointer-events-none.absolute.right-0.top-0...w-44) —
              "fetchpriority=high should be applied" + "LCP resources should
              not use loading=lazy". But they're also `hidden` below the lg
              breakpoint (1024px) — real phones never paint them. A plain
              loading="lazy" img with display:none never even starts
              fetching (no layout box to judge proximity-to-viewport by), so
              removing lazy site-wide here would silently cost every mobile
              visitor ~99 KiB (58+41 KiB) for two images they'll never see.
              <picture> + a media query keeps that mobile-zero-cost property
              while still letting desktop fetch eagerly at high priority:
              browsers pick (and only fetch) one <source> before any
              request goes out, so under 1024px the img falls through to a
              ~60-byte inline placeholder instead. */}
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet="/frontend/images/redesign/hero-truck.webp"
            />
            <img
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7"
              fetchPriority="high"
              alt=""
              aria-hidden
              draggable={false}
              className="pointer-events-none absolute left-0 top-0 hidden w-36 -scale-x-100 select-none lg:block xl:w-40"
            />
          </picture>
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet="/frontend/images/redesign/hero-plane.webp"
            />
            <img
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7"
              fetchPriority="high"
              alt=""
              aria-hidden
              draggable={false}
              className="pointer-events-none absolute right-0 top-0 hidden w-40 select-none lg:block xl:w-44"
            />
          </picture>
          <img
            loading="lazy"
            src="/frontend/images/redesign/hero-container-truck.svg"
            alt=""
            aria-hidden
            draggable={false}
            className="hero-float-a pointer-events-none absolute bottom-0 left-0 hidden w-32 select-none lg:block xl:w-36"
          />
          <img
            loading="lazy"
            src="/frontend/images/redesign/hero-container-ship.svg"
            alt=""
            aria-hidden
            draggable={false}
            className="hero-float-b pointer-events-none absolute bottom-0 right-0 hidden w-40 select-none opacity-60 lg:block xl:w-44"
          />

          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex w-fit items-center gap-2.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">
              <span className="font-semibold text-ink">Excellent</span>
              <TrustpilotFullLogo />
            </div>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand-dark sm:mt-5">
              Trusted Partner for Logistics &amp; Freight Forwarding
            </p>
            <h1 className="mt-1.5 text-[1.5rem] sm:mt-3 sm:text-[2.5rem] md:text-[2.75rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
              Your Trusted Global Shipping Partner
            </h1>
            {/* Same copy at every breakpoint (kept back on request) — just a
                much smaller, tighter size on mobile (text-xs, leading-snug,
                a narrower max-width so it wraps to fewer lines) so it still
                fits alongside the no-scroll quote-button goal from the
                previous pass. Unchanged on tablet/desktop. Hidden only below
                375px (max-[374px]) — verified live: even at the smallest
                text size this still doesn't leave room for both the tagline
                and a no-scroll quote button on a 320px-wide/568px-tall
                device (original iPhone SE/5 class, effectively legacy at
                this point); every 375px+ phone (the smallest currently-sold
                iPhone, and the vast majority of Android phones) keeps the
                tagline and still fits. */}
            <p className="mx-auto mt-2 max-w-xs text-xs leading-snug text-ink-muted max-[374px]:hidden sm:mt-4 sm:max-w-[885px] sm:text-base sm:leading-normal">
              Ship documents, parcels, freight, vehicles, and household goods with
              confidence. TYS Global Logistics delivers secure domestic and international
              shipping backed by competitive rates and dedicated support.
            </p>
          </div>

          {/* From/To teaser only. The full quote flow is the four-step wizard
              at /quotes again (Location → Package → Details → Contact); this
              hands its two selections over as a prefilled Step 1 rather than
              asking everything on the home page. */}
          <div className="relative mx-auto mt-3 w-full max-w-3xl sm:mt-10">
            <MiniQuoteForm layout="columns" />
          </div>
        </div>

        {/* "Book Shipment" card temporarily hidden — see the matching note in
            site-header.tsx. Grid drops to 2 columns while it's out. */}
        <div className="relative mx-auto mt-14 grid grid-cols-1 max-w-4xl gap-4 sm:grid-cols-2">
          {[
            {
              icon: "/frontend/icons/redesign/quick-track.svg",
              title: "Track A Shipment",
              body: "Monitor your shipment in real time from pickup to final delivery.",
              href: "/tracking",
            },
            {
              icon: "/frontend/icons/redesign/quick-smart.svg",
              title: "Smart Shipments",
              body: "Shipping in bulk? Get personalized pricing & exclusive discounts.",
              href: "/services/retailer-shipping",
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col items-start gap-2 rounded-3xl bg-white p-5 text-left transition hover:-translate-y-0.5"
            >
              <div className="flex w-full items-center gap-3">
                <img loading="lazy" src={card.icon} alt="" className="h-8 w-8 shrink-0" />
                <span className="flex-1 text-xl font-medium leading-[30px] text-black">
                  {card.title}
                </span>
                <ArrowRightIcon
                  size={22}
                  className="shrink-0 text-ink-muted transition group-hover:translate-x-1 group-hover:text-brand"
                />
              </div>
              <span className="text-base leading-7 text-ink-muted">{card.body}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* What We Offer */}
      <section id="services" className="scroll-mt-28 px-4 py-20 md:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
              What We <span className="text-brand">Offer</span>
            </h2>
            <p className="mt-3 text-ink-muted">
              Expand your global reach with TYS Global Logistics&rsquo; reliable domestic
              and international shipping solutions.
            </p>
          </div>

          <div className="mx-auto mt-10 grid grid-cols-1 max-w-6xl gap-6 md:grid-cols-3">
            {[
              {
                icon: "/frontend/icons/redesign/offer-worldwide-shipping.svg",
                title: "Worldwide Shipping",
                body: "Save more with competitive shipping rates from leading courier partners, including FedEx, DHL, UPS, and USPS. Choose flexible shipping solutions that fit your schedule and budget.",
                href: "/services/parcel-shipping",
              },
              {
                icon: "/frontend/icons/redesign/offer-worldwide-moving.svg",
                title: "Worldwide Moving",
                body: "Relocate your family, household belongings, and vehicles with confidence. Enjoy complete, reliable international moving solutions across 200+ destinations worldwide.",
                href: "/services/international-relocation",
              },
              {
                icon: "/frontend/icons/redesign/offer-freight-forwarding.svg",
                title: "Freight Forwarding",
                body: "Ship containers, pallets, and commercial cargo with ease. Choose reliable freight services by air, ocean, rail, or road for shipments of every size, backed by trusted global partners.",
                href: "/services/freight-forwarding",
              },
            ].map((card) => (
              <OfferCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                body={card.body}
                href={card.href}
              />
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Relocation & Auto Transport */}
      <section className="px-4 py-16 md:px-8">
        <ScrollReveal>
          <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-base font-medium uppercase tracking-[1.6px] text-brand">
                For All Movers
              </p>
              <h2 className="mt-2 text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
                Relocation
                <br />
                &amp; Auto Transport
              </h2>
              <p className="mt-4 text-base font-medium leading-7 text-ink-muted">
                From household furniture and personal belongings to cars and motorcycles,
                we handle every move with care, precision, and dependable global
                logistics.
              </p>
              <div className="mt-6 flex gap-4 sm:gap-6">
                {[
                  {
                    icon: "/frontend/icons/redesign/badge-door-to-door.svg",
                    label: "Door-to-Door",
                    sub: "Service",
                  },
                  {
                    icon: "/frontend/icons/redesign/badge-customs.svg",
                    label: "Customs",
                    sub: "Assistance",
                  },
                  {
                    icon: "/frontend/icons/redesign/badge-destinations.svg",
                    label: "200+",
                    sub: "Destinations",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light">
                      <img
                        loading="lazy"
                        src={s.icon}
                        alt=""
                        className="h-[27px] w-auto self-center"
                      />
                    </span>
                    <span className="text-xs font-semibold">
                      <span className="block font-semibold text-ink">{s.label}</span>
                      <span className="text-ink-muted">{s.sub}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Image
              loading="lazy"
              src="/frontend/images/redesign/feature-relocation.webp"
              alt="Relocation and auto transport"
              width={1506}
              height={1044}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="w-full h-auto rounded-3xl"
            />
          </div>

          <div className="mx-auto mt-10 grid grid-cols-1 max-w-6xl gap-6 md:grid-cols-2">
            {[
              {
                icon: "/frontend/icons/redesign/card-international-relocation.svg",
                title: "International Relocation",
                body: "Seamless door-to-door relocation for your household, furniture, and personal belongings.",
                href: "/services/international-relocation",
              },
              {
                icon: "/frontend/icons/redesign/card-auto-transport.svg",
                title: "Auto Transport",
                body: "Dependable, insured shipping for cars, motorcycles, and other vehicles anywhere in the world.",
                href: "/services/auto-transport",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="flex flex-col items-center gap-5 rounded-3xl bg-white p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(16,24,40,0.16)] sm:flex-row sm:items-start sm:text-left"
              >
                <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-brand-light">
                  <img
                    loading="lazy"
                    src={c.icon}
                    alt=""
                    className="h-8 w-auto self-center"
                  />
                </span>
                <div className="flex flex-col items-center gap-1 sm:items-start">
                  <h3 className="text-2xl font-semibold leading-[30px] text-ink">
                    {c.title}
                  </h3>
                  <p className="text-base font-medium text-ink-muted">{c.body}</p>
                  <Link
                    href={c.href}
                    className="mt-1 inline-flex w-fit items-center gap-1 text-sm text-brand"
                  >
                    Learn More <span className="sr-only"> about {c.title}</span>{" "}
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/quotes"
            className="mx-auto mt-8 flex max-w-6xl items-center justify-end gap-2 btn-shine rounded-3xl bg-gradient-to-r from-brand/50 to-brand px-10 py-8 text-2xl font-semibold text-white transition duration-300 hover:scale-[1.01] hover:opacity-95"
          >
            Get a Free Quote <ArrowRightIcon size={26} />
          </Link>
        </ScrollReveal>
      </section>

      {/* Document & Parcel Shipping */}
      <section className="px-4 py-16 md:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-brand-light p-8 md:p-14">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
              <Image
                loading="lazy"
                src="/frontend/images/redesign/feature-docparcel.webp"
                alt="Document and parcel shipping"
                width={938}
                height={750}
                sizes="(min-width: 768px) 384px, 100vw"
                className="w-full h-auto max-w-sm justify-self-center rounded-3xl md:order-1"
              />
              <div>
                <p className="text-base font-medium uppercase tracking-[1.6px] text-brand">
                  For All Shippers
                </p>
                <h2 className="mt-2 text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
                  Document and Parcel Shipping
                </h2>
                <p className="mt-4 text-base font-medium leading-7 text-ink-muted">
                  Save up to 70% on domestic and international shipping with discounted
                  rates from trusted carriers like FedEx, DHL, UPS, and USPS.
                </p>
                <div className="mt-6 flex gap-4 sm:gap-6">
                  {[
                    {
                      icon: "/frontend/icons/redesign/badge-best-rates.svg",
                      label: "Best Rates",
                      sub: "Up to 70% Discount",
                    },
                    {
                      icon: "/frontend/icons/redesign/badge-trusted-carriers.svg",
                      label: "Trusted Carriers",
                      sub: "FedEx, DHL, UPS, USPS",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white">
                        <img
                          loading="lazy"
                          src={s.icon}
                          alt=""
                          className="h-[27px] w-auto self-center"
                        />
                      </span>
                      <span className="text-xs font-semibold">
                        <span className="block font-semibold text-ink">{s.label}</span>
                        <span className="text-ink-muted">{s.sub}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                {
                  icon: "/frontend/icons/redesign/card-document-shipping.svg",
                  title: "Document Shipping",
                  body: "Secure worldwide delivery for important documents with real-time tracking.",
                  href: "/services/document-shipping",
                },
                {
                  icon: "/frontend/icons/redesign/card-parcel-shipping.svg",
                  title: "Parcel Shipping",
                  body: "Ship parcels of any size with fast, reliable, and cost-effective international delivery options.",
                  href: "/services/parcel-shipping",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="flex flex-col items-center gap-5 rounded-3xl bg-white p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(16,24,40,0.16)] sm:flex-row sm:items-start sm:text-left"
                >
                  <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-brand-light">
                    <img
                      loading="lazy"
                      src={c.icon}
                      alt=""
                      className="h-8 w-auto self-center"
                    />
                  </span>
                  <div className="flex flex-col items-center gap-1 sm:items-start">
                    <h3 className="text-2xl font-semibold leading-[30px] text-ink">
                      {c.title}
                    </h3>
                    <p className="text-base font-medium text-ink-muted">{c.body}</p>
                    <Link
                      href={c.href}
                      className="mt-1 inline-flex w-fit items-center gap-1 text-sm text-brand"
                    >
                      Learn More <span className="sr-only"> about {c.title}</span>{" "}
                      <ArrowRightIcon size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/quotes"
              className="mt-8 flex w-full items-center justify-end gap-2 btn-shine rounded-3xl bg-gradient-to-r from-brand/50 to-brand px-10 py-8 text-2xl font-semibold text-white transition duration-300 hover:scale-[1.01] hover:opacity-95"
            >
              Get a Free Quote <ArrowRightIcon size={26} />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Volume & Business Shipping */}
      <section className="px-4 py-16 md:px-8">
        <ScrollReveal>
          <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-base font-medium uppercase tracking-[1.6px] text-brand">
                Business Only
              </p>
              <h2 className="mt-2 text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
                Volume &amp; Business Shipping
              </h2>
              <p className="mt-4 text-base font-medium leading-7 text-ink-muted">
                Power your global supply chain with integrated freight, customs,
                warehousing, and transportation solutions.
              </p>
              <div className="mt-6 flex gap-4 sm:gap-6">
                {[
                  {
                    icon: "/frontend/icons/redesign/badge-priority-support.svg",
                    label: "Priority Support",
                    sub: "Dedicated support for businesses",
                  },
                  {
                    icon: "/frontend/icons/redesign/badge-business-accounts.svg",
                    label: "Business Accounts",
                    sub: "Manage all your shipments in one place",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light">
                      <img
                        loading="lazy"
                        src={s.icon}
                        alt=""
                        className="h-[27px] w-auto self-center"
                      />
                    </span>
                    <span className="text-xs font-semibold">
                      <span className="block font-semibold text-ink">{s.label}</span>
                      <span className="text-ink-muted">{s.sub}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Image
              loading="lazy"
              src="/frontend/images/redesign/feature-volume-truck.webp"
              alt="Volume and business shipping"
              width={1252}
              height={834}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="w-full h-auto rounded-3xl"
            />
          </div>

          <div className="mx-auto mt-10 grid grid-cols-1 max-w-6xl gap-6 md:grid-cols-2">
            {[
              {
                icon: "/frontend/icons/redesign/card-volume-shipping.svg",
                title: "Volume Shipping",
                body: "Exclusive pricing and flexible shipping solutions for businesses with high-volume shipments.",
                href: "/services/volume-shipping",
              },
              {
                icon: "/frontend/icons/redesign/card-retailer-shipping.svg",
                title: "Retailer Shipping",
                body: "Customized logistics solutions designed for retailers and e-commerce businesses of every size.",
                href: "/services/retailer-shipping",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="flex flex-col items-center gap-5 rounded-3xl bg-white p-6 text-center shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(16,24,40,0.16)] sm:flex-row sm:items-start sm:text-left"
              >
                <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-brand-light">
                  <img
                    loading="lazy"
                    src={c.icon}
                    alt=""
                    className="h-8 w-auto self-center"
                  />
                </span>
                <div className="flex flex-col items-center gap-1 sm:items-start">
                  <h3 className="text-2xl font-semibold leading-[30px] text-ink">
                    {c.title}
                  </h3>
                  <p className="text-base font-medium text-ink-muted">{c.body}</p>
                  <Link
                    href={c.href}
                    className="mt-1 inline-flex w-fit items-center gap-1 text-sm text-brand"
                  >
                    Learn More <span className="sr-only"> about {c.title}</span>{" "}
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/quotes"
            className="mx-auto mt-8 flex max-w-6xl items-center justify-end gap-2 btn-shine rounded-3xl bg-gradient-to-r from-brand/50 to-brand px-10 py-8 text-2xl font-semibold text-white transition duration-300 hover:scale-[1.01] hover:opacity-95"
          >
            Get a Free Quote <ArrowRightIcon size={26} />
          </Link>
        </ScrollReveal>
      </section>

      {/* Enterprise Logistics Solution */}
      <section className="px-4 py-16 md:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-brand-light p-8 md:p-14">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
              <Image
                loading="lazy"
                src="/frontend/images/redesign/feature-enterprise-ship.webp"
                alt="Enterprise logistics solution"
                width={1204}
                height={802}
                sizes="(min-width: 768px) 384px, 100vw"
                className="w-full h-auto max-w-sm justify-self-center rounded-3xl md:order-1"
              />
              <div>
                <p className="text-base font-medium uppercase tracking-[1.6px] text-brand">
                  For All Freight
                </p>
                <h2 className="mt-2 text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
                  Enterprise Logistics Solution
                </h2>
                <p className="mt-4 text-base font-medium leading-7 text-ink-muted">
                  End-to-end freight and supply chain solutions for imports, exports, and
                  commercial cargo, backed by reliable global logistics expertise.
                </p>
                <div className="mt-6 flex gap-4 sm:gap-6">
                  {[
                    {
                      icon: HeadsetIcon,
                      label: "Dedicated Manager",
                      sub: "One point of contact",
                    },
                    {
                      icon: GlobeIcon,
                      label: "Global Reach",
                      sub: "Import & export coverage",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white">
                        <s.icon size={27} className="text-brand" />
                      </span>
                      <span className="text-xs font-semibold">
                        <span className="block font-semibold text-ink">{s.label}</span>
                        <span className="text-ink-muted">{s.sub}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/quotes"
              className="mt-8 flex w-full items-center justify-end gap-2 btn-shine rounded-3xl bg-gradient-to-r from-brand/50 to-brand px-10 py-8 text-2xl font-semibold text-white transition duration-300 hover:scale-[1.01] hover:opacity-95"
            >
              Get a Free Quote <ArrowRightIcon size={26} />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Global Shopper */}
      <section className="px-4 py-16 md:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-base font-medium uppercase tracking-[1.6px] text-brand">
              Shop US Stores and Ship Worldwide
            </p>
            <h2 className="mt-2 text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
              Global Shopper
            </h2>
            <p className="mt-3 text-ink-muted">
              Receive a free U.S. address, shop from trusted brands, and let TYS Global
              Logistics consolidate and deliver your purchases worldwide.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-3 gap-4 sm:grid-cols-5 sm:gap-5 md:grid-cols-9 md:gap-4">
            {[
              { slug: "amazon", label: "Amazon" },
              { slug: "walmart", label: "Walmart" },
              { slug: "apple", label: "Apple" },
              { slug: "zappos", label: "Zappos" },
              { slug: "disney", label: "Disney" },
              { slug: "carters", label: "Carter's" },
              { slug: "boots", label: "Boots" },
              { slug: "oshkosh", label: "OshKosh" },
              { slug: "mands", label: "M&S" },
              { slug: "6pm", label: "6pm" },
              { slug: "ebay", label: "eBay" },
              { slug: "shein", label: "Shein" },
              { slug: "ipsy", label: "Ipsy" },
              { slug: "ae", label: "American Eagle" },
              { slug: "asos", label: "ASOS" },
              { slug: "forever21", label: "Forever 21" },
              { slug: "johnlewis", label: "John Lewis" },
              { slug: "gap", label: "Gap" },
            ].map(({ slug, label }) => (
              <div
                key={slug}
                className="flex aspect-square items-center justify-center rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(16,24,40,0.06)]"
              >
                <img
                  loading="lazy"
                  src={`/frontend/images/redesign/brand-logos/${slug}.png`}
                  alt={label}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/services/global-shopper"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Sign Up &amp; Get Free US Address <ArrowRightIcon size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* About TYS stats + Need a Quote */}
      <section id="about" className="scroll-mt-28 px-4 py-8 md:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-brand-light p-8 md:p-14">
            <div className="text-center">
              <p className="text-base font-medium uppercase tracking-[1.6px] text-brand">
                Why Shippers Choose Us
              </p>
              <h2 className="mt-2 text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
                About TYS Global Logistics
              </h2>
              <p className="mt-2 text-ink-muted">
                Our name reflects our commitment: Trust Your Shipment, every step of the
                way.
              </p>
            </div>

            <div className="stats-grid mt-10 items-center gap-x-6 gap-y-8 sm:gap-x-12 md:gap-x-10 md:gap-y-0">
              <Image
                loading="lazy"
                src="/frontend/images/redesign/about-stats-illustration.webp"
                alt=""
                aria-hidden
                width={1110}
                height={740}
                sizes="(min-width: 1024px) 320px, (min-width: 768px) 256px, (min-width: 640px) 208px, 160px"
                className="h-auto w-40 [grid-area:img] justify-self-center sm:w-52 md:w-64 lg:w-80"
              />
              <Stat
                value="200+"
                label="Countries Worldwide"
                className="border-b border-[#dedede] pb-4 [grid-area:s1] sm:pb-6"
              />
              <Stat
                value="900+"
                label="Trusted Carrier Networks"
                className="border-b border-[#dedede] pb-4 [grid-area:s2] sm:pb-6"
              />
              <Stat
                value="70%"
                label="Shipping Savings"
                className="border-b border-[#dedede] py-4 [grid-area:s3] sm:py-6"
              />
              <Stat
                value="100%"
                label="Shipment Visibility"
                className="border-b border-[#dedede] py-4 [grid-area:s4] sm:py-6"
              />
              <Stat
                value="24/7"
                label="Expert Support"
                className="pt-4 [grid-area:s5] sm:pt-6"
              />
              <Stat
                value="500+"
                label="Shipments Delivered"
                className="pt-4 [grid-area:s6] sm:pt-6"
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="px-4 py-16 md:px-8">
        <ScrollReveal>
          <div className="mx-auto grid grid-cols-1 max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-base font-medium uppercase tracking-[1.6px] text-brand">
                500+ Shipments Delivered
              </p>
              <h2 className="mt-2 text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
                Need A Quote? Takes 30 Seconds.
              </h2>
              <p className="mt-4 text-base font-medium leading-7 text-ink-muted">
                As your trusted logistics service provider, we can help you and your
                customer with all shipping and moving services within the USA and
                worldwide.
              </p>
              <div className="mt-6 max-w-sm rounded-2xl border border-brand-light p-5">
                <MiniQuoteForm />
              </div>
            </div>
            <img
              loading="lazy"
              src="/frontend/images/redesign/need-quote-photo.webp"
              alt="Courier handing a package to a customer"
              className="w-full rounded-3xl"
            />
          </div>
        </ScrollReveal>
      </section>

      {/* Reviews */}
      <section className="px-4 py-16 md:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
              See Our <span className="text-brand">Trusted</span> Reviews
            </h2>
            <p className="mt-3 text-ink-muted">
              Every shipment tells a story. Read what our customers have to say about
              their experience with TYS Global Logistics.
            </p>
          </div>
          <div className="mt-10">
            <ReviewsCarousel
              reviews={[
                {
                  name: "M. Alvarez",
                  role: "Small Business Owner",
                  quote:
                    "Our freight arrived faster than the original estimate and the team kept us updated the whole way. Booking again for our next shipment.",
                },
                {
                  name: "J. Whitfield",
                  role: "Relocating Customer",
                  quote:
                    "Moving overseas felt overwhelming until TYS took over. Door-to-door pickup, clear pricing, and everything arrived intact.",
                },
                {
                  name: "R. Okafor",
                  role: "E-commerce Retailer",
                  quote:
                    "Volume shipping rates saved us real money this quarter, and their support team answers fast whenever we have a question.",
                },
                {
                  name: "D. Martins",
                  role: "Auto Import Dealer",
                  quote:
                    "Shipped three vehicles across two continents without a single delay. Clear communication at every step of the process.",
                },
                {
                  name: "S. Park",
                  role: "Online Store Owner",
                  quote:
                    "Parcel shipping used to eat into our margins. TYS cut our rates and our customers still get tracking updates in real time.",
                },
              ]}
            />
          </div>
        </ScrollReveal>
      </section>

      {/* FAQ — same DEFAULT_FAQS content as /faqs (a homepage teaser of the
          full FAQ page), but the FAQPage JSON-LD is only emitted on /faqs
          itself. Two pages emitting identical FAQPage structured data is
          duplicate content for rich-result purposes; /faqs is the canonical
          page for that eligibility. */}
      <section id="faq" className="scroll-mt-28 px-4 pb-20 md:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-ink-muted">
              As your trusted logistics service provider, we can help you and your
              customer with all shipping and moving services.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <FaqAccordion />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}

function Stat({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[28px] font-medium leading-[36px] text-ink sm:text-[34px] sm:leading-[44px] md:text-[40px] md:leading-[64px]">
        {value}
      </div>
      <div className="text-sm font-medium text-ink-muted sm:text-base">{label}</div>
    </div>
  );
}
