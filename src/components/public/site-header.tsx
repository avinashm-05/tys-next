"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CaretDownIcon,
  ListIcon,
  PhoneIcon,
  UserCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { UsFlag } from "@/components/public/us-flag";

const NAV_LINKS = [
  { href: "/tracking", label: "Tracking" },
  { href: "/book-shipment", label: "Book Shipment" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

const DESTINATION_LINKS = [
  { href: "/destinations", label: "Worldwide Destinations" },
  { href: "/destinations#moving", label: "Worldwide Moving" },
] as const;

// B1/B2 redesign — Tailwind rebuild matching the new Figma nav. Replaces the
// old Bootstrap-ported header. Mobile menu and the Destinations dropdown are
// plain React state (no Bootstrap JS anymore).
export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full bg-white px-5 py-3 shadow-[0_2px_16px_rgba(16,24,40,0.06)] md:px-7">
        <Link href="/" className="flex shrink-0 items-center">
          <img
            src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png"
            alt="TYS Global Logistics"
            className="h-11 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-base font-medium text-black lg:flex">
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

        <div className="hidden items-center gap-4 lg:flex">
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
            href="/account"
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

      {mobileOpen && (
        <div className="absolute left-4 right-4 top-full z-50 mt-2 flex flex-col gap-1 rounded-2xl border border-brand-light bg-white p-4 shadow-lg md:left-8 md:right-8 lg:hidden">
          {DESTINATION_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-pale"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-pale"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/quotes"
            className="mt-2 rounded-full bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            Get a Free Quote →
          </Link>
          <a
            href="tel:+14047938759"
            className="rounded-full border border-brand px-5 py-2.5 text-center text-sm font-semibold text-brand"
          >
            +1 (404) 793-8759
          </a>
          <Link
            href="/account"
            className="rounded-lg px-3 py-2 text-center text-sm font-medium text-ink hover:bg-brand-pale"
            onClick={() => setMobileOpen(false)}
          >
            My Account
          </Link>
        </div>
      )}
    </header>
  );
}
