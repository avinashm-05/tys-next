import Link from "next/link";
import { InstagramLogoIcon, LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr";

const SERVICES = [
  { href: "/destinations", label: "Worldwide Shipping" },
  { href: "/destinations/moving", label: "Worldwide Moving" },
  { href: "/services/domestic-shipping", label: "Domestic Shipping" },
  { href: "/services/domestic-moving", label: "Domestic Moving" },
  { href: "/services/auto-transport", label: "Auto Transport" },
] as const;

const RESOURCES = [
  { href: "/destinations", label: "Worldwide Destinations" },
  { href: "/services/retailer-shipping", label: "Small Business Shipping" },
  { href: "/services/global-shopper", label: "Shop US and Ship Worldwide" },
  { href: "/services/freight-forwarding", label: "Origin & Destination Services" },
  { href: "/blog", label: "Blog" },
] as const;

// "Book Shipment" temporarily hidden — see the matching note in site-header.tsx.
const HELP = [
  { href: "/tracking", label: "Track Shipment" },
  { href: "/quotes", label: "Get Quote" },
  { href: "/contact-us", label: "Contact Us" },
] as const;

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/security", label: "Security" },
  { href: "/sitemap", label: "Sitemap" },
] as const;

// B1 redesign — measured directly off the published Figma Sites link (DOM
// inspection, not a screenshot): the footer is a fully inset floating card
// (24px margin on every side, not full-bleed), 24px radius on all 4 corners,
// 48px padding, solid white text throughout (no opacity fades), Inter
// 16px/600 headings, 14px/400 links, 12px/400 legal links.
export function SiteFooter() {
  return (
    <footer className="mx-6 mb-6 rounded-3xl bg-brand p-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <img
              src="/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png"
              alt="TYS Global Logistics"
              width={480}
              height={177}
              draggable={false}
              className="h-14 w-auto select-none"
            />
            <p className="mt-4 max-w-xs text-sm text-white">
              Make shipping and moving easy with instant quotes and expert guidance!
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white">
              {LEGAL.map((l, i) => (
                <span key={l.label} className="flex items-center gap-2">
                  <Link href={l.href} className="hover:text-white/80">
                    {l.label}
                  </Link>
                  {i < LEGAL.length - 1 && <span aria-hidden>|</span>}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.linkedin.com/company/tys-global-logistics/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand hover:bg-brand-pale"
              >
                <LinkedinLogoIcon size={18} weight="fill" />
              </a>
              <a
                href="https://www.instagram.com/tysgloballogistics"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand hover:bg-brand-pale"
              >
                <InstagramLogoIcon size={18} weight="fill" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white">Services</h3>
            <ul className="mt-4 space-y-3 text-sm text-white">
              {SERVICES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white/80">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white">Resources</h3>
            <ul className="mt-4 space-y-3 text-sm text-white">
              {RESOURCES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white/80">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white">Help</h3>
            <ul className="mt-4 space-y-3 text-sm text-white">
              {HELP.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white/80">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-sm text-white">
          © 2026 TYS Global Logistics LLC. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
