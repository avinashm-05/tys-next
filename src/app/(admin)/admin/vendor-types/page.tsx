import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { VendorTypesList } from "./vendor-types-list";

export const metadata: Metadata = { title: "Vendor types — TYS Global Logistics" };

export default async function VendorTypesPage() {
  await requireAdminPage();
  return <VendorTypesList />;
}
