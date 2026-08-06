"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretDownIcon,
  ListIcon,
  PhoneIcon,
  XIcon,
  HouseIcon,
  BriefcaseIcon,
  ListNumbersIcon,
  PaperPlaneTiltIcon,
  GlobeIcon,
  TruckIcon,
  SquaresFourIcon,
  QuestionIcon,
  MapPinIcon,
  BookOpenIcon,
  CreditCardIcon,
  ClockIcon,
  NotePencilIcon,
  HeadsetIcon,
} from "@phosphor-icons/react";
import { UsFlag } from "@/components/public/us-flag";

// Book Shipment (self-serve pickup scheduling) is still hidden — that flow
// isn't ready for customers yet. The account/profile entry point is hidden
// too, for now (temporary — the /account routes and backend are untouched,
// this only removes the header's link to them; see the two spots below).
const NAV_LINKS = [
  { href: "/tracking", label: "Tracking" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

const DESTINATION_LINKS = [
  { href: "/destinations", label: "Worldwide Destinations" },
  { href: "/destinations/moving", label: "Worldwide Moving" },
] as const;

// Full icon-list mobile drawer (replaces the old compact dropdown).
const MOBILE_MENU_ITEMS = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/about-us", label: "About Us", icon: BriefcaseIcon },
  { href: "/services", label: "Services", icon: ListNumbersIcon },
  { href: "/carriers", label: "Major Carriers", icon: PaperPlaneTiltIcon },
  { href: "/destinations", label: "Worldwide Shipping", icon: GlobeIcon },
  { href: "/destinations/moving", label: "Worldwide Moving", icon: TruckIcon },
  { href: "/resources", label: "Resources", icon: SquaresFourIcon },
  { href: "/faqs", label: "FAQs", icon: QuestionIcon },
  { href: "/locations", label: "Locations", icon: MapPinIcon },
  { href: "/blog", label: "Blog", icon: BookOpenIcon },
  { href: "/contact-us/pay", label: "Pay Online", icon: CreditCardIcon },
  { href: "/tracking", label: "Tracking", icon: ClockIcon },
  { href: "/quotes", label: "Get Quote", icon: NotePencilIcon },
  { href: "/contact-us", label: "Contact Us", icon: HeadsetIcon },
  // "My Account" hidden for now — see the comment above NAV_LINKS.
] as const;

// B1/B2 redesign — Tailwind rebuild matching the new Figma nav. Replaces the
// old Bootstrap-ported header. Mobile menu and the Destinations dropdown are
// plain React state (no Bootstrap JS anymore).
export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 select-none px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-white px-5 py-3 shadow-[0_2px_16px_rgba(16,24,40,0.06)] md:px-7">
        <Link href="/" className="flex shrink-0 items-center">
          {/* The one image on the public site guaranteed to be above the
              fold on every single page load — eager + high priority so it
              never competes with the rest of the page for bandwidth.
              Everything else site-wide is loading="lazy" (see page-loader.tsx
              for the broader "control what loads first" pass this is part
              of). */}
          <img
            src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png"
            alt="TYS Global Logistics"
            width={480}
            height={177}
            draggable={false}
            loading="eager"
            fetchPriority="high"
            className="h-11 w-auto select-none"
          />
        </Link>

        <nav className="hidden items-center gap-6 whitespace-nowrap text-base font-medium text-black xl:flex">
          <div
            className="relative"
            onMouseEnter={() => setDestOpen(true)}
            onMouseLeave={() => setDestOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-brand"
              onClick={() => setDestOpen((v) => !v)}
              aria-expanded={destOpen}
            >
              Destinations
              <CaretDownIcon size={14} weight="bold" />
            </button>
            {destOpen && (
              <div className="absolute left-0 top-full w-56 rounded-xl border border-brand-light bg-white p-2 shadow-lg">
                {DESTINATION_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-brand-pale hover:text-brand"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 whitespace-nowrap xl:flex">
          <Link
            href="/quotes"
            className="flex items-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Get a Free Quote
            <span aria-hidden>→</span>
          </Link>
          <a
            href="tel:+14047938759"
            className="flex items-center gap-2 rounded-full border border-brand px-4 py-3 text-sm font-semibold text-brand hover:bg-brand-pale"
          >
            <PhoneIcon size={16} weight="bold" />
            +1 (404) 793-8759
          </a>
          {/* "My Account" hidden for now — see the comment above NAV_LINKS. */}
          <UsFlag className="h-5 w-auto overflow-hidden rounded-[3px]" />
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-pale text-ink hover:bg-brand-light"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
        </button>
      </div>

      {/* Both the backdrop and the drawer below are unconditionally mounted
          (not `{mobileOpen && ...}`) so the open/close slide has something to
          transition between — but that means their CLOSED state depends
          entirely on Tailwind's compiled CSS actually being applied
          (`translate-x-full`, `opacity-0`, `fixed inset-*`). On a real
          mobile connection where the stylesheet request lands even slightly
          behind the HTML paint, those classes are inert and the drawer
          renders as a plain, unstyled, unpositioned list of every nav link
          sitting right in the page flow, overlaid on the real content —
          confirmed via an actual MobileSafari session recording,
          2026-08-06. The inline `style` fallback below forces the CLOSED
          position/transform/opacity with zero dependency on any stylesheet
          having loaded; it's cleared (`undefined`) once `mobileOpen` is
          true, at which point the Tailwind classes safely take over (CSS is
          certainly loaded by then — the hamburger button itself needed CSS
          to be visible/clickable before this state could ever become true),
          preserving the existing slide/fade transition exactly as before. */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={mobileOpen ? 0 : -1}
        style={
          !mobileOpen
            ? { position: "fixed", inset: 0, opacity: 0, pointerEvents: "none" }
            : undefined
        }
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-300 ease-out ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        aria-hidden={!mobileOpen}
        style={
          !mobileOpen
            ? // Anchored from the LEFT with a viewport-relative 100vw shift,
              // not `right: 0` + `translateX(100%)` — confirmed live,
              // 2026-08-06: the className below still carries Tailwind's
              // `right-0`, and inline `style` only overrides the properties
              // it actually sets. With `left` and `right` BOTH active at
              // once on a fixed, explicitly-widthed element, that's the
              // classic CSS over-constrained case — this browser resolved
              // it by keeping `right: 0` in charge instead of `left`,
              // landing the "hidden" drawer hundreds of pixels further right
              // than intended and reintroducing the exact overflow this
              // fallback exists to prevent. Explicitly setting `right:
              // "auto"` here removes the conflicting value entirely instead
              // of hoping `left` wins the tie-break. `translateX(100vw)`
              // (viewport-relative, not 100% of the element's own width)
              // guarantees a full viewport-width shift regardless of the
              // drawer's own computed width.
              {
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: "auto",
                transform: "translateX(100vw)",
              }
            : undefined
        }
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[85%] max-w-xs flex-col overflow-y-auto bg-white pb-8 shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <img
            loading="lazy"
            src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png"
            alt="TYS Global Logistics"
            width={480}
            height={177}
            draggable={false}
            className="h-9 w-auto select-none"
          />
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={mobileOpen ? 0 : -1}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-pale text-ink"
            onClick={() => setMobileOpen(false)}
          >
            <XIcon size={18} />
          </button>
        </div>

        <nav className="mt-2 flex flex-1 flex-col px-3">
          {MOBILE_MENU_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                tabIndex={mobileOpen ? 0 : -1}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-4 rounded-xl px-3 py-3 text-base font-semibold ${
                  active ? "text-brand" : "text-ink hover:bg-brand-pale"
                }`}
              >
                <item.icon size={22} weight={active ? "fill" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 flex flex-col gap-2 px-5">
          <Link
            href="/quotes"
            tabIndex={mobileOpen ? 0 : -1}
            onClick={() => setMobileOpen(false)}
            className="rounded-full bg-brand px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Get a Free Quote →
          </Link>
          <a
            href="tel:+14047938759"
            tabIndex={mobileOpen ? 0 : -1}
            className="rounded-full border border-brand px-5 py-3 text-center text-sm font-semibold text-brand"
          >
            +1 (404) 793-8759
          </a>
        </div>
      </div>
    </header>
  );
}
