import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Creates a real, blank Shipment row and redirects straight into its real
// edit page — same idea as POST /api/admin/quotes/[id]/convert-to-shipment,
// just for the "Add Shipment" button (no source quote) instead of a quote
// conversion. Previously rendered an in-memory blankShipment() that never
// persisted (see mock-data.ts) — every required string column just starts
// empty here, same as that mock did, until the admin fills the tabs in.
export default async function NewShipmentPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const quoteId = one(sp.quoteId);

  const now = new Date();
  let data: Prisma.ShipmentUncheckedCreateInput = {
    shipmentType: "air",
    fromCountry: "",
    toCountry: "",
    status: "new_request",
    senderContactName: "",
    senderAddressLine1: "",
    senderCity: "",
    senderState: "",
    senderCountry: "",
    senderPostalCode: "",
    senderPhone1: "",
    recipientContactName: "",
    recipientAddressLine1: "",
    recipientCity: "",
    recipientState: "",
    recipientCountry: "",
    recipientPostalCode: "",
    recipientPhone1: "",
    createdAt: now,
    updatedAt: now,
  };

  if (quoteId) {
    const quote = await db.quote.findUnique({ where: { id: BigInt(quoteId) } });
    if (quote) {
      data = {
        ...data,
        linkedQuoteId: quote.id,
        fromCountry: quote.fromCountry,
        toCountry: quote.toCountry,
        senderContactName: quote.name ?? "",
        senderCountry: quote.fromCountry,
        senderPostalCode: quote.fromZip,
        senderPhone1: quote.mobileNumber ?? "",
        senderEmail: quote.email,
        recipientCountry: quote.toCountry,
        recipientPostalCode: quote.toZip,
      };
    }
  }

  const shipment = await db.shipment.create({ data });
  redirect(`/admin/shipments/${Number(shipment.id)}/edit`);
}
