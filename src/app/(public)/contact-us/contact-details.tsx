import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/public/home/reveal";
import { LINE } from "@/components/public/page-kit";
import { GOOGLE_PROFILE_URL } from "@/lib/google-reviews";

// The company's contact facts in one place for the pages in this group
// (contact, support, locations, tracking, FAQs, the "is TYS legit" page), so
// the phone, email and address can never drift apart between them. Same
// facts as the footer and OrganizationJsonLd. No opening hours are shown
// because none have been confirmed.
export const CONTACT = {
  phone: "+1 (404) 793-8759",
  tel: "tel:+14047938759",
  email: "sales@tysgloballogistics.com",
  mailto: "mailto:sales@tysgloballogistics.com",
  street: "6111 Morgan Pl Ct NE",
  city: "Atlanta, GA 30324, USA",
  maps: GOOGLE_PROFILE_URL,
  // India office (added 2026-09-29, from the owner).
  indiaStreet: "406, Devashish Business Park, Premchand Nagar Rd, opposite Krishna Complex, Bodakdev",
  indiaCity: "Ahmedabad, Gujarat 380015, India",
  indiaMaps:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("406, Devashish Business Park, Premchand Nagar Rd, Bodakdev, Ahmedabad, Gujarat 380015"),
} as const;

type Item = { icon: ReactNode; label: string; value: ReactNode; action: string; href: string; external?: boolean };

const ITEMS: Item[] = [
  {
    icon: <PhoneIcon size={20} />,
    label: "Call us",
    value: CONTACT.phone,
    action: "Call now",
    href: CONTACT.tel,
  },
  {
    icon: <EnvelopeSimpleIcon size={20} />,
    label: "Email us",
    value: CONTACT.email,
    action: "Write to us",
    href: CONTACT.mailto,
  },
  {
    icon: <MapPinIcon size={20} />,
    label: "US head office",
    value: (
      <>
        {CONTACT.street}
        <br />
        {CONTACT.city}
      </>
    ),
    action: "Open in Google Maps",
    href: CONTACT.maps,
    external: true,
  },
  {
    icon: <MapPinIcon size={20} />,
    label: "India office",
    value: (
      <>
        {CONTACT.indiaStreet}
        <br />
        {CONTACT.indiaCity}
      </>
    ),
    action: "Open in Google Maps",
    href: CONTACT.indiaMaps,
    external: true,
  },
];

/**
 * Phone, email and address as real links.
 * - "row": a full-width hairline grid of three (sits flush in a Section).
 * - "stack": a framed hairline list (sits inside a SplitSection panel).
 */
export function ContactDetails({ layout = "row" }: { layout?: "row" | "stack" }) {
  if (layout === "stack") {
    return (
      <Reveal as="ul" className={`divide-y divide-[var(--line)] overflow-hidden rounded-2xl border ${LINE} bg-white`}>
        {ITEMS.map((it) => (
          <li key={it.label}>
            <a
              href={it.href}
              {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[#F8FAFE] sm:px-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-ink/70 transition-colors group-hover:text-brand">
                {it.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] text-ink-muted">{it.label}</span>
                <span className="block break-words text-[15.5px] font-medium leading-snug text-ink">{it.value}</span>
              </span>
              <ArrowUpRightIcon
                size={15}
                className="mt-1 shrink-0 text-[#B7C0CD] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
              />
            </a>
          </li>
        ))}
      </Reveal>
    );
  }

  return (
    <div className={`-mb-px grid grid-cols-1 border-t ${LINE} md:grid-cols-2 xl:grid-cols-4`}>
      {ITEMS.map((it, i) => (
        <Reveal
          key={it.label}
          as="a"
          delay={i * 60}
          href={it.href}
          {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`group flex flex-col border-b ${LINE} p-6 transition-colors hover:bg-[#F8FAFE] sm:p-8 ${i % 2 === 0 ? "md:border-r" : "md:border-r-0"} ${i < ITEMS.length - 1 ? "xl:border-r" : "xl:border-r-0"}`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-ink/70 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition duration-300 group-hover:border-[#C9D6EE] group-hover:text-brand">
            {it.icon}
          </span>
          <span className="mt-5 text-[14px] text-ink-muted">{it.label}</span>
          <span className="mt-1 break-words text-[17px] font-semibold leading-snug tracking-[-0.015em] text-ink">
            {it.value}
          </span>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-ink transition-colors group-hover:text-brand">
            {it.action} <ArrowUpRightIcon size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Reveal>
      ))}
    </div>
  );
}

/** The contact page's hero tool (in the quote bar's place): call or email
 *  in one tap, with the quote as a quieter third option. */
export function ContactQuickActions() {
  return (
    <div className="rounded-[28px] bg-white p-3 shadow-[0_0_0_1px_rgba(3,100,255,0.14),0_40px_80px_-36px_rgba(3,100,255,0.55)]">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <a href={CONTACT.tel} className="group flex items-center gap-4 rounded-2xl bg-[radial-gradient(120%_120%_at_30%_0%,#3D86FF_0%,#0364FF_60%)] px-5 py-4 text-white transition hover:brightness-105 active:scale-[0.99]">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25">
            <PhoneIcon size={20} />
          </span>
          <span className="text-left">
            <span className="block text-[13px] text-white/75">Call us</span>
            <span className="block text-[18px] font-semibold tracking-[-0.01em]">{CONTACT.phone}</span>
          </span>
        </a>
        <a href={CONTACT.mailto} className="group flex items-center gap-4 rounded-2xl bg-[#F4F7FC] px-5 py-4 text-ink ring-1 ring-inset ring-[#E2E9F5] transition hover:bg-[#EEF3FB] active:scale-[0.99]">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-ink/70 group-hover:text-brand">
            <EnvelopeSimpleIcon size={20} />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-[13px] text-ink-muted">Email us</span>
            <span className="block truncate text-[16px] font-semibold tracking-[-0.01em]">{CONTACT.email}</span>
          </span>
        </a>
      </div>
      <p className="px-2 pb-1 pt-3 text-center text-[14px] text-ink-muted">
        Want a price? <Link href="/quotes" className="font-medium text-brand underline-offset-4 hover:underline">Get a free quote</Link> in about a minute.
      </p>
    </div>
  );
}
