"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowSquareOutIcon,
  ListIcon,
  PaperPlaneTiltIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { SignOutButton } from "@/components/public/account/sign-out-button";

// Customer portal frame (2026-09-30), built the way Attio builds its app:
// ONE connected screen, not floating blocks. A full-height sidebar (logo,
// the owner's three items, help, and who's signed in at the bottom) and, to
// its right, a thin top bar carrying the page title plus the page itself on
// a quiet grey canvas. Only the right side ever changes, so switching
// between Schedule / Shipments / Profile never moves anything. TYS blue marks
// the active item; the marketing header, promo bar and footer are hidden on
// these routes (conditional-header/-footer).
export const PORTAL_NAV = [
  {
    href: "/account/schedule",
    label: "Schedule Shipment",
    icon: PaperPlaneTiltIcon,
    title: "Schedule Shipment",
    sub: "Four short steps. We confirm pickup and price with you before anything ships.",
  },
  {
    href: "/account/shipments",
    label: "My Shipments",
    icon: TruckIcon,
    title: "My Shipments",
    sub: "Everything you've booked with us, newest first.",
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: UserIcon,
    title: "Profile",
    sub: "Your details, saved address and sign-in settings.",
  },
] as const;

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}

function usePortalPage() {
  const pathname = usePathname() ?? "";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const page = PORTAL_NAV.find((i) => isActive(i.href));
  return { isActive, page };
}

function SidebarBody({ name, email, onNavigate }: { name: string; email: string; onNavigate?: () => void }) {
  const { isActive } = usePortalPage();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-[#E6E8EC] px-5">
        <Link href="/" title="Back to the TYS website" className="flex items-center" onClick={onNavigate}>
          {/* eslint-disable-next-line @next/next/no-img-element -- same static logo the site header uses */}
          <img src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png" alt="TYS Global Logistics" width={480} height={177} className="h-8 w-auto" />
        </Link>
      </div>

      <nav aria-label="Account" className="flex flex-col gap-0.5 px-3 pt-4">
        <p className="px-3 pb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#8A94A6]">Shipping</p>
        {PORTAL_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] font-medium transition-colors ${
                active ? "bg-[#EBF2FF] text-brand" : "text-[#3A4353] hover:bg-[#F2F4F7] hover:text-ink"
              }`}
            >
              <item.icon size={18} weight={active ? "fill" : "regular"} className={active ? "text-brand" : "text-[#6B778A]"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-3">
        <div className="rounded-xl border border-[#E6E8EC] bg-[#F9FAFB] p-3.5">
          <p className="text-[13.5px] font-semibold text-ink">Need a hand?</p>
          <p className="mt-0.5 text-[13px] leading-snug text-[#5B6472]">A real person answers, Monday to Saturday.</p>
          <div className="mt-2.5 flex flex-col gap-1.5">
            <a href="tel:+14047938759" className="flex items-center gap-2 text-[13.5px] font-semibold text-ink hover:text-brand">
              <PhoneIcon size={15} className="text-brand" /> +1 (404) 793-8759
            </a>
            <a href="https://wa.me/14044354574" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13.5px] font-semibold text-ink hover:text-brand">
              <WhatsappLogoIcon size={15} weight="fill" className="text-[#1FAF5A]" /> WhatsApp us
            </a>
          </div>
        </div>
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13.5px] font-medium text-[#3A4353] hover:bg-[#F2F4F7]">
          <ArrowSquareOutIcon size={16} className="text-[#6B778A]" /> Back to website
        </Link>
        <div className="flex items-center gap-2.5 border-t border-[#E6E8EC] px-1 pt-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">{initials(name)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13.5px] font-semibold leading-tight text-ink">{name}</span>
            <span className="block truncate text-[12.5px] leading-tight text-[#5B6472]">{email}</span>
          </span>
          <SignOutButton className="shrink-0 rounded-lg px-2 py-1.5 text-[12.5px] font-semibold text-[#3A4353] ring-1 ring-inset ring-[#DCE0E6] transition hover:bg-[#F2F4F7] disabled:opacity-60 [&>svg]:hidden" />
        </div>
      </div>
    </div>
  );
}

export function PortalFrame({ name, email, children }: { name: string; email: string; children: React.ReactNode }) {
  const { page } = usePortalPage();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-[100svh] bg-[#F4F6F9]">
      {/* Desktop sidebar: fixed, full height. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] border-r border-[#E6E8EC] bg-white lg:block">
        <SidebarBody name={name} email={email} />
      </aside>

      {/* Phones/tablets: the same sidebar as a sheet. */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-[#0B1220]/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-xl">
            <SidebarBody name={name} email={email} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[256px]">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-[#E6E8EC] bg-white px-4 md:px-8">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="-ml-1 rounded-lg p-2 text-ink hover:bg-[#F2F4F7] lg:hidden">
            <ListIcon size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[#8A94A6]">Customer portal</p>
            <h1 className="truncate text-[17px] font-semibold leading-tight tracking-[-0.01em] text-ink">{page?.title ?? "Your account"}</h1>
          </div>
          <p className="ml-6 hidden max-w-[520px] truncate border-l border-[#E6E8EC] pl-6 text-[14px] text-[#5B6472] xl:block">{page?.sub}</p>
          <a href="tel:+14047938759" className="ml-auto hidden items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-medium text-[#3A4353] hover:bg-[#F2F4F7] md:flex">
            <PhoneIcon size={16} className="text-brand" /> +1 (404) 793-8759
          </a>
        </header>
        <main className="flex-1 px-4 py-5 md:px-8 md:py-6">{children}</main>
      </div>
    </div>
  );
}
