"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CaretDownIcon,
  ListIcon,
  PhoneIcon,
  UserCircleIcon,
  XIcon,
  HouseIcon,
  UserIcon,
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
  PackageIcon,
  NotePencilIcon,
  HeadsetIcon,
} from "@phosphor-icons/react";
import { UsFlag } from "@/components/public/us-flag";

const NAV_LINKS = [
  { href: "/tracking", label: "Tracking" },
  { href: "/book-shipment", label: "Book Shipment" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

const DESTINATION_LINKS = [
  { href: "/destinations", label: "Worldwide Destinations" },
  { href: "/destinations/moving", label: "Worldwide Moving" },
] as const;

// Full icon-list mobile drawer (replaces the old compact dropdown).
const MOBILE_MENU_ITEMS = [
  { href: "/", label: "Home", icon: HouseIcon },
  { href: "/book-shipment", label: "My Account", icon: UserIcon },
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
  { href: "/book-shipment", label: "Book Shipment", icon: PackageIcon },
  { href: "/quotes", label: "Get Quote", icon: NotePencilIcon },
  { href: "/contact-us", label: "Contact Us", icon: HeadsetIcon },
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
          <img
            src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png"
            alt="TYS Global Logistics"
            draggable={false}
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
          <UsFlag className="h-5 w-auto overflow-hidden rounded-[3px]" />
          <Link
            href="/book-shipment"
            aria-label="My account"
            className="flex items-center justify-center text-ink hover:text-brand"
          >
            <UserCircleIcon size={24} />
          </Link>
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

      <button
        type="button"
        aria-label="Close menu"
        tabIndex={mobileOpen ? 0 : -1}
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-300 ease-out ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 right-0 z-50 flex h-dvh w-[85%] max-w-xs flex-col overflow-y-auto bg-white pb-8 shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <img
            src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png"
            alt="TYS Global Logistics"
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
