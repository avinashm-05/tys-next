"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROMO_KEY } from "@/lib/promo";
import { quoteHref } from "@/lib/quote-context";
import { FlagIcon } from "@/components/public/flag-icon";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  BriefcaseIcon,
  ChartLineUpIcon,
  CaretDownIcon,
  CarProfileIcon,
  CreditCardIcon,
  EnvelopeSimpleIcon,
  GlobeIcon,
  HouseLineIcon,
  ListIcon,
  MapPinIcon,
  PackageIcon,
  PaperPlaneTiltIcon,
  PhoneIcon,
  PianoKeysIcon,
  QuestionIcon,
  ShippingContainerIcon,
  SquaresFourIcon,
  StorefrontIcon,
  SuitcaseRollingIcon,
  SpinnerGapIcon,
  TruckIcon,
  UserCircleIcon,
  XIcon,
} from "@phosphor-icons/react";

// Book Shipment isn't a nav DROPDOWN item: it's the "Book now" action
// next to the quote button (see below), which leads into the portal.
//
// Account entry points (hidden 2026-08-11, launched 2026-09-30): "Book now"
// (SFL-style: log in / sign up, then straight into booking) plus a quiet
// "Sign in" link, in the bar and in the mobile sheet. /account sends signed-out visitors to the login page and signed-in
// customers straight to their shipments.
//
// 2026-09-29 redesign, modelled on Attio's navigation (user's request):
// - Desktop: a full-width flat bar, every destination reachable from it,
//   grouped into three dropdowns plus two plain links. No menu button.
// - Dropdowns: ONE shared panel (Attio's move, as built for Tirupati). It
//   fades in under the first menu you hover; moving to the next trigger
//   glides it across and resizes it to fit, while the old page slides out
//   and the new one slides in from the side you came from. Each item is an
//   icon, a title and a one-line description.
// - A thin announcement bar above the nav (scrolls away, dismissible).
// - Mobile: a full-width sheet under the bar with collapsible groups in
//   plain text and the two actions pinned at the bottom.

type NavItem = { href: string; label: string; desc: string; icon: Icon };
type Group = { key: string; label: string; items: NavItem[]; wide?: boolean };

const GROUPS: Group[] = [
  {
    key: "services",
    label: "Services",
    wide: true,
    items: [
      { href: "/services/parcel-shipping", label: "Parcel shipping", desc: "Discounted FedEx, DHL, UPS and USPS rates", icon: PackageIcon },
      { href: "/services/document-shipping", label: "Document shipping", desc: "Important papers, tracked worldwide", icon: EnvelopeSimpleIcon },
      { href: "/services/baggage-shipping", label: "Baggage shipping", desc: "Send luggage ahead, skip excess fees", icon: SuitcaseRollingIcon },
      { href: "/services/international-relocation", label: "International relocation", desc: "Your household, door to door", icon: HouseLineIcon },
      { href: "/services/auto-transport", label: "Auto transport", desc: "Cars and motorcycles, insured", icon: CarProfileIcon },
      { href: "/services/piano-moving", label: "Piano moving", desc: "Upright and grand pianos, moved with care", icon: PianoKeysIcon },
      { href: "/services/freight-forwarding", label: "Freight forwarding", desc: "Air, ocean, rail and road cargo", icon: ShippingContainerIcon },
      { href: "/services/global-shopper", label: "Global Shopper", desc: "A free US address for online shopping", icon: StorefrontIcon },
      { href: "/services/small-business-shipping", label: "Small business", desc: "Discounted rates for sellers and SMBs", icon: ChartLineUpIcon },
      { href: "/services", label: "All services", desc: "Everything we ship and move", icon: ListIcon },
    ],
  },
  {
    key: "destinations",
    label: "Destinations",
    items: [
      { href: "/destinations", label: "Worldwide destinations", desc: "Every country we ship parcels and freight to", icon: GlobeIcon },
      { href: "/destinations/moving", label: "Worldwide moving", desc: "Door-to-door moves, country by country", icon: TruckIcon },
    ],
  },
  {
    key: "company",
    label: "Company",
    wide: true,
    items: [
      { href: "/about-us", label: "About us", desc: "Who we are and how we work", icon: BriefcaseIcon },
      { href: "/carriers", label: "Major carriers", desc: "The networks we book with", icon: PaperPlaneTiltIcon },
      { href: "/resources", label: "Resources", desc: "Customs, duties and packing guides", icon: SquaresFourIcon },
      { href: "/faqs", label: "FAQs", desc: "Answers to common questions", icon: QuestionIcon },
      { href: "/locations", label: "Locations", desc: "Where to find us", icon: MapPinIcon },
      { href: "/blog", label: "Blog", desc: "Shipping and moving guides", icon: BookOpenIcon },
      { href: "/contact-us/pay", label: "Pay online", desc: "Settle an invoice securely", icon: CreditCardIcon },
    ],
  },
];

