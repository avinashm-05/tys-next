import type { Metadata } from "next";
import type { Icon } from "@phosphor-icons/react";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import {
  AirplaneTiltIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BoatIcon,
  CarProfileIcon,
  ChatsCircleIcon,
  CheckIcon,
  EnvelopeSimpleIcon,
  HouseLineIcon,
  PackageIcon,
  ShippingContainerIcon,
  StorefrontIcon,
  MapPinAreaIcon,
  PhoneIcon,
  StackIcon,
  StarIcon,
  TrainIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { MiniQuoteForm } from "@/components/public/mini-quote-form";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { GoogleRatingPill } from "@/components/public/google-reviews";
import { GoogleReviewsStrip } from "@/components/public/google-reviews-strip";
import { Reveal } from "@/components/public/home/reveal";
import { HeroGlobe } from "@/components/public/home/hero-globe";
import { BrandMark, CARRIERS, STORES } from "@/components/public/home/brand-logos";

export const metadata: Metadata = pageMetadata({
  title: "International Shipping & Freight Forwarding | TYS Global Logistics",
  description:
    "Ship parcels, documents and freight from anywhere in the US to 200+ countries. Door to door, fully tracked, free quote in minutes.",
  path: "/",
});

// Home page, 2026-09-29 redesign, settled through a pick-list with the user:
// - Structure: the original home page, section for section.
// - Hero: Google rating, clear headline and a heavy, focused quote card
//   beside a globe of real US routes. Kept deliberately uncluttered.
// - Service cards, stats and the logo wall: Attio's hairline grids.
// - Quick cards: ticket stubs, finished the Attio way.
// - The four service sections: SFL's simplicity (headline, one line, the
//   two sub-service buttons, one photo), no badge rows.
// Trust comes from real Google reviews only (lib/google-reviews.ts).
// Copy contains no em dashes; keep it that way.

const PAD = "px-5 sm:px-10 lg:px-14";
// Hairline colour comes from --line (globals.css) so it can shift with the
// page colour when the page goes to night, instead of glaring light grey.
const LINE = "border-[var(--line)]";
const H2 = "text-[2rem] leading-[1.05] tracking-[-0.035em] text-ink sm:text-[2.6rem]";
const LEAD = "mt-4 max-w-xl text-pretty text-[17px] leading-relaxed text-ink-muted";

// The hero headline, word by word, for the landing entrance.
const HERO_WORDS = [
  { text: "Your" },
  { text: "trusted" },
  { text: "global", accent: true },
  { text: "shipping", accent: true },
  { text: "partner." },
];

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ----------
          Centered (picked 2026-09-29, like SFL and Jio): rating, headline,
          one paragraph, then the wide From / To bar as the centerpiece.
          - Starts white under the white nav bar so the two read as one
            surface, and fades back to white at the bottom so the page
            flows on with no hard edge.
          - A planet rises under the quote bar (Attio's horizon, in TYS
            blue): the dotted globe with its US routes, a glowing rim, and
            the quick cards resting on its surface. It sits below the text,
            so it never fights the headline for contrast.
          - Kept quiet on purpose: the globe is a soft backdrop, not a
            feature competing with the quote bar. */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_35%,#EDF3FF_70%,#FFFFFF_100%)]">
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-6 text-center sm:pt-12 md:px-8 lg:pt-16">
          {/* Landing entrance (2026-09-30, "should be special"): one
              choreographed sequence, about 1.5s. The planet rises and its rim
              lights up, the headline's words flip up one by one, the line
              and the quote bar follow, and the bar gives a single blue ping. About 1.1s
              (sped up ~30% on 2026-09-30 at the owner's request). All CSS (.hero-* in globals.css), so it starts with the first
              paint, not after scripts; off for reduced motion. */}
          <div className="hero-fade flex justify-center" style={{ ["--d" as string]: "0ms" }}>
            <GoogleRatingPill />
          </div>
          <h1
            aria-label="Your trusted global shipping partner."
            className="hero-words mx-auto mt-4 max-w-[820px] text-balance text-[2.15rem] font-bold leading-[1.02] tracking-[-0.035em] text-ink sm:mt-6 sm:text-[3.4rem] xl:text-[4rem]"
          >
            {HERO_WORDS.map((w, i) => (
              <span key={w.text} aria-hidden>
                <span
                  className={`hero-word ${w.accent ? "text-brand" : ""}`}
                  style={{ ["--d" as string]: `${100 + i * 55}ms` }}
                >
                  {w.text}
                </span>
                {i < HERO_WORDS.length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p
            className="hero-fade mx-auto mt-3 max-w-[720px] text-balance text-[16.5px] font-medium leading-relaxed text-[#3D4656] sm:mt-5 sm:text-[19px]"
            style={{ ["--d" as string]: "400ms" }}
          >
            {/* Phones get the second sentence only, so the whole quote bar
                (button included) fits on one screen, even an iPhone SE. */}
            <span className="hidden sm:inline">Your partner for logistics and freight forwarding. </span>Documents, parcels, freight,
            vehicles and household goods, shipped from the US to 200+ countries.
          </p>
          <div className="hero-bar relative mx-auto mt-5 max-w-[880px] sm:mt-8 md:mt-20" style={{ ["--d" as string]: "500ms" }}>
            <MiniQuoteForm layout="wide" />
          </div>
        </div>

        {/* Planet horizon with the quick cards on its surface. */}
        <div className="relative mt-16">
          <div
            aria-hidden
            className="hero-planet pointer-events-none absolute left-1/2 top-0 aspect-square w-[var(--W)] -translate-x-1/2 [--W:clamp(900px,165vw,2500px)]"
          >
            <div className="absolute inset-0 rounded-full shadow-[0_-20px_80px_-24px_rgba(3,100,255,0.22)]" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,#FFFFFF_0%,#F1F6FF_18%,#E6EFFF_40%,#FFFFFF_62%)]" />
            <div className="planet-dots absolute inset-0 overflow-hidden rounded-full opacity-30 [mask-image:linear-gradient(to_bottom,#000_0%,#000_6%,transparent_17%)]">
              <div className="absolute inset-[-12.5%]">
                <HeroGlobe theta={-0.6} mapSamples={42000} interactive={false} routes={false} />
              </div>
            </div>
            <div className="planet-rim hero-rim absolute inset-0 rounded-full opacity-60" />
            {/* Vehicles travelling over the planet: each rides a rotating
                square the size of its orbit, so it follows the curve and
                tilts with it. Each is a small route marker (Attio's
                restraint, not an illustration) that stays upright as it
                rides. Ocean and road share the surface half a lap apart;
                air climbs in from the right, clear of the quote bar. */}
            <div className="orbit hidden md:block" style={{ "--lift": "0.05", "--from": "36deg", "--to": "17deg", "--dur": "18s", "--delay": "-5s" } as React.CSSProperties}>
              <RouteChip icon={AirplaneTiltIcon} mode="Air" route="ATL → LHR" />
            </div>
            <div className="orbit hidden md:block" style={{ "--lift": "0", "--from": "-26deg", "--to": "26deg", "--dur": "52s", "--delay": "-6s" } as React.CSSProperties}>
              <RouteChip icon={BoatIcon} mode="Ocean" route="SAV → BOM" />
            </div>
            <div className="orbit hidden md:block" style={{ "--lift": "0", "--from": "-26deg", "--to": "26deg", "--dur": "52s", "--delay": "-32s" } as React.CSSProperties}>
              <RouteChip icon={TruckIcon} mode="Road" route="Door pickup" />
            </div>
            <div className="planet-rim absolute inset-0 rounded-full opacity-40 blur-[12px]" />
          </div>

          {/* Quick actions: one frosted dock resting on the planet's crest
              (not two cards adrift in space), each half with a small live
              visual so it earns a look. Rises in as it scrolls into view. */}
          <div className="relative z-10 mx-auto max-w-5xl px-4 pb-28 pt-[96px] md:px-8 lg:pb-32 lg:pt-[120px]">
            <div className="reveal rounded-[30px] bg-white/85 p-2 shadow-[0_0_0_1px_rgba(3,100,255,0.12),0_40px_90px_-40px_rgba(3,60,170,0.55)]">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <DockAction
                  href="/tracking"
                  icon={MapPinAreaIcon}
                  title="Track a shipment"
                  body="See where it is, from pickup to the front door."
                  visual={<TrackLine />}
                />
                <DockAction
                  href="/services/retailer-shipping"
                  icon={StackIcon}
                  title="Shipping in bulk?"
                  body="Business accounts get their own discounted rates."
                  visual={<RateBars />}
                />
              </div>
            </div>
          </div>
          {/* Fade the planet into the white page below. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-white/0 to-white" />
        </div>
      </section>

      <div className="rails bg-white">
        {/* ---------- What we offer ---------- */}
        <section id="services" className={`scroll-mt-28 border-t ${LINE}`}>
          <div className={`grid grid-cols-1 gap-8 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:py-20 ${PAD}`}>
            <div>
              <Reveal as="h2" className={H2}>What we offer</Reveal>
              <Reveal as="p" delay={80} className={LEAD}>
                One team for parcels, moves and freight, from the US to over 200 countries.
              </Reveal>
            </div>
            <Reveal delay={140}>
              <Link href="/services" className="btn btn-secondary btn-lg">
                All services <ArrowRightIcon size={15} />
              </Link>
            </Reveal>
          </div>
          {/* Phones: a swipeable row (each card ~80% wide so the next one
              peeks in), instead of three full-height cards stacked. */}
          <div className={`flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto border-t ${LINE} px-5 py-5 [scrollbar-width:none] md:grid md:snap-none md:grid-cols-3 md:gap-0 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden`}>
            {[
              {
                icon: "/frontend/icons/redesign/offer-worldwide-shipping.svg",
                motion: "group-hover:-rotate-[10deg] group-hover:scale-105",
                title: "Worldwide Shipping.",
                body: "Discounted FedEx, DHL, UPS and USPS rates for parcels and documents.",
                href: "/services/parcel-shipping",
              },
              {
                icon: "/frontend/icons/redesign/offer-worldwide-moving.svg",
                motion: "group-hover:translate-x-3",
                title: "Worldwide Moving.",
                body: "Your household, furniture and vehicles, moved door to door.",
                href: "/services/international-relocation",
              },
              {
                icon: "/frontend/icons/redesign/offer-freight-forwarding.svg",
                motion: "group-hover:-translate-y-1.5 group-hover:rotate-[4deg]",
                title: "Freight Forwarding.",
                body: "Containers, pallets and cargo by air, ocean, rail or road.",
                href: "/services/freight-forwarding",
              },
            ].map((c, i) => (
              <Link
                key={c.title}
                href={c.href}
                className={`group relative flex w-[80%] shrink-0 snap-start flex-col rounded-3xl ring-1 ring-[var(--line)] md:w-auto md:rounded-none md:ring-0 ${i < 2 ? `md:border-r ${LINE}` : ""}`}
              >
                {/* Tinted top panel: TYS's own icon (recoloured to brand blue
                    via CSS mask) over a dot grid and a dashed route arc. */}
                <span className="relative m-3 flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-[#F1F6FF] [background-image:radial-gradient(#C7D6F0_1px,transparent_1px)] [background-size:14px_14px] transition-colors duration-500 group-hover:bg-[#E7F0FF]">
                  {/* The route is live: its dashes drift and a signal dot
                      travels it (Attio's particles on lines), each card a
                      beat after the one before. */}
                  <svg aria-hidden viewBox="0 0 300 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    <path className="arc-drift" d="M -10 130 Q 150 -20 310 110" fill="none" stroke="#0364FF" strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray="5 6" />
                    <g className="arc-signal">
                      <circle r="9" fill="#0364FF" opacity="0.12" />
                      <circle r="3.2" fill="#0364FF" />
                      <animateMotion dur="9s" begin={`${i * -3}s`} repeatCount="indefinite" path="M -10 130 Q 150 -20 310 110" keyTimes="0;1" keySplines="0.45 0 0.55 1" calcMode="spline" />
                    </g>
                  </svg>
                  <span
                    aria-hidden
                    className={`relative block h-[68px] w-[100px] bg-brand transition-transform duration-500 ease-out ${c.motion}`}
                    style={{
                      WebkitMask: `url(${c.icon}) center / contain no-repeat`,
                      mask: `url(${c.icon}) center / contain no-repeat`,
                    }}
                  />
                </span>
                <span className="flex flex-1 flex-col px-8 pb-8 pt-5 lg:px-10">
                  <span className="text-[17px] leading-relaxed text-ink-muted">
                    <span className="font-semibold text-ink">{c.title}</span> {c.body}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1.5 self-start pt-6 text-sm font-semibold text-ink transition-colors group-hover:text-brand">
                    Learn more
                    <ArrowRightIcon size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- Four service sections (SFL-simple) ---------- */}
        <ServiceRow
          title="Relocation & Auto Transport"
          facts={[{ n: "200+", l: "Countries" }, { n: "4.5★", l: "On Google" }, { n: "24/7", l: "Support" }]}
          body="From your favorite furniture to the family car, we move it all door to door, with care and updates along the way."
          illustration="/frontend/images/home/iso-home.svg"
          imageAlt="A living room full of packed moving boxes and house plants"
          sticker={{ kicker: "Relocation", title: "Door to door", sub: "200+ countries" }}
          overlay={
            // Quoted word for word from a real Google review (lib/google-reviews.ts).
            <figure className="absolute bottom-4 left-4 max-w-[300px] rounded-2xl bg-white/95 p-4 shadow-[0_18px_40px_-18px_rgba(16,24,40,0.5)] transition-transform duration-500 group-hover:-translate-y-1">
              <div className="flex gap-0.5 text-[#FBBC04]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} size={13} weight="fill" />
                ))}
              </div>
              <blockquote className="mt-2 text-[14px] font-medium leading-snug text-ink">
                &ldquo;The packing was done properly, and the team handled everything carefully.&rdquo;
              </blockquote>
              <figcaption className="mt-1.5 text-xs text-ink-muted">Dhvani Kanziya, on Google</figcaption>
            </figure>
          }
          links={[
            { label: "Relocation services", desc: "Your household, door to door", icon: HouseLineIcon, href: "/services/international-relocation" },
            { label: "Auto transport", desc: "Cars and motorcycles, insured", icon: CarProfileIcon, href: "/services/auto-transport" },
          ]}
        />
        <ServiceRow
          reverse
          title="Document & Parcel Shipping"
          facts={[{ n: "70%", l: "Max savings" }, { n: "4", l: "Major carriers" }, { n: "100%", l: "Tracked" }]}
          body="Save up to 70% on your next shipment with the carriers you already trust: FedEx, DHL, UPS and USPS."
          illustration="/frontend/images/home/iso-parcels.svg"
          imageAlt="Cardboard parcels stacked in the back of a delivery van"
          sticker={{ kicker: "Parcels", title: "Up to 70% off", sub: "Retail rates" }}
          overlay={
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 px-5 py-3.5 shadow-[0_18px_40px_-18px_rgba(16,24,40,0.5)]">
              <span className="text-xs font-semibold text-ink-muted">Carriers</span>
              {CARRIERS.map((c) => (
                <BrandMark key={c.slug} icon={c} className="h-6 w-auto max-w-[70px] text-ink/80" />
              ))}
            </div>
          }
          links={[
            { label: "Parcel shipping", desc: "Discounted FedEx, DHL, UPS rates", icon: PackageIcon, href: "/services/parcel-shipping" },
            { label: "Document shipping", desc: "Important papers, tracked", icon: EnvelopeSimpleIcon, href: "/services/document-shipping" },
          ]}
        />
        <ServiceRow
          title="Volume & Business Shipping"
          facts={[{ n: "500+", l: "Shipments delivered" }, { n: "1", l: "Account for all" }, { n: "24/7", l: "Priority support" }]}
          body="Ship packages regularly? Get exclusive discounts and a business account that handles any volume."
          illustration="/frontend/images/home/iso-pallet.svg"
          imageAlt="A large, bright warehouse full of boxed orders"
          sticker={{ kicker: "Business", title: "Your own rates", sub: "Any volume" }}
          overlay={
            <div className="absolute bottom-4 left-4 w-[240px] rounded-2xl bg-white/95 p-4 shadow-[0_18px_40px_-18px_rgba(16,24,40,0.5)] transition-transform duration-500 group-hover:-translate-y-1">
              <p className="text-sm font-semibold text-ink">Business account</p>
              <ul className="mt-2.5 space-y-1.5">
                {["Discounted rates", "Priority support", "Every shipment in one place"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-[13.5px] text-ink">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#12B76A] text-white">
                      <CheckIcon size={9} weight="bold" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          }
          links={[
            { label: "Volume shipping", desc: "Better rates as you ship more", icon: StackIcon, href: "/services/volume-shipping" },
            { label: "Retailer shipping", desc: "For online stores and sellers", icon: StorefrontIcon, href: "/services/retailer-shipping" },
          ]}
        />
        <ServiceRow
          reverse
          title="Enterprise Logistics"
          facts={[{ n: "4", l: "Air, ocean, rail, road" }, { n: "900+", l: "Carrier networks" }, { n: "1", l: "Dedicated manager" }]}
          body="Imports, exports and commercial cargo, managed end to end, with one dedicated manager on your account."
          illustration="/frontend/images/home/iso-containers.svg"
          imageAlt="A busy container port from above, with cranes loading ships"
          sticker={{ kicker: "Freight", title: "Customs handled", sub: "Import and export" }}
          overlay={
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {[
                { icon: AirplaneTiltIcon, label: "Air" },
                { icon: BoatIcon, label: "Ocean" },
                { icon: TrainIcon, label: "Rail" },
                { icon: TruckIcon, label: "Road" },
              ].map((m) => (
                <span
                  key={m.label}
                  className="flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-[13.5px] font-semibold text-ink shadow-[0_12px_28px_-14px_rgba(16,24,40,0.5)]"
                >
                  <m.icon size={16} weight="duotone" className="text-brand" />
                  {m.label}
                </span>
              ))}
            </div>
          }
          links={[
            { label: "Freight forwarding", desc: "Air, ocean, rail and road", icon: ShippingContainerIcon, href: "/services/freight-forwarding" },
            { label: "Talk to our team", desc: "One manager for your account", icon: ChatsCircleIcon, href: "/contact-us" },
          ]}
        />

        {/* ---------- Global Shopper ---------- */}
        <section className={`border-t ${LINE}`}>
          <div className={`grid grid-cols-1 gap-8 py-16 lg:grid-cols-[1fr_auto] lg:items-end lg:py-20 ${PAD}`}>
            <div>
              <Reveal as="h2" className={H2}>Shop US stores, ship anywhere</Reveal>
              <Reveal as="p" delay={80} className={LEAD}>
                Get a free US address, shop the brands you love, and we&rsquo;ll combine your
                orders and ship them to you.
              </Reveal>
            </div>
            <Reveal delay={140} className="flex flex-wrap gap-3">
              <Link href="/services/global-shopper" className="btn btn-primary btn-lg">
                Get your free US address <ArrowRightIcon size={15} />
              </Link>
              <Link href="/services/global-shopper" className="btn btn-secondary btn-lg">
                How it works
              </Link>
            </Reveal>
          </div>
          <div className={`grid grid-cols-2 border-t ${LINE} sm:grid-cols-5`}>
            {STORES.map((s, i) => (
              // Each tile opens Global Shopper (the US address you'd shop
              // this store with), not the store itself, so visitors stay here.
              <Link
                key={s.name}
                href="/services/global-shopper"
                aria-label={`Shop ${s.name} from abroad with a free US address`}
                className={`group relative flex h-28 items-center justify-center ${LINE} border-b transition-colors duration-300 hover:bg-[#F8FAFE] ${i % 2 === 0 ? "border-r" : ""} sm:border-r sm:[&:nth-child(5n)]:border-r-0 ${i >= 5 ? "sm:border-b-0" : ""}`}
              >
                <ArrowUpRightIcon
                  aria-hidden
                  size={13}
                  className="absolute right-3 top-3 text-[#B7C0CD] opacity-0 transition-opacity group-hover:opacity-100"
                />
                {s.icon ? (
                  <BrandMark
                    icon={s.icon}
                    title={s.name}
                    className="h-8 w-auto max-w-[62%] text-ink/75 transition-colors duration-300 group-hover:text-[var(--brand)]"
                  />
                ) : (
                  <img
                    src={s.src}
                    alt={s.name}
                    loading="lazy"
                    className="h-8 w-auto max-w-[60%] opacity-75 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- Trust Your Shipment (stats) ---------- */}
        {/* ---------- Trust Your Shipment: the night band ----------
            The page's one dark moment (Attio's planet horizon, our way).
            The hero is day: a pale globe under the quote bar. Here it's
            night: a dark dotted globe with a glowing blue rim rises as
            the section scrolls in, like a sunrise, and the stats sit on
            the horizon in a hairline grid.
            - Full bleed without leaving the page rails: a 100vmax box
              shadow paints the band, and clip-path trims it to the
              section's height (no horizontal scroll).
            - The rise and the ray fade are CSS scroll-driven animations;
              browsers without them just show it risen. */}
        <section
          id="about"
          data-nav-dark
          className="night-band relative isolate my-20 scroll-mt-28 border-x border-white/10 bg-[#060A14] lg:my-28 text-white shadow-[0_0_0_100vmax_#060A14] [clip-path:inset(0_-100vmax)]"
        >
          {/* Light rays falling onto the horizon */}
          <div aria-hidden className="night-rays pointer-events-none absolute inset-x-0 top-0 h-[560px] [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.045)_0_1px,transparent_1px_9px)] [mask-image:radial-gradient(60%_90%_at_50%_100%,#000,transparent_75%)]" />

          <div className={`relative pt-28 text-center lg:pt-36 ${PAD}`}>
            <Reveal as="p" className="text-[15px] font-medium text-white/55">
              That&rsquo;s what TYS stands for
            </Reveal>
            <Reveal
              as="h2"
              delay={60}
              className="mx-auto mt-3 text-balance text-[2.8rem] leading-[0.98] tracking-[-0.04em] sm:text-[4.2rem] lg:text-[5.2rem]"
            >
              <span style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>Trust Your Shipment</span>
            </Reveal>
            <Reveal as="p" delay={120} className="mx-auto mt-5 max-w-lg text-pretty text-[17px] leading-relaxed text-white/60">
              The standard every parcel, pallet and household move is held to, from pickup to the
              front door.
            </Reveal>
          </div>

          {/* The horizon */}
          {/* The box clips the planet; its top edge is feathered so the glow
              above the rim fades out rather than stopping at a line. */}
          <div aria-hidden className="relative mt-10 h-[260px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_38%)] sm:h-[320px] lg:h-[360px]">
            <div className="planet-rise absolute left-1/2 top-[70px] aspect-square w-[clamp(1100px,135vw,2000px)] -translate-x-1/2 sm:top-[90px]">
              <div className="absolute inset-0 rounded-full shadow-[0_-30px_120px_-10px_rgba(3,100,255,0.55),0_-6px_30px_-4px_rgba(111,166,255,0.5)]" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,#0B1a3a_0%,#070D1C_22%,#060A14_45%)]" />
              <div className="absolute inset-0 overflow-hidden rounded-full opacity-70 [mask-image:linear-gradient(to_bottom,#000_0%,#000_8%,transparent_22%)]">
                <div className="absolute inset-[-12.5%]">
                  <HeroGlobe tone="dark" theta={-0.6} mapSamples={42000} interactive={false} routes={false} />
                </div>
              </div>
              <div className="night-rim absolute inset-0 rounded-full" />
              <div className="night-rim absolute inset-0 rounded-full opacity-80 blur-[16px]" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#060A14]" />
          </div>

          {/* Stats on the horizon */}
          <dl className="relative grid grid-cols-2 border-t border-white/10 lg:grid-cols-3">
            {[
              { n: "200", s: "+", label: "Countries we deliver to" },
              { n: "900", s: "+", label: "Trusted carrier networks" },
              { n: "70", s: "%", label: "Shipping savings, up to" },
              { n: "100", s: "%", label: "Shipment visibility" },
              { n: "24", s: "/7", label: "Expert support" },
              { n: "500", s: "+", label: "Shipments delivered" },
            ].map((st, i) => (
              <div
                key={st.label}
                className={`flex flex-col-reverse gap-2 border-b border-white/10 px-5 py-10 sm:px-10 lg:px-14 ${i % 2 === 0 ? "border-r" : ""} lg:border-r ${(i + 1) % 3 === 0 ? "lg:border-r-0" : ""} ${i >= 3 ? "lg:border-b" : ""}`}
              >
                <dt className="text-[15px] text-white/55">{st.label}</dt>
                <dd
                  className="text-[3rem] leading-none tracking-[-0.035em] sm:text-[3.6rem]"
                  style={{ fontFamily: "var(--font-oldschool-grotesk)" }}
                >
                  {st.n}
                  <span className="text-[#6FA6FF]">{st.s}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className={`relative flex justify-center pb-28 pt-12 ${PAD}`}>
            <Link href="/about-us" className="btn btn-ghost-white btn-lg">
              About TYS <ArrowRightIcon size={15} />
            </Link>
          </div>
        </section>

        {/* ---------- Need a quote ---------- */}
        <section className={`border-t ${LINE}`}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className={`py-16 lg:py-20 ${PAD}`}>
              <Reveal as="h2" className={H2}>
                Need a quote? <span className="text-brand">It takes 30 seconds.</span>
              </Reveal>
              <Reveal as="p" delay={80} className={LEAD}>
                Tell us where it&rsquo;s coming from and where it&rsquo;s going. We&rsquo;ll handle
                the rest.
              </Reveal>
              <Reveal delay={140} className="mt-8">
                <MiniQuoteForm layout="hero" />
              </Reveal>
            </div>
            <div className={`border-t ${LINE} bg-[#F7F9FC] p-5 md:border-l md:border-t-0 lg:p-10`}>
              <Reveal delay={100} className="h-full">
                <img
                  loading="lazy"
                  src="/frontend/images/redesign/need-quote-photo.webp"
                  alt="Courier handing a package to a customer"
                  className="h-full min-h-[320px] w-full rounded-2xl border border-[#E6EAF0] object-cover"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Reviews ---------- */}
        <section className={`border-t ${LINE} py-16 lg:py-20`}>
          <div className={PAD}>
            <Reveal as="h2" className={H2}>What our customers say</Reveal>
            <Reveal as="p" delay={80} className={LEAD}>
              Real reviews from Google, shown word for word.
            </Reveal>
            <div className="mt-8">
              <GoogleReviewsStrip />
            </div>
          </div>
        </section>

        {/* ---------- FAQ ----------
            Same DEFAULT_FAQS content as /faqs (a homepage teaser of the full
            FAQ page), but the FAQPage JSON-LD is only emitted on /faqs itself:
            two pages emitting identical FAQPage structured data is duplicate
            content for rich-result purposes. */}
        <section id="faq" className={`scroll-mt-28 border-t ${LINE}`}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr]">
            <div className={`border-b ${LINE} py-16 lg:border-b-0 lg:border-r lg:py-20 ${PAD}`}>
              <div className="lg:sticky lg:top-32">
                <Reveal as="h2" className={H2}>Frequently asked questions</Reveal>
                <Reveal as="p" delay={80} className={LEAD}>
                  Can&rsquo;t find yours? Call us and talk to a person.
                </Reveal>
                <Reveal delay={140} className="mt-8 flex flex-wrap gap-3">
                  <a href="tel:+14047938759" className="btn btn-secondary btn-lg">
                    <PhoneIcon size={15} /> +1 (404) 793-8759
                  </a>
                  <Link href="/faqs" className="btn btn-lg text-ink hover:bg-[#F3F5F9]">
                    All questions <ArrowRightIcon size={14} />
                  </Link>
                </Reveal>
              </div>
            </div>
            <div className={`py-10 lg:py-16 ${PAD}`}>
              <FaqAccordion />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Blue gradient tile with a white duotone icon, used on the quick cards.
function IconTile({ icon: IconCmp }: { icon: Icon }) {
  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[radial-gradient(120%_120%_at_30%_0%,#5B9BFF_0%,#0364FF_55%,#0247BD_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-8px_rgba(3,100,255,0.7)]">
      <IconCmp size={24} weight="duotone" />
    </span>
  );
}

function DockAction({
  href,
  icon,
  title,
  body,
  visual,
}: {
  href: string;
  icon: Icon;
  title: string;
  body: string;
  visual: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-5 rounded-[22px] bg-white p-5 ring-1 ring-[#E6EDF8] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-24px_rgba(3,100,255,0.45)] hover:ring-[#BCD2F5] sm:p-6"
    >
      <span className="flex items-start gap-4">
        <span className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
          <IconTile icon={icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[18px] font-semibold tracking-[-0.015em] text-ink">{title}</span>
          <span className="mt-0.5 block text-[14.5px] leading-snug text-ink-muted">{body}</span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E1E7F0] text-ink transition duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
          <ArrowRightIcon size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </span>
      {visual}
    </Link>
  );
}

// The journey a tracked shipment reports, as a route line with a signal
// dot travelling it. Illustrative only: no tracking number, no live data.
function TrackLine() {
  const steps = ["Picked up", "In transit", "Customs", "Delivered"];
  return (
    <span className="block rounded-2xl bg-[#F5F8FE] px-4 pb-3 pt-4 ring-1 ring-inset ring-[#E6EDF8]">
      <span className="track-path relative block h-2.5">
        <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-[#B9CCEB]" />
        <span className="absolute left-1 top-1/2 h-[2px] w-[66%] -translate-y-1/2 rounded-full bg-brand" />
        {steps.map((s, i) => (
          <span
            key={s}
            className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#F5F8FE] ${i < 3 ? "bg-brand" : "bg-[#C9D8F0]"}`}
            style={{ left: `calc(${(i / 3) * 100}% * 0.98 + 1%)` }}
          />
        ))}
        <span className="track-signal absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgba(3,100,255,0.35)]" />
      </span>
      <span className="mt-2.5 grid grid-cols-4 text-[11.5px] font-medium text-ink-muted">
        {steps.map((s, i) => (
          <span key={s} className={i === 0 ? "text-left" : i === 3 ? "text-right" : "text-center"}>
            {s}
          </span>
        ))}
      </span>
    </span>
  );
}

// Retail rate vs. a business account rate: the stats band's "up to 70%"
// shipping savings, shown as two bars.
function RateBars() {
  return (
    <span className="block space-y-2 rounded-2xl bg-[#F5F8FE] px-4 py-3.5 ring-1 ring-inset ring-[#E6EDF8]">
      <span className="flex items-center gap-3 text-[12px] font-medium">
        <span className="w-[92px] shrink-0 text-ink-muted">Retail rate</span>
        <span className="h-2 flex-1 rounded-full bg-[#D5DFEE]" />
      </span>
      <span className="flex items-center gap-3 text-[12px] font-medium">
        <span className="w-[92px] shrink-0 text-ink">Business rate</span>
        <span className="flex flex-1 items-center gap-2">
          <span className="rate-bar h-2 w-[30%] rounded-full bg-brand" />
          <span className="whitespace-nowrap rounded-full bg-[#E6F0FF] px-2 py-0.5 text-[11px] font-semibold text-brand">
            up to 70% off
          </span>
        </span>
      </span>
    </span>
  );
}

function ServiceRow({
  title,
  body,
  imageAlt,
  links,
  sticker,
  overlay,
  facts,
  illustration,
  reverse = false,
}: {
  title: string;
  body: string;
  facts: { n: string; l: string }[];
  imageAlt: string;
  links: { label: string; desc: string; icon: Icon; href: string }[];
  sticker: { kicker: string; title: string; sub: string };
  overlay?: React.ReactNode;
  // An isometric illustration (a local SVG, drawn by
  // 03_Website/design_review/iso/gen_scenes.py) on the soft blue dotted
  // panel the offer cards use. The old photos are backed up in
  // 03_Website/backups/2026-09-29_before-home-redesign/service-photos.
  illustration: string;
  reverse?: boolean;
}) {
  return (
    <section className={`border-t ${LINE}`}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div
          className={`flex flex-col justify-center bg-[radial-gradient(120%_90%_at_0%_0%,#EDF3FF_0%,#FFFFFF_65%)] py-14 lg:py-20 ${PAD} ${reverse ? "md:order-2" : ""}`}
        >
          <Reveal as="h2" className={H2}>{title}</Reveal>
          <Reveal as="p" delay={80} className={LEAD}>{body}</Reveal>
          {/* Three proof points as a mini Attio-style stat row. */}
          <Reveal delay={110} className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-[#E6EAF0] rounded-2xl border border-[#E6EAF0] bg-white/80">
            {facts.map((f) => (
              <div key={f.l} className="px-4 py-3.5">
                <div className="text-[1.6rem] leading-none tracking-[-0.03em] text-ink" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
                  {f.n}
                </div>
                <div className="mt-1.5 text-[12.5px] leading-snug text-ink-muted">{f.l}</div>
              </div>
            ))}
          </Reveal>
          {/* The two sub-services as an Attio-style choice panel: one
              hairline frame split in two, a small line icon, the name, one
              quiet line, and an arrow that wakes up on hover. (Plain
              buttons read as "another button" and got scrolled past.) */}
          <Reveal
            delay={160}
            className="mt-8 grid max-w-lg grid-cols-1 divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative flex flex-col gap-3 p-4 transition-colors duration-200 hover:bg-[#F7F9FD] sm:p-5"
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-ink/70 transition-colors duration-200 group-hover:border-[#C9D6EE] group-hover:text-brand">
                    <l.icon size={16} />
                  </span>
                  <ArrowUpRightIcon
                    size={14}
                    className="text-[#B7C0CD] transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                  />
                </span>
                <span>
                  <span className="block text-[15px] font-medium tracking-[-0.01em] text-ink">{l.label}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{l.desc}</span>
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
        <div
          className={`border-t ${LINE} bg-white p-5 md:border-t-0 lg:p-10 ${reverse ? "md:order-1 md:border-r" : "md:border-l"}`}
        >
          <Reveal delay={100}>
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#E6EAF0] bg-[#E8EEF8]">
              <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_45%,#F6F9FF_0%,#E6EEFC_70%,#DCE7FA_100%)]">
                <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(#C7D6F0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]" />
                {/* Soft floor shadow under the stack */}
                <div aria-hidden className="absolute left-1/2 top-[64%] h-[18%] w-[62%] -translate-x-1/2 rounded-[50%] bg-[#0B3A8C]/15 blur-2xl" />
                <img
                  src={illustration}
                  alt={imageAlt}
                  className="absolute left-1/2 top-[44%] max-h-[62%] w-[58%] -translate-x-1/2 -translate-y-1/2 select-none object-contain transition-transform duration-700 ease-out group-hover:-translate-y-[53%]"
                  draggable={false}
                />
              </div>
              <LabelSticker {...sticker} />
              {overlay}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// A shipping-label sticker on each service photo (straight at rest: a
// permanent tilt made the barcode and small text render jagged): dashed edge,
// label type, a barcode, and a slight tilt that deepens on hover. It's the
// one playful, TYS-specific detail per section.
function LabelSticker({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="absolute right-4 top-4 rounded-xl border-[1.5px] border-dashed border-[#101828]/25 bg-white px-4 pb-3 pt-2.5 shadow-[0_16px_34px_-16px_rgba(16,24,40,0.55)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[2deg]">
      <div
        className="flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted"
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
      >
        <span>TYS &middot; {kicker}</span>
        <span className="h-2 w-2 rounded-full bg-brand" />
      </div>
      <div className="mt-1 text-[17px] font-bold leading-tight tracking-[-0.01em] text-ink">{title}</div>
      <div className="text-[12.5px] text-ink-muted">{sub}</div>
      <div
        aria-hidden
        className="mt-2 h-4 w-28 opacity-70"
        style={{
          background:
            "repeating-linear-gradient(90deg,#101828 0 2px,transparent 2px 4px,#101828 4px 5px,transparent 5px 8px,#101828 8px 11px,transparent 11px 13px)",
        }}
      />
    </div>
  );
}

// A route marker riding the hero planet: a white chip with a line icon, the
// mode, and a short route in mono. Counter-rotates so it stays level.
function RouteChip({ icon: Icon, mode, route }: { icon: Icon; mode: string; route: string }) {
  return (
    <span className="orbit-chip">
      <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-[#DCE5F5] bg-white/95 py-1 pl-1 pr-3 text-[12.5px] shadow-[0_8px_20px_-8px_rgba(3,60,170,0.25)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF4FF] text-brand">
          <Icon size={14} weight="bold" />
        </span>
        <span className="font-medium text-ink">{mode}</span>
        <span className="font-mono text-[11px] tracking-tight text-ink-muted">{route}</span>
      </span>
    </span>
  );
}
