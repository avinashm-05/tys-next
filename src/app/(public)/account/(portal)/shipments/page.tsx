import type { Metadata } from "next";
import Link from "next/link";
import { TruckIcon } from "@phosphor-icons/react/dist/ssr";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { ShipmentStatusPill } from "@/components/public/account/account-nav";

export const metadata: Metadata = { title: "Shipments — TYS Global Logistics" };

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

const SHIPMENT_TYPE_LABELS: Record<string, string> = { air: "Air", ground: "Ground", ocean: "Ocean" };

// C-portal "My Shipment" list — SFL-style table (Date, Tracking, Sender,
// Receiver, Type, Status), scoped to the real userId FK (unlike Quote, which
// only has a denormalized email). No fake rows — a fresh account genuinely
// has none until the Schedule Shipment wizard creates one.
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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Shipments</h1>
        <Link
          href="/book-shipment"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Schedule Shipment
        </Link>
      </div>

      {shipments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-light bg-white px-6 py-14 text-center">
          <TruckIcon size={40} className="text-brand-light" />
          <p className="m-0 text-sm text-ink-muted">No shipments yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-light bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-brand-pale text-xs font-semibold text-ink-muted uppercase">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Receiver</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={String(s.id)} className="border-t border-brand-light">
                  <td className="px-4 py-3 text-ink-muted">
                    {s.createdAt ? dateFmt.format(s.createdAt) : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{s.trackingNumber ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{s.senderContactName}</div>
                    <div className="text-xs text-ink-muted">
                      {s.senderCity}, {s.senderState}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{s.recipientContactName}</div>
                    <div className="text-xs text-ink-muted">
                      {s.recipientCity}, {s.recipientState}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {SHIPMENT_TYPE_LABELS[s.shipmentType] ?? s.shipmentType}
                  </td>
                  <td className="px-4 py-3">
                    <ShipmentStatusPill status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