const NAV_LINKS = [
  { href: "/tracking", label: "Tracking" },
  { href: "/contact-us", label: "Contact" },
] as const;

const MENU_EASE = "cubic-bezier(0.22, 0.8, 0.3, 1)";

// One collapsible group in the phone menu: the header's chevron turns as
// the list slides open (grid rows 0fr -> 1fr, no measuring), and each item
// carries its icon and one-line description.
function MobileGroup({
  group,
  open,
  active,
  pathname,
  tabbable,
  pending,
  onToggle,
  onNavigate,
}: {
  group: Group;
  open: boolean;
  active: boolean;
  pathname: string;
  tabbable: boolean;
  /** The link just tapped, while its page loads. */
  pending: string | null;
  onToggle: () => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <>
      <button
        type="button"
        tabIndex={tabbable ? 0 : -1}
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between py-4 text-left text-[17px] font-medium ${active ? "text-brand" : "text-ink"}`}
      >
        {group.label}
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-300 ${open ? "bg-[#EEF4FF] text-brand" : "text-ink-muted"}`}
        >
          <CaretDownIcon
            size={13}
            weight="bold"
            className="transition-transform duration-[400ms]"
            style={{ transform: open ? "rotate(180deg)" : "none", transitionTimingFunction: MENU_EASE }}
          />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[450ms]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", transitionTimingFunction: MENU_EASE }}
      >
        <ul className="overflow-hidden">
          {group.items.map((item, j) => (
            <li
              key={item.href}
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateY(-4px)",
                transition: `opacity 300ms ease-out ${open ? j * 30 : 0}ms, transform 400ms ${MENU_EASE} ${open ? j * 30 : 0}ms`,
              }}
            >
              <Link
                href={item.href}
                tabIndex={tabbable && open ? 0 : -1}
                onClick={() => onNavigate(item.href)}
                className={`flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors active:bg-[#F2F5FA] ${pathname === item.href || pending === item.href ? "bg-[#F5F8FE]" : ""}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${pathname === item.href ? "border-[#C9D6EE] text-brand" : "border-[#E6E8EC] text-ink/70"} bg-white`}>
                  <item.icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-ink">{item.label}</span>
                  <span className="block truncate text-[13px] text-ink-muted">{item.desc}</span>
                </span>
                {pending === item.href && <SpinnerGapIcon size={16} className="mr-1 shrink-0 animate-spin text-brand" />}
              </Link>
            </li>
          ))}
          <li className="h-3" aria-hidden />
        </ul>
      </div>
    </>
  );
}

/** Safari / iOS WebKit, flagged on <html> by RevealObserver. */
const isWebKit = () => typeof document !== "undefined" && document.documentElement.classList.contains("no-blur");

