import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { ServicesList } from "./services-list";

export const metadata: Metadata = { title: "Services — TYS Global Logistics" };

export default async function ServicesPage() {
  await requireAdminPage();
  return <ServicesList />;
}
