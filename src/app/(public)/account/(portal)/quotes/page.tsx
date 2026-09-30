import type { Metadata } from "next";
import Link from "next/link";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { decimal2 } from "@/lib/serialize";
import { formatPackageTypes } from "@/lib/package-type";
import { QuoteStatusPill } from "@/components/public/account/account-nav";

export const metadata: Metadata = { title: "My quotes | TYS Global Logistics" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

// Read-only list of the customer's quote requests, scoped to the verified
// session email (the denormalized quotes.email — the only customer↔quote link).
// ponytail: latest 50, no pagination — add it when a customer actually has more.
export default async function MyQuotesPage() {
  const session = await requireCustomerPage();
  const email = session.user.email;

  const quotes = await db.quote.findMany({
    where: { email },
    orderBy: { id: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">My quotes</h1>

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-brand-light bg-white p-6">
          <p className="m-0 text-sm text-ink-muted">
            No quote requests yet.{" "}
            <Link href="/quotes" className="font-medium text-brand hover:underline">
              Get a free quote
            </Link>{" "}
            to see it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((quote) => (
            <Link
              key={String(quote.id)}
              href={`/account/quotes/${Number(quote.id)}`}
              className="block rounded-2xl border border-brand-light bg-white p-5 no-underline transition hover:border-brand"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[220px] flex-[2]">
                  <div className="font-semibold text-ink">
                    {quote.fromCountry} ({quote.fromZip}) → {quote.toCountry} ({quote.toZip})
                  </div>
                  <div className="text-sm text-ink-muted">
                    {formatPackageTypes(quote.packageType)} · Quote #{Number(quote.id)}
                    {quote.createdAt ? ` · ${dateFmt.format(quote.createdAt)}` : ""}
                  </div>
                </div>
                <div className="min-w-[120px] flex-1 text-right">
                  {quote.estimatedCost != null ? (
                    <span className="font-semibold text-ink">
                      {decimal2(quote.estimatedCost)} {quote.currency ?? "USD"}
                    </span>
                  ) : (
                    <span className="text-sm text-ink-muted">Awaiting price</span>
                  )}
                </div>
                <div>
                  <QuoteStatusPill status={quote.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
