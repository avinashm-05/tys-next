import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { QuotesHeader, QuotesList } from "./quotes-list";
import { IncompleteQuotes } from "./incomplete-quotes";

export const metadata: Metadata = { title: "Quotes — TYS Global Logistics" };
export const dynamic = "force-dynamic";

// Quotes + Incomplete as two tabs of one page (2026-10-05: the separate
// "Started quotes" page and menu item were merged in here).
export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ view?: string; show?: string }> }) {
  await requireAdminPage();
  const { view, show } = await searchParams;
  const incomplete = view === "incomplete";
  const incompleteCount = await db.quoteLead.count({ where: { convertedAt: null } });

  const tabs = (
    <div className="flex gap-1 border-b">
      {([
        ["All quotes", "/admin/quotes", !incomplete, null],
        ["Incomplete", "/admin/quotes?view=incomplete", incomplete, incompleteCount],
      ] as const).map(([label, href, active, count]) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition",
            active ? "border-tys-blue text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
          {count ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">{count}</span>
          ) : null}
        </Link>
      ))}
    </div>
  );

  if (!incomplete) return <QuotesList tabs={tabs} />;
  return (
    <div className="flex flex-col gap-4">
      <QuotesHeader />
      {tabs}
      <IncompleteQuotes all={show === "all"} />
    </div>
  );
}
