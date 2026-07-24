import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { VendorsList } from "./vendors-list";

export const metadata: Metadata = { title: "Vendors — TYS Global Logistics" };

export default async function VendorsPage() {
  await requireAdminPage();
  return <VendorsList />;
}
