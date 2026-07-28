import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { ShipmentsList } from "./shipments-list";

export const metadata: Metadata = { title: "Shipments — TYS Global Logistics" };

export default async function ShipmentsPage() {
  await requireAdminPage();
  return <ShipmentsList />;
}
