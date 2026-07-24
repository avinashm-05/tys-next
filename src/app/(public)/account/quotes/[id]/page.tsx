import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { decimal2 } from "@/lib/serialize";
import { formatPackageTypes } from "@/lib/package-type";
import { AccountNav, QuoteStatusPill } from "@/components/public/account/account-nav";

export const metadata: Metadata = { title: "Quote details — TYS Global Logistics" };

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const row = (label: string, value: React.ReactNode) => (
  <div className="d-flex" style={{ gap: 8, marginBottom: 6 }}>
    <span className="text-muted" style={{ minWidth: 150 }}>
      {label}
    </span>
    <span style={{ fontWeight: 500 }}>{value}</span>
  </div>
);

// Read-only quote detail. IDOR protection (critical): the query itself
// requires quote.email === the verified session email — a guessed id that
// belongs to someone else can never match and 404s. No mutations here.
export default async function MyQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCustomerPage();
  const id = parseId((await params).id);

  const quote =
    id !== null
      ? await db.quote.findFirst({
          where: { id, email: session.user.email }, // ownership in the WHERE — not after
          include: { packages: true },
        })
      : null;
  if (!quote) notFound();

  const boxes = quote.packages.filter((p) => p.packageType === "box" || p.packageType === "boxes");
  const tvs = quote.packages.filter((p) => p.packageType === "television");
  const autos = quote.packages.filter((p) => p.packageType === "auto");
  const unit = (quote.packages[0]?.weightUnit ?? "lb").toUpperCase();

  const section: React.CSSProperties = { marginBottom: 20 };

  return (
    <main className="container" style={{ paddingTop: 160, paddingBottom: 80, maxWidth: 960 }}>
      <AccountNav current="/account/quotes" />
      <div className="d-flex flex-wrap align-items-center gap-3" style={{ marginBottom: 20 }}>
        <h1 className="quote-wizard-section-title m-0">Quote #{Number(quote.id)}</h1>
        <QuoteStatusPill status={quote.status} />
        <a href="/account/quotes" className="ms-auto">
          ← All quotes
        </a>
      </div>

      <div className="quote-wizard-location-card" style={section}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 12 }}>Shipment</h2>
        {row("Route", `${quote.fromCountry} (${quote.fromZip}) → ${quote.toCountry} (${quote.toZip})`)}
        {row("Delivery type", quote.isResidence ? "Residential" : "Commercial")}
        {row("Packages", formatPackageTypes(quote.packageType))}
        {quote.totalChargeableWeight != null &&
          row("Total chargeable weight", `${decimal2(quote.totalChargeableWeight)} ${unit}`)}
        {row(
          "Estimated cost",
          quote.estimatedCost != null ? (
            <strong>
              {decimal2(quote.estimatedCost)} {quote.currency ?? "USD"}
            </strong>
          ) : (
            "Awaiting price — our team will contact you"
          ),
        )}
        {quote.createdAt && row("Submitted", dateFmt.format(quote.createdAt) + " UTC")}
      </div>

      {boxes.length > 0 && (
        <div className="quote-wizard-location-card" style={section}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 12 }}>
            <i className="fa-solid fa-box me-2" style={{ color: "#f26a21" }}></i>Boxes
          </h2>
          {boxes.map((p, i) => (
            <div key={String(p.id)} style={{ marginBottom: 8 }}>
              <strong>Box #{i + 1}</strong> — qty {p.quantity}, {decimal2(p.weight) ?? "N/A"}{" "}
              {(p.weightUnit ?? "lb").toUpperCase()}, {decimal2(p.length) ?? "–"} ×{" "}
              {decimal2(p.width) ?? "–"} × {decimal2(p.height) ?? "–"}
              {p.chargeableWeight != null && (
                <span className="text-muted"> · chargeable {decimal2(p.chargeableWeight)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tvs.length > 0 && (
        <div className="quote-wizard-location-card" style={section}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 12 }}>
            <i className="fa-solid fa-tv me-2" style={{ color: "#f26a21" }}></i>Televisions
          </h2>
          {tvs.map((p, i) => (
            <div key={String(p.id)} style={{ marginBottom: 8 }}>
              <strong>Television #{i + 1}</strong> — {p.brandName ?? "N/A"} {p.tvModel ?? ""},{" "}
              {decimal2(p.weight) ?? "N/A"} {(p.weightUnit ?? "lb").toUpperCase()},{" "}
              {decimal2(p.length) ?? "–"} × {decimal2(p.width) ?? "–"} × {decimal2(p.height) ?? "–"}
            </div>
          ))}
        </div>
      )}

      {autos.length > 0 && (
        <div className="quote-wizard-location-card" style={section}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 12 }}>
            <i className="fa-solid fa-car me-2" style={{ color: "#f26a21" }}></i>Vehicles
          </h2>
          {autos.map((p, i) => (
            <div key={String(p.id)} style={{ marginBottom: 8 }}>
              <strong>Vehicle #{i + 1}</strong> — {p.brandName ?? "N/A"} {p.carModel ?? ""}
              {p.carYear ? ` (${p.carYear})` : ""}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
