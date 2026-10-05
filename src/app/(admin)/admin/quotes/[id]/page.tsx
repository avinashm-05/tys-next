import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, EnvelopeSimpleOpenIcon } from "@phosphor-icons/react/dist/ssr";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/admin/quote-status-badge";
import { QuoteStatusControl } from "@/components/admin/quote-status-control";
import { QuoteFollowUpButton } from "@/components/admin/quote-follow-up-button";
import { QuoteComposer } from "@/components/admin/quote-composer";
import { SALES_REP_NAME } from "@/lib/mail";
import { QUOTE_DETAIL_INCLUDE, serializeQuoteDetail } from "@/app/api/admin/quotes/helpers";
import { QuoteDetailEditor } from "./quote-detail-editor";
import { quoteRef } from "@/lib/quote-ref";

export const metadata: Metadata = { title: "Quote — TYS Global Logistics" };

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = parseId((await params).id);
  const row =
    id !== null
      ? await db.quote.findUnique({ where: { id }, include: QUOTE_DETAIL_INCLUDE })
      : null;
  if (!row) notFound();
  const q = serializeQuoteDetail(row);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0" aria-label="Back to quotes">
            <Link href="/admin/quotes">
              <ArrowLeftIcon size={18} />
            </Link>
          </Button>
          <div>
            <h1 className="text-h2">Quote #{quoteRef(q.id)}</h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              Created <LocalDateTime iso={q.createdAt} /> <QuoteStatusBadge status={q.status} />
              {q.emailStatistic && (
                <span className="inline-flex items-center gap-1">
                  <EnvelopeSimpleOpenIcon size={14} />
                  Opened {q.emailStatistic.openCount}×
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {q.status === "quoted" && <QuoteFollowUpButton quoteId={q.id} sendTo={q.contact.email} />}
          <QuoteComposer quote={q} repName={SALES_REP_NAME} />
          <QuoteStatusControl quoteId={q.id} status={q.status} className="w-40" />
        </div>
      </div>

      <QuoteDetailEditor quote={q} />
    </div>
  );
}
