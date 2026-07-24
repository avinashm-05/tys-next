import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { decimal2 } from "@/lib/serialize";
import { formatPackageTypes } from "@/lib/package-type";
import { AccountNav, QuoteStatusPill } from "@/components/public/account/account-nav";

export const metadata: Metadata = { title: "My quotes — TYS Global Logistics" };

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
    <main className="container" style={{ paddingTop: 160, paddingBottom: 80, maxWidth: 960 }}>
      <AccountNav current="/account/quotes" />
      <h1 className="quote-wizard-section-title" style={{ marginBottom: 20 }}>
        My quotes
      </h1>

      {quotes.length === 0 ? (
        <div className="quote-wizard-location-card">
          <p className="m-0">
            No quote requests yet. <a href="/#bookShipmentForm">Get a free quote</a> to see it here.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {quotes.map((quote) => (
            <a
              key={String(quote.id)}
              href={`/account/quotes/${Number(quote.id)}`}
              className="quote-wizard-location-card d-block"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="d-flex flex-wrap align-items-center gap-3">
                <div style={{ flex: "2 1 220px" }}>
                  <div style={{ fontWeight: 700 }}>
                    {quote.fromCountry} ({quote.fromZip}) → {quote.toCountry} ({quote.toZip})
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {formatPackageTypes(quote.packageType)} · Quote #{Number(quote.id)}
                    {quote.createdAt ? ` · ${dateFmt.format(quote.createdAt)}` : ""}
                  </div>
                </div>
                <div style={{ flex: "1 1 120px", textAlign: "right" }}>
                  {quote.estimatedCost != null ? (
                    <span style={{ fontWeight: 700 }}>
                      {decimal2(quote.estimatedCost)} {quote.currency ?? "USD"}
                    </span>
                  ) : (
                    <span className="text-muted">Awaiting price</span>
                  )}
                </div>
                <div style={{ flex: "0 0 auto" }}>
                  <QuoteStatusPill status={quote.status} />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
