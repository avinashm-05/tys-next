import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { requireAdminPage } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { QuoteDetailEditor } from "../[id]/quote-detail-editor";

export const metadata: Metadata = { title: "New Quote — TYS Global Logistics" };

// Same page a real quote submission lands on (QuoteDetailEditor, no `quote`
// prop = blank) — a phone-in lead gets the identical Customer Details/From/
// To/Package layout, just empty. Saving here creates the row for real and
// hands off to /admin/quotes/[id], the normal "New Request" detail page.
export default async function NewQuotePage() {
  await requireAdminPage();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0" aria-label="Back to quotes">
          <Link href="/admin/quotes">
            <ArrowLeftIcon size={18} />
          </Link>
        </Button>
        <h1 className="text-h2">New Quote</h1>
      </div>

      <QuoteDetailEditor />
    </div>
  );
}
