import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { VendorTypeForm } from "../../vendor-type-form";

export const metadata: Metadata = { title: "Edit vendor type — TYS Global Logistics" };

export default async function EditVendorTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const id = parseId((await params).id);
  const row = id !== null ? await db.vendorType.findUnique({ where: { id } }) : null;
  if (!row) notFound();
  return (
    <VendorTypeForm
      vendorType={{
        id: Number(row.id),
        name: row.name,
        description: row.description,
        status: row.status,
      }}
    />
  );
}
