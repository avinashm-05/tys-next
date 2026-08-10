"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PaperPlaneTiltIcon, TruckIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";
import { SignOutButton } from "@/components/public/account/sign-out-button";

// Left-sidebar nav (replaces the old top-tab AccountNav) — matches the SFL
// reference's arrangement exactly: just Schedule Shipment + My Shipment(s) +
// Profile, no Dashboard/Quotes/Tracking items. Those pages still exist
// (reachable by direct URL) — this only trims what's linked from the nav.
// "Schedule Shipment" points at /account/schedule, INSIDE the portal, so the
// sidebar survives the click; /book-shipment is now just the logged-out door
// into it. Every item here must stay within the (portal) group for that.
const NAV_ITEMS = [
  { href: "/account/schedule", label: "Schedule Shipment", icon: PaperPlaneTiltIcon },
  { href: "/account/shipments", label: "My Shipments", icon: TruckIcon },
  { href: "/account/profile", label: "Profile", icon: UserIcon },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 md:w-60">
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-brand-light bg-white p-2 md:flex-col md:gap-0.5 md:overflow-visible md:p-3">
        <div className="hidden border-b border-brand-light px-2 pb-3 md:block">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="truncate text-xs text-ink-muted">{email}</p>
        </div>
        <nav className="flex gap-1 md:mt-3 md:flex-col md:gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname ?? "", item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                  active ? "bg-brand text-white" : "text-ink-muted hover:bg-brand-pale hover:text-ink"
                }`}
              >
                <item.icon size={17} weight={active ? "fill" : "regular"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-1 border-t border-brand-light px-3 pt-3 md:mt-3">
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
