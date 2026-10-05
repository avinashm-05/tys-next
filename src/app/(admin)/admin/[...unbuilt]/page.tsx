import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Not found — TYS Global Logistics" };

// Every admin section is built now (2026-10-06), so any other /admin/...
// address is simply a wrong link. Guarded by the admin layout's
// requireAdminPage(), so only signed-in staff ever see this.
export default function AdminNotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-h2">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        That link doesn&apos;t match anything in the admin. It may be old or mistyped.
      </p>
      <Button asChild variant="outline">
        <Link href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
