import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { getMockShipment } from "../../mock-data";
import { ShipmentEditClient } from "../../shipment-edit-client";

export const metadata: Metadata = { title: "Shipment — TYS Global Logistics" };

export default async function ShipmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const shipment = getMockShipment(Number(id));
  if (!shipment) notFound();
  return <ShipmentEditClient initial={shipment} />;
}
