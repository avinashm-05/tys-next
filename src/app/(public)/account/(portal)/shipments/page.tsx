import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircleIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/ssr";
import { countryName } from "@/lib/countries";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ShipmentsTable,
  type PortalShipmentRow,
} from "@/components/public/account/shipments-table";

export const metadata: Metadata = { title: "My Shipments | TYS Global Logistics" };

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

// C-portal "My Shipment" list, laid out to match the reference hub: a titled
// card with the sender/receiver city and state broken out into their own
// sortable, filterable columns, and paging underneath. Scoped to the real
// userId FK (unlike Quote, which only has a denormalized email).
export default async function ShipmentsPage({ searchParams }: { searchParams: Promise<{ booked?: string }> }) {
  const session = await requireCustomerPage();
  const { booked } = await searchParams;
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
    date: s.createdAt ? dateFmt.format(s.createdAt) : "N/A",
    sortDate: s.createdAt ? s.createdAt.getTime() : 0,
    trackingNumber: s.trackingNumber,
    senderName: s.senderContactName,
    senderCity: s.senderCity,
    senderState: s.senderState,
    receiverName: s.recipientContactName,
    receiverCity: s.recipientCity,
    receiverState: s.recipientState,
    receiverCountry: countryName(s.recipientCountry),
    shipmentType: s.shipmentType,
    status: s.status,
  }));

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-4">
      {booked === "1" && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#B7E4C7] bg-[#EDFAF2] px-5 py-3.5 text-[14.5px] text-[#14532D]">
          <CheckCircleIcon size={20} weight="fill" className="shrink-0 text-[#16A34A]" />
          <span>
            <strong>Shipment booked.</strong> We&apos;ll confirm the pickup and price with you shortly, usually within one business day.
          </span>
        </div>
      )}
      <section className="overflow-hidden rounded-2xl border border-[#E3E7ED] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#EEF0F3] px-5 py-3.5 md:px-6">
          <h2 className="text-[15px] font-semibold text-ink">All shipments</h2>
          <Link
            href="/account/schedule"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-[14px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(3,100,255,0.9)] hover:bg-brand-dark"
          >
            <PaperPlaneTiltIcon size={15} weight="fill" /> New shipment
          </Link>
        </div>
        <ShipmentsTable rows={rows} />
      </section>
    </div>
  );
}
