import { notFound, redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { parseId } from "@/lib/list-query";

// One page per record, its editor: this address (breadcrumbs, shared links)
// opens it instead of the old "Coming in a later phase" placeholder.
export default async function RecordPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = parseId((await params).id);
  if (id === null) notFound();
  redirect(`/admin/blog/${id}/edit`);
}
