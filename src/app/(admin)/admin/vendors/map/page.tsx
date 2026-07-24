import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { MapClient } from "./map-client";

export const metadata: Metadata = { title: "Vendor map — TYS Global Logistics" };

export default async function VendorMapPage() {
  await requireAdminPage();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h2">Vendor map</h1>
      <MapClient />
    </div>
  );
}
