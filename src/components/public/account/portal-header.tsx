"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PaperPlaneTiltIcon, TruckIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";
import { SignOutButton } from "@/components/public/account/sign-out-button";

// Customer portal header (2026-09-30 redesign): the same dark navy band,
// blue glow and dot field as the quote page, so the portal reads as part of
// the site rather than a bolted-on dashboard. Menu items are the ones the
// owner set earlier (Schedule Shipment, My Shipments, Profile); they're
// tabs across the band now instead of a left sidebar, which gives the
// forms the full width. The page card overlaps the band's bottom edge.
const NAV_ITEMS = [
  { href: "/account/schedule", label: "Schedule Shipment", short: "Schedule", icon: PaperPlaneTiltIcon },
  { href: "/account/shipments", label: "My Shipments", short: "Shipments", icon: TruckIcon },
  { href: "/account/profile", label: "Profile", short: "Profile", icon: UserIcon },
] as const;

const HEADINGS: Record<string, { title: string; accent: string; sub: string }> = {
  "/account/schedule": {
    title: "Book a",
    accent: "shipment.",
    sub: "Tell us where it's going, who's sending and receiving, and what's in the boxes. We confirm pickup and price with you.",
  },
  "/account/shipments": {
    title: "Your",
    accent: "shipments.",
    sub: "Everything you've booked with us, newest first.",
  },
  "/account/profile": {
    title: "Your",
    accent: "details.",
    sub: "Keep your contact details and address up to date, so bookings fill in faster.",
  },
};

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

export function PortalHeader({ name, email }: { name: string; email: string }) {
  const pathname = usePathname() ?? "";
  const key = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))?.href ?? "";
  const h = HEADINGS[key] ?? { title: "Your", accent: "account.", sub: "" };
  const first = name.split(/\s+/)[0] || "there";

  return (
    <section data-nav-dark className="relative overflow-hidden bg-[#0B1220]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_0%,rgba(3,100,255,0.30),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(60%_70%_at_30%_10%,#000,transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-8 md:px-8 md:pb-28 md:pt-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-white/70">Hi {first},</p>
            <h1 className="mt-1 text-balance text-[2rem] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-[2.6rem]">
              {h.title} <span className="text-[#6FA3FF]">{h.accent}</span>
            </h1>
            {h.sub && <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-white/70">{h.sub}</p>}
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-inset ring-white/10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-[14px] font-bold text-white">
              {initials(name)}
            </span>
            <span className="min-w-0">
              <span className="block max-w-[200px] truncate text-[14px] font-semibold text-white">{name}</span>
              <span className="block max-w-[200px] truncate text-[13px] text-white/60">{email}</span>
            </span>
            <SignOutButton className="ml-2 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-white/80 ring-1 ring-inset ring-white/15 transition hover:bg-white/10 hover:text-white disabled:opacity-60 [&>svg]:hidden sm:[&>svg]:inline" />
          </div>
        </div>

        <nav
          aria-label="Account"
          className="mt-8 inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-white/[0.06] p-1.5 ring-1 ring-inset ring-white/10"
        >
          {NAV_ITEMS.map((item) => {
            const active = item.href === key;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[14.5px] font-semibold transition ${
                  active ? "bg-white text-ink shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)]" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={17} weight={active ? "fill" : "regular"} className={active ? "text-brand" : ""} />
                <span className="sm:hidden">{item.short}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
