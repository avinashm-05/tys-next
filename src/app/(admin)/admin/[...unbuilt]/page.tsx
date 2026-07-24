import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Coming soon — TYS Global Logistics" };

// The ONE shared placeholder for every admin section that isn't built yet
// (Quotes, Services, Vendors, Settings, …). Real pages added in later phases
// take precedence over this catch-all, so the sidebar stays fully navigable.
// Guarded by the admin layout's requireAdminPage().
export default function UnbuiltSectionPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-h2">Coming in a later phase</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This part of the admin isn&apos;t built yet — it arrives in an upcoming phase of the
        rebuild.
      </p>
      <Button asChild variant="outline">
        <Link href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