const PILL = "flex h-9 items-center gap-1 rounded-[10px] px-3 transition-colors duration-300";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  // Every group starts collapsed, so all five rows are visible at once.
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const [sheetTop, setSheetTop] = useState(64);
  const pathname = usePathname();

  // Tapping a link in the phone menu keeps the menu up (with a spinner on
  // that link) until the new page has actually arrived, then closes it.
  // Closing on tap showed the old page underneath for a beat before the new
  // one swapped in, which read as a glitch (2026-09-29). Adjusted during
  // render when the path changes (React's "adjust state on prop change"
  // pattern), so the close lands in the same paint as the new page.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setPendingHref(null);
    setMobileOpen(false);
  }
  useEffect(() => {
    if (!pendingHref) return;
    // Never leave the menu stuck open if a navigation stalls.
    const t = window.setTimeout(() => {
      setPendingHref(null);
      setMobileOpen(false);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [pendingHref]);
  const navigateFromMenu = (href: string) => {
    const path = href.split(/[?#]/)[0];
    if (path === pathname) {
      setMobileOpen(false);
      return;
    }
    setPendingHref(href);
  };
  // Dark bar while it's over a dark section (any element marked
  // data-nav-dark, e.g. the home page's night band), like Attio's. The menu
  // sheet always opens on the light bar.
  const [overDark, setOverDark] = useState(false);
  const [darkBg, setDarkBg] = useState("rgb(6, 10, 20)");
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const header = headerRef.current;
      if (!header) return;
      const bottom = header.getBoundingClientRect().bottom;
      const mid = bottom - 32;
      // A dark section that starts right under the bar counts too (the
      // quote page's navy hero), so the bar reads as part of it rather than
      // a white strip on top of a dark page.
      const hit = [...document.querySelectorAll("[data-nav-dark]")].find((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= bottom + 1 && r.bottom >= mid;
      });
      setOverDark(!!hit);
      // Take the section's own navy, so the bar blends into it exactly (the
      // home page's night band and the quote page use different shades).
      if (hit) setDarkBg(getComputedStyle(hit).backgroundColor);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  // Shared dropdown panel: where it sits, its size, and whether the move
  // should animate (not on the first open, which appears in place).
  const [panel, setPanel] = useState({ x: 0, w: 340, h: 0, glide: false });
  const [dir, setDir] = useState(1);
  const navRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const pages = useRef<Record<string, HTMLDivElement | null>>({});
  const closeTimer = useRef<number | undefined>(undefined);

  const openMenu = (key: string) => {
    window.clearTimeout(closeTimer.current);
    const nav = navRef.current;
    const btn = triggers.current[key];
    const page = pages.current[key];
    if (!nav || !btn || !page) return;
    const x = btn.getBoundingClientRect().left - nav.getBoundingClientRect().left - 8;
    const order = GROUPS.findIndex((g) => g.key === key);
    const prev = GROUPS.findIndex((g) => g.key === openGroup);
    setDir(prev === -1 || order >= prev ? 1 : -1);
    setPanel({ x, w: page.offsetWidth, h: page.offsetHeight, glide: openGroup !== null });
    setOpenGroup(key);
  };
  const closeMenu = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenGroup(null), 140);
  };
  const keepMenu = () => window.clearTimeout(closeTimer.current);

  // Lock page scroll behind the open mobile sheet.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const groupActive = (g: Group) => g.items.some((i) => pathname.startsWith(i.href));
  const dark = overDark && !mobileOpen;
  // Each item sets its own colour (not inherited from the nav), so every
  // item fades together when the bar switches tone.
  const pillHover = dark
    ? "text-white/80 hover:bg-white/10 hover:text-white"
    : "text-ink/80 hover:bg-[#F2F3F5] hover:text-ink";
  const pillOn = dark ? "bg-white/10 text-white" : "bg-[#F2F3F5] text-ink";

  const toggleMobile = () => {
    // The sheet hangs from the bar's bottom edge, which moves while the
    // announcement bar is still on screen.
    const bottom = headerRef.current?.getBoundingClientRect().bottom;
    if (bottom) setSheetTop(Math.round(bottom));
    setMobileOpen((v) => !v);
  };

  return (
    <>
    <PromoBar />
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 select-none border-b transition-colors duration-300 ${dark ? "border-white/10" : "border-[#E6EAF0] bg-white/95"}`}
      style={dark ? { backgroundColor: darkBg } : undefined}
    >
      <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-6 px-5 sm:px-10 lg:px-14">
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setMobileOpen(false)}>
          {/* The one image on the public site guaranteed to be above the
              fold on every page load: eager + high priority so it never
              competes with the rest of the page for bandwidth. */}
          <img
            src={dark ? "/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png" : "/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png"}
            alt="TYS Global Logistics"
            width={480}
            height={177}
            draggable={false}
            loading="eager"
            fetchPriority="high"
            className="h-9 w-auto select-none"
          />
        </Link>

        <nav
          ref={navRef}
          className="relative hidden items-center gap-0.5 whitespace-nowrap text-[15px] font-medium xl:flex"
          onMouseLeave={closeMenu}
        >
          {GROUPS.map((g) => {
            const open = openGroup === g.key;
            return (
              <button
                key={g.key}
                ref={(el) => {
                  triggers.current[g.key] = el;
                }}
                type="button"
                className={`${PILL} ${pillHover} ${open || groupActive(g) ? pillOn : ""}`}
                onMouseEnter={() => openMenu(g.key)}
                onFocus={() => openMenu(g.key)}
                onClick={() => (open ? setOpenGroup(null) : openMenu(g.key))}
                aria-expanded={open}
              >
                {g.label}
                <CaretDownIcon size={12} weight="bold" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
              </button>
            );
          })}
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onMouseEnter={closeMenu}
              className={`${PILL} ${pillHover} ${pathname === l.href ? pillOn : ""}`}
            >
              {l.label}
            </Link>
          ))}

          {/* The shared panel. pt-2 bridges the gap under the triggers so
              moving down into it never closes it. Every page stays mounted
              (so each can be measured and cross-slide); only the open one
              is visible and clickable. */}
          <div
            className={`absolute left-0 top-full pt-2 transition-opacity duration-200 ease-out ${openGroup ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
            style={{
              transform: `translate3d(${panel.x}px, ${openGroup ? 0 : -4}px, 0)`,
              willChange: "transform, opacity",
              transition: panel.glide
                ? "transform 320ms cubic-bezier(0.22, 0.8, 0.25, 1), opacity 200ms ease-out"
                : "opacity 200ms ease-out, transform 200ms ease-out",
            }}
            onMouseEnter={keepMenu}
          >
            <div
              className="relative overflow-hidden whitespace-normal rounded-2xl border border-[#E6E8EC] bg-white shadow-[0_24px_60px_-24px_rgba(16,24,40,0.28),0_2px_6px_-2px_rgba(16,24,40,0.06)]"
              style={{
                width: panel.w,
                height: panel.h,
                // Safari/iOS (html.no-blur, set by RevealObserver) can't
                // animate width/height smoothly: every frame relays out the
                // panel, which read as jitter when moving between menus
                // (2026-09-30). There the panel snaps to size and the glide
                // plus crossfade carry the motion; elsewhere it still resizes
                // smoothly, Attio-style.
                transition:
                  panel.glide && !isWebKit()
                    ? "width 320ms cubic-bezier(0.22, 0.8, 0.25, 1), height 320ms cubic-bezier(0.22, 0.8, 0.25, 1)"
                    : "none",
              }}
            >
              {GROUPS.map((g) => {
                const on = openGroup === g.key;
                return (
                  <div
                    key={g.key}
                    ref={(el) => {
                      pages.current[g.key] = el;
                    }}
                    aria-hidden={!on}
                    className={`absolute left-0 top-0 p-2 ${g.wide ? "grid w-[600px] grid-cols-2" : "w-[340px]"} ${on ? "pointer-events-auto" : "pointer-events-none"}`}
                    style={{
                      opacity: on ? 1 : 0,
                      transform: on ? "translateX(0)" : `translateX(${dir * -28}px)`,
                      transition: "opacity 220ms ease-out, transform 320ms cubic-bezier(0.22, 0.8, 0.25, 1)",
                    }}
                  >
                    {g.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        tabIndex={on ? 0 : -1}
                        onClick={() => setOpenGroup(null)}
                        className="group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F5F6F8]"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E6E8EC] bg-white text-ink/70 transition-colors group-hover/item:border-[#C9D6EE] group-hover/item:text-brand">
                          <item.icon size={16} />
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-ink">{item.label}</span>
                          <span className="block text-[13px] leading-snug text-ink-muted">{item.desc}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap">
          <a
            href="tel:+14047938759"
            className={`btn hidden text-[15px] xl:inline-flex ${dark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink/80 hover:bg-[#F2F3F5] hover:text-ink"}`}
          >
            <PhoneIcon size={15} />
            +1 (404) 793-8759
          </a>
          {/* Icon-only until 2xl: at 1280px the full nav + phone + Book now
              + quote leave no room, and the flag was pushed off the edge. */}
          <Link
            href="/account"
            title="Sign in"
            aria-label="Sign in"
            className={`btn hidden text-[15px] lg:inline-flex max-2xl:px-2.5 ${dark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink/80 hover:bg-[#F2F3F5] hover:text-ink"}`}
          >
            <UserCircleIcon size={19} />
            <span className="hidden 2xl:inline">Sign in</span>
          </Link>
          {/* "Book now", like SFL's: /book-shipment is the log-in / sign-up
              door, and a signed-in customer goes straight into Schedule
              Shipment inside the portal. */}
          <Link
            href="/book-shipment"
            className={`btn hidden border md:inline-flex ${dark ? "border-white/25 text-white hover:bg-white/10" : "border-[#D9DEE7] bg-white text-ink hover:bg-[#F2F3F5]"}`}
          >
            Book now
          </Link>
          <Link href={quoteHref(pathname)} className="btn btn-primary hidden sm:inline-flex">
            Get a free quote
            <ArrowRightIcon size={14} />
          </Link>
          {/* US flag: a US company, shipping from the US (it was on the old
              header; restored 2026-09-30 at the owner's request). */}
          <span title="United States" className="ml-1.5 hidden shrink-0 items-center sm:flex">
            <FlagIcon code="US" className="h-[18px] !w-6 shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(16,24,40,0.08)]" />
          </span>
          {/* Two lines that morph into an X (and back), with a small press. */}
          <button
            type="button"
            className={`relative ml-1 h-10 w-10 rounded-xl transition duration-200 active:scale-90 xl:hidden ${dark ? "hover:bg-white/10" : "hover:bg-[#F2F3F5]"} ${mobileOpen ? "bg-[#F2F4F7]" : ""}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={toggleMobile}
          >
            <span
              aria-hidden
              className={`absolute left-1/2 top-1/2 h-[1.75px] w-[18px] rounded-full transition-[transform,background-color] duration-[350ms] ${dark ? "bg-white" : "bg-ink"}`}
              style={{
                transform: mobileOpen ? "translate(-50%, -50%) rotate(45deg)" : "translate(-50%, calc(-50% - 4px))",
                transitionTimingFunction: MENU_EASE,
              }}
            />
            <span
              aria-hidden
              className={`absolute left-1/2 top-1/2 h-[1.75px] w-[18px] rounded-full transition-[transform,background-color] duration-[350ms] ${dark ? "bg-white" : "bg-ink"}`}
              style={{
                transform: mobileOpen ? "translate(-50%, -50%) rotate(-45deg)" : "translate(-50%, calc(-50% + 4px))",
                transitionTimingFunction: MENU_EASE,
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile sheet. Its position, visibility and closed state are set
          inline, with no dependency on the stylesheet: on a real mobile
          connection where the CSS lands a beat after the HTML, class-only
          positioning is inert and a menu renders as an unstyled list on top
          of the page (seen in a MobileSafari recording, 2026-08-06).
          2026-09-29: rows cascade in when it opens, groups slide open with
          their chevron turning, and each item shows its icon and one line,
          like the desktop dropdowns. */}
      <div
        aria-hidden={!mobileOpen}
        style={{
          position: "fixed",
          top: sheetTop,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: mobileOpen ? 1 : 0,
          transform: mobileOpen ? "translateY(0)" : "translateY(-8px)",
          visibility: mobileOpen ? "visible" : "hidden",
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: `opacity 250ms ease-out, transform 350ms ${MENU_EASE}, visibility 0s linear ${mobileOpen ? "0s" : "250ms"}`,
        }}
        className="z-40 flex flex-col bg-white xl:hidden"
      >
        <nav data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 sm:px-10">
          {[...GROUPS.map((g) => ({ kind: "group" as const, g })), ...NAV_LINKS.map((l) => ({ kind: "link" as const, l }))].map(
            (row, i) => (
              <div
                key={row.kind === "group" ? row.g.key : row.l.href}
                className="border-b border-[#EEF0F3]"
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "none" : "translateY(10px)",
                  transition: `opacity 350ms ease-out ${mobileOpen ? 80 + i * 45 : 0}ms, transform 450ms ${MENU_EASE} ${mobileOpen ? 80 + i * 45 : 0}ms`,
                }}
              >
                {row.kind === "group" ? (
                  <MobileGroup
                    group={row.g}
                    open={mobileGroup === row.g.key}
                    active={groupActive(row.g)}
                    pathname={pathname}
                    tabbable={mobileOpen}
                    pending={pendingHref}
                    onToggle={() => setMobileGroup(mobileGroup === row.g.key ? null : row.g.key)}
                    onNavigate={navigateFromMenu}
                  />
                ) : (
                  <Link
                    href={row.l.href}
                    tabIndex={mobileOpen ? 0 : -1}
                    onClick={() => navigateFromMenu(row.l.href)}
                    className={`group flex items-center justify-between py-4 text-[17px] font-medium transition-colors active:text-brand ${pathname === row.l.href || pendingHref === row.l.href ? "text-brand" : "text-ink"}`}
                  >
                    {row.l.label}
                    {pendingHref === row.l.href ? (
                      <SpinnerGapIcon size={16} className="animate-spin text-brand" />
                    ) : (
                      <ArrowRightIcon size={16} className="text-ink/35 transition-transform duration-300 group-active:translate-x-1" />
                    )}
                  </Link>
                )}
              </div>
            ),
          )}
        </nav>
        <div
          className="grid gap-2 border-t border-[#EEF0F3] bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-10"
          style={{
            opacity: mobileOpen ? 1 : 0,
            transform: mobileOpen ? "none" : "translateY(12px)",
            transition: `opacity 350ms ease-out ${mobileOpen ? 260 : 0}ms, transform 450ms ${MENU_EASE} ${mobileOpen ? 260 : 0}ms`,
          }}
        >
          <Link
            href={quoteHref(pathname)}
            tabIndex={mobileOpen ? 0 : -1}
            onClick={() => navigateFromMenu("/quotes")}
            className="btn btn-primary btn-lg group w-full"
          >
            Get a free quote{" "}
            {pendingHref === "/quotes" ? (
              <SpinnerGapIcon size={15} className="animate-spin" />
            ) : (
              <ArrowRightIcon size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            )}
          </Link>
          <Link
            href="/book-shipment"
            tabIndex={mobileOpen ? 0 : -1}
            onClick={() => navigateFromMenu("/book-shipment")}
            className="btn btn-secondary btn-lg w-full"
          >
            Book now
          </Link>
          <a href="tel:+14047938759" tabIndex={mobileOpen ? 0 : -1} className="btn btn-secondary btn-lg w-full">
            <PhoneIcon size={15} /> +1 (404) 793-8759
          </a>
          <Link
            href="/account"
            tabIndex={mobileOpen ? 0 : -1}
            onClick={() => navigateFromMenu("/account")}
            className="mx-auto inline-flex items-center gap-1.5 py-1.5 text-sm font-medium text-ink/70 hover:text-ink"
          >
            <UserCircleIcon size={16} /> Sign in to your account
          </Link>
        </div>
      </div>
    </header>
    </>
  );
}


// Thin offer bar above the nav, like Attio's. It scrolls away with the page
// (only the nav is sticky) and remembers being closed on this browser.
const noSubscribe = () => () => {};
const readDismissed = () => {
  try {
    return localStorage.getItem(PROMO_KEY) === "1";
  } catch {
    return false; // storage blocked: just keep showing it
  }
};

function PromoBar() {
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  // Server render always shows the bar; the browser then reads the flag.
  const dismissed = useSyncExternalStore(noSubscribe, readDismissed, () => false);

  if (closed || dismissed) return null;
  return (
    <div data-promo-bar className="relative bg-[#0B1220] text-white">
      <div className="mx-auto flex h-10 max-w-[1320px] items-center justify-center px-12 text-[13.5px] font-medium sm:text-sm">
        <Link href={quoteHref(pathname)} className="group inline-flex items-center gap-1.5 truncate">
          <span className="sm:hidden">Extra 20% off your first shipment</span>
          <span className="hidden sm:inline">Save an extra 20% on your first shipment</span>
          <ArrowRightIcon size={14} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            setClosed(true);
            try {
              localStorage.setItem(PROMO_KEY, "1");
            } catch {
              /* ignore */
            }
          }}
          className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:right-5"
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  );
}
