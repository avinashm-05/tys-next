import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { TrackingTool } from "@/components/admin/tracking-tool";

export const metadata: Metadata = { title: "Tracking — TYS Global Logistics" };

// Standalone FedEx tracking lookup — pure read, nothing persisted. Works
// against any real FedEx tracking number today, independent of the
// still-mock "Book Shipment" flow.
export default async function TrackingPage() {
  await requireAdminPage();
  return <TrackingTool />;
}
