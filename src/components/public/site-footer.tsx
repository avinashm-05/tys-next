import Link from "next/link";
import { ArrowRightIcon, InstagramLogoIcon, LinkedinLogoIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";

const SERVICES = [
  { href: "/services/parcel-shipping", label: "Parcel shipping" },
  { href: "/services/document-shipping", label: "Document shipping" },
  { href: "/services/baggage-shipping", label: "Baggage shipping" },
  { href: "/services/international-relocation", label: "International moving" },
  { href: "/services/packers-and-movers", label: "Packers and movers" },
  { href: "/services/auto-transport", label: "Auto transport" },
  { href: "/services/freight-forwarding", label: "Freight forwarding" },
  { href: "/services/piano-moving", label: "Piano moving" },
  { href: "/services/small-business-shipping", label: "Small business shipping" },
  { href: "/services", label: "All services" },
] as const;

const DESTINATIONS = [
  { href: "/destinations", label: "Worldwide destinations" },
  { href: "/destinations/canada", label: "Shipping to Canada" },
  { href: "/destinations/india", label: "Shipping to India" },
  { href: "/destinations/uk", label: "Shipping to the UK" },
  { href: "/destinations/pakistan", label: "Shipping to Pakistan" },
  { href: "/destinations/uae", label: "Shipping to the UAE" },
  { href: "/destinations/australia", label: "Shipping to Australia" },
  { href: "/destinations/moving", label: "Worldwide moving" },
] as const;

const RESOURCES = [
  { href: "/shipping-rates", label: "Shipping rates" },
  { href: "/shipping-calculator", label: "Shipping calculator" },
  { href: "/resources/customs-duty", label: "Customs and duties" },
  { href: "/resources/prohibited-items", label: "Prohibited items" },
  { href: "/resources/volumetric-weight", label: "Volumetric weight" },
  { href: "/blog", label: "Blog" },
  { href: "/faqs", label: "FAQs" },
] as const;

// "Book Shipment" and "My Account" both stay out here, see the matching
// note in site-header.tsx. The portal isn't being shown to the public yet.
// 2026-09-29: the footer links every key page (the SEO audit found several,
// like baggage shipping and shipping rates, with almost no inbound links).
const COMPANY = [
  { href: "/about-us", label: "About us" },
  { href: "/reviews", label: "Customer reviews" },
  { href: "/carriers", label: "Our carriers" },
  { href: "/locations", label: "Locations" },
  { href: "/tracking", label: "Track a shipment" },
  { href: "/contact-us", label: "Contact us" },
  { href: "/quotes", label: "Get a quote" },
] as const;

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/security", label: "Security" },
  { href: "/sitemap", label: "Sitemap" },
] as const;

// 2026-09 redesign, picked by the user: Attio's footer, on the page's
// near-black (the promo bar and the night band use the same #0B1220), so it
// clearly ends the page. Hairline rails and a hairline column grid, a thin
// legal row, and a huge "TYS Global Logistics" wordmark in a blue fade
// running edge to edge, cropped by the bottom of the page.
const PAD = "px-5 sm:px-10 lg:px-14";
const LINE = "border-white/10";

export function SiteFooter() {
  return (
    <footer data-nav-dark className="relative overflow-hidden bg-[#0B1220] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(111,166,255,0.6),transparent)]" />
      <div className={`relative mx-auto max-w-[1320px] border-x ${LINE}`}>
        {/* Logo + columns, divided by hairlines */}
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className={`col-span-2 border-b ${LINE} py-10 lg:col-span-1 lg:border-b-0 lg:border-r lg:py-12 ${PAD}`}>
            {/* Phones: logo and socials share a row. */}
            <div className="flex items-center justify-between gap-4 md:block">
              <img
                loading="lazy"
                src="/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png"
                alt="TYS Global Logistics"
                width={480}
                height={177}
                draggable={false}
                className="h-9 w-auto select-none md:h-10"
              />
              <div className="flex gap-2 md:order-last md:mt-5">
                <a
                  href="https://www.linkedin.com/company/tys-global-logistics/"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="LinkedIn"
                  className={`flex h-10 w-10 items-center justify-center rounded-[10px] border ${LINE} text-white/70 transition hover:border-white/40 hover:text-white md:h-9 md:w-9`}
                >
                  <LinkedinLogoIcon size={17} weight="fill" />
                </a>
                <a
                  href="https://www.instagram.com/tysgloballogistics"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Instagram"
                  className={`flex h-10 w-10 items-center justify-center rounded-[10px] border ${LINE} text-white/70 transition hover:border-white/40 hover:text-white md:h-9 md:w-9`}
                >
                  <InstagramLogoIcon size={17} weight="fill" />
                </a>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/60">
              Shipping and moving from the US to more than 200 countries, with a real team
              behind every quote.
            </p>
            {/* Phones only: the two things people come to the footer for. */}
            <div className="mt-6 grid grid-cols-2 gap-2 md:hidden">
              <a href="tel:+14047938759" className="btn btn-ghost-white btn-lg w-full">
                <PhoneIcon size={16} /> Call us
              </a>
              <Link href="/quotes" className="btn btn-white btn-lg w-full">
                Free quote <ArrowRightIcon size={15} />
              </Link>
            </div>
          </div>

          {[
            { title: "Services", links: SERVICES },
            { title: "Destinations", links: DESTINATIONS },
            { title: "Resources", links: RESOURCES },
            { title: "Company", links: COMPANY },
          ].map((col, i) => (
            <div
              key={col.title}
              className={`border-b ${LINE} py-8 lg:border-b-0 lg:py-12 ${PAD} ${i % 2 === 0 ? `border-r ${LINE}` : ""} ${i < 3 ? `lg:border-r ${LINE}` : "lg:border-r-0"}`}
            >
              <h3 className="text-[13px] font-medium text-white/45">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-[15px] text-white/80 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal row */}
        <div className={`flex flex-col gap-3 border-t ${LINE} py-5 text-[13px] text-white/50 sm:flex-row sm:items-center sm:justify-between ${PAD}`}>
          <span>&copy; 2026 TYS Global Logistics LLC. All rights reserved.</span>
          <span className="flex flex-wrap gap-x-5 gap-y-1">
            {LEGAL.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </span>
        </div>

        {/* The wordmark: a quiet grey fading out, sized to the rails' width,
            its lower part cropped by the page edge. line-height 1 plus a
            little top padding keeps the letter tops inside the box that the
            gradient text fill paints (0.8 clipped them). */}
        <div aria-hidden className={`select-none overflow-hidden border-t ${LINE} pt-8`}>
          <p
            className="translate-y-[18%] whitespace-nowrap pt-[0.06em] text-center text-[11.2vw] font-bold leading-none tracking-[-0.055em] text-transparent [background-image:linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.06)_55%,rgba(255,255,255,0)_92%)] [-webkit-background-clip:text] [background-clip:text] min-[1320px]:text-[148px]"
            style={{ fontFamily: "var(--font-oldschool-grotesk)" }}
          >
            TYS Global Logistics
          </p>
        </div>
      </div>
    </footer>
  );
}
