import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { ServiceForm } from "../service-form";

export const metadata: Metadata = { title: "Add service — TYS Global Logistics" };

export default async function NewServicePage() {
  await requireAdminPage();
  return <ServiceForm />;
}
