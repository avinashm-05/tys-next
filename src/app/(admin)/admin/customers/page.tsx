import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { CustomersList } from "./customers-list";

export const metadata: Metadata = { title: "Customers — TYS Global Logistics" };

export default async function CustomersPage() {
  await requireAdminPage();
  return <CustomersList />;
}
