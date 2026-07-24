import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { VendorForm } from "../vendor-form";

export const metadata: Metadata = { title: "Add vendor — TYS Global Logistics" };

export default async function NewVendorPage() {
  await requireAdminPage();
  // Laravel's create view only offers ACTIVE vendor types.
  const types = await db.vendorType.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <VendorForm typeOptions={types.map((t) => ({ id: Number(t.id), name: t.name }))} />
  );
}
