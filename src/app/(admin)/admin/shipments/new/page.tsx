import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { blankShipment, blankShipmentFromQuote } from "../mock-data";
import { ShipmentEditClient } from "../shipment-edit-client";

export const metadata: Metadata = { title: "New Shipment — TYS Global Logistics" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewShipmentPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const quoteId = one(sp.quoteId);

  const initial = quoteId
    ? blankShipmentFromQuote({
        id: Number(quoteId),
        fromCountry: one(sp.fromCountry) ?? "",
        fromZip: one(sp.fromZip) ?? "",
        toCountry: one(sp.toCountry) ?? "",
        toZip: one(sp.toZip) ?? "",
        contactName: one(sp.contactName) ?? null,
        contactEmail: one(sp.contactEmail) ?? null,
        contactPhone: one(sp.contactPhone) ?? null,
      })
    : blankShipment();

  return <ShipmentEditClient initial={initial} />;
}
