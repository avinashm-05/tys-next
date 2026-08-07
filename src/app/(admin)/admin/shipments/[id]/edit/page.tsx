import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { SHIPMENT_DETAIL_INCLUDE, serializeShipmentDetail } from "@/app/api/admin/shipments/helpers";
import { ShipmentEditClient } from "../../shipment-edit-client";

export const metadata: Metadata = { title: "Shipment — TYS Global Logistics" };

export default async function ShipmentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id: idParam } = await params;
  const id = parseId(idParam);
  const row =
    id !== null ? await db.shipment.findUnique({ where: { id }, include: SHIPMENT_DETAIL_INCLUDE }) : null;
  if (!row) notFound();
  return <ShipmentEditClient initial={serializeShipmentDetail(row)} />;
}
