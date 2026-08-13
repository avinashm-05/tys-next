import type { Metadata } from "next";
import Link from "next/link";
import { TruckIcon } from "@phosphor-icons/react/dist/ssr";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { PortalCard } from "@/components/public/account/portal-card";
import {
  ShipmentsTable,
  type PortalShipmentRow,
} from "@/components/public/account/shipments-table";

export const metadata: Metadata = { title: "My Shipments — TYS Global Logistics" };

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

// C-portal "My Shipment" list, laid out to match the reference hub: a titled
// card with the sender/receiver city and state broken out into their own
// sortable, filterable columns, and paging underneath. Scoped to the real
// userId FK (unlike Quote, which only has a denormalized email).
export default async function ShipmentsPage() {
  const session = await requireCustomerPage();
  const shipments = await db.shipment.findMany({
    // doNotShowOnMyShipment is the admin's "Do not show on My Shipment"
    // checkbox (Packages tab). It's the customer-facing half of that control
    // — without it here the box saves happily and changes nothing, which is
    // what it did until this filter was added.
    where: { userId: BigInt(session.user.id), doNotShowOnMyShipment: false },
    orderBy: { id: "desc" },
    take: 50,
  });

  const rows: PortalShipmentRow[] = shipments.map((s) => ({
    id: Number(s.id),
    date: s.createdAt ? dateFmt.format(s.createdAt) : "—",
    trackingNumber: s.trackingNumber,
    senderName: s.senderContactName,
    senderCity: s.senderCity,
    senderState: s.senderState,
    receiverName: s.recipientContactName,
    receiverCity: s.recipientCity,
    receiverState: s.recipientState,
    shipmentType: s.shipmentType,
    status: s.status,
  }));

  return (
    <PortalCard
      icon={TruckIcon}
      title="My Shipments"
      action={
        <Link
          href="/account/schedule"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Schedule Shipment
        </Link>
      }
    >
      <ShipmentsTable rows={rows} />
    </PortalCard>
  );
}
