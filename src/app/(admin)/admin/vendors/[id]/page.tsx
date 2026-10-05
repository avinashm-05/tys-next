import { notFound, redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { parseId } from "@/lib/list-query";

// A vendor has one page, its editor. This address (the breadcrumb's "#256",
// shared links) used to fall through to the "Coming in a later phase"
// placeholder; it now opens the vendor (2026-10-06).
export default async function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = parseId((await params).id);
  if (id === null) notFound();
  redirect(`/admin/vendors/${id}/edit`);
}
