import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";

// "Started quotes" moved into Quotes as the Incomplete tab (2026-10-05).
// Kept as a redirect so old bookmarks and links still land in the right place.
export default async function LeadsPage() {
  await requireAdminPage();
  redirect("/admin/quotes?view=incomplete");
}
