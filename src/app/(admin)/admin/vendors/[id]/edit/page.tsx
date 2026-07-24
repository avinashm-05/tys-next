import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { VendorForm, type VendorTypeOption } from "../../vendor-form";
import { ContactsSection } from "../../contacts-section";
import { CommentsSection } from "../../comments-section";
import { ServicesSection } from "../../services-section";

export const metadata: Metadata = { title: "Edit vendor — TYS Global Logistics" };

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const id = parseId((await params).id);
  const row =
    id !== null
      ? await db.vendor.findUnique({ where: { id }, include: { vendorType: true } })
      : null;
  if (!row) notFound();

  const types = await db.vendorType.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const typeOptions: VendorTypeOption[] = types.map((t) => ({
    id: Number(t.id),
    name: t.name,
  }));
  // The vendor's current type may have gone inactive — keep it selectable.
  if (!typeOptions.some((t) => t.id === Number(row.vendorTypeId))) {
    typeOptions.unshift({
      id: Number(row.vendorTypeId),
      name: row.vendorType.name,
      inactive: true,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <VendorForm
        typeOptions={typeOptions}
        vendor={{
          id: Number(row.id),
          name: row.name,
          vendorTypeId: Number(row.vendorTypeId),
          email: row.email,
          phoneNumber: row.phoneNumber,
          countryCode: row.countryCode,
          website: row.website,
          einNumber: row.einNumber,
          hasSsn: row.ssnNumber != null, // plaintext SSN never reaches the form (R-PII)
          addressLine1: row.addressLine1,
          addressLine2: row.addressLine2,
          addressLine3: row.addressLine3,
          city: row.city,
          state: row.state,
          country: row.country,
          postalCode: row.postalCode,
          status: row.status,
        }}
      />
      <ContactsSection vendorId={Number(row.id)} />
      <CommentsSection vendorId={Number(row.id)} />
      <ServicesSection vendorId={Number(row.id)} />
    </div>
  );
}
