import Link from "next/link";
import {
  SquaresFourIcon,
  ReceiptIcon,
  TruckIcon,
  MapPinIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { SignOutButton } from "@/components/public/account/sign-out-button";

// Portal navigation (C1.2). Shipments/Tracking are wired now so the fulfillment
// track (C3–C5) can light them up — their pages render honest empty states.
const ITEMS = [
  ["/account", "Dashboard", SquaresFourIcon],
  ["/account/quotes", "My Quotes", ReceiptIcon],
  ["/account/shipments", "Shipments", TruckIcon],
  ["/account/tracking", "Tracking", MapPinIcon],
  ["/account/profile", "Profile", UserIcon],
] as const;

export function AccountNav({ current }: { current: string }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-1 border-b border-brand-light">
      {ITEMS.map(([href, label, Icon]) => {
        const active = current === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition ${
              active
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <Icon size={16} weight={active ? "fill" : "regular"} />
            {label}
          </Link>
        );
      })}
      <span className="ml-auto pb-3">
        <SignOutButton />
      </span>
    </nav>
  );
}

/** Read-only status pill for quote rows (public styling, no shadcn). */
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  quoted: "bg-brand-pale text-brand",
  accepted: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

export function QuoteStatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize whitespace-nowrap ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-ink"
      }`}
    >
      {status}
    </span>
  );
}

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  new_request: "Booked",
  ready_for_pickup: "Ready for Pickup",
  in_transit: "In Transit",
  delivered: "Delivered",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

const SHIPMENT_STATUS_STYLES: Record<string, string> = {
  new_request: "bg-brand-pale text-brand",
  ready_for_pickup: "bg-brand-pale text-brand",
  in_transit: "bg-amber-50 text-amber-700",
  delivered: "bg-green-50 text-green-700",
  on_hold: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-600",
};

export function ShipmentStatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
        SHIPMENT_STATUS_STYLES[status] ?? "bg-gray-100 text-ink"
      }`}
    >
      {SHIPMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
