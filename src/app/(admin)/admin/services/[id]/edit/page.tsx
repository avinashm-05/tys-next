import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { ServiceForm } from "../../service-form";

export const metadata: Metadata = { title: "Edit service — TYS Global Logistics" };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const id = parseId((await params).id);
  const row = id !== null ? await db.service.findUnique({ where: { id } }) : null;
  if (!row) notFound();
  return (
    <ServiceForm
      service={{
        id: Number(row.id),
        name: row.name,
        systemName: row.systemName,
        status: row.status,
      }}
    />
  );
}
