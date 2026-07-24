import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { VendorTypeForm } from "../vendor-type-form";

export const metadata: Metadata = { title: "Add vendor type — TYS Global Logistics" };

export default async function NewVendorTypePage() {
  await requireAdminPage();
  return <VendorTypeForm />;
}
