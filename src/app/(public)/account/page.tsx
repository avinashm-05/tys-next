import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountNav } from "@/components/public/account/account-nav";

export const metadata: Metadata = { title: "My account — TYS Global Logistics" };

// C1.2 dashboard. Every count is scoped to the session's VERIFIED email —
// quotes are anonymous rows; the denormalized contact email is the only link.
export default async function AccountDashboardPage() {
  const session = await requireCustomerPage();
  const email = session.user.email;

  const [total, byStatus] = await Promise.all([
    db.quote.count({ where: { email } }),
    db.quote.groupBy({ by: ["status"], where: { email }, _count: { _all: true } }),
  ]);
  const count = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;

  const card: React.CSSProperties = {
    border: "1px solid #e9ecef",
    borderRadius: 20,
    background: "white",
    padding: "20px 24px",
    flex: "1 1 180px",
  };

  return (
    <main className="container" style={{ paddingTop: 160, paddingBottom: 80, maxWidth: 960 }}>
      <AccountNav current="/account" />
      <h1 className="quote-wizard-section-title" style={{ marginBottom: 4 }}>
        Welcome, {session.user.name}
      </h1>
      <p className="text-muted" style={{ marginBottom: 24 }}>
        {email}
      </p>

      <div className="d-flex flex-wrap gap-3" style={{ marginBottom: 24 }}>
        <div style={card}>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Quote requests
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{total}</div>
          <a href="/account/quotes">View my quotes →</a>
        </div>
        <div style={card}>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Awaiting a price
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{count("pending")}</div>
        </div>
        <div style={card}>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Quoted
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{count("quoted")}</div>
        </div>
        <div style={card}>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            Accepted
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{count("accepted")}</div>
        </div>
      </div>

      {/* Fulfillment stubs — light up in C3–C5; no fake rows, ever. */}
      <div className="d-flex flex-wrap gap-3">
        <div style={{ ...card, flex: "1 1 300px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            <i className="fa-solid fa-truck-fast me-2" style={{ color: "#f26a21" }}></i>Shipments
          </h2>
          <p className="text-muted m-0">No shipments yet.</p>
        </div>
        <div style={{ ...card, flex: "1 1 300px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            <i className="fa-solid fa-location-crosshairs me-2" style={{ color: "#f26a21" }}></i>
            Tracking
          </h2>
          <p className="text-muted m-0">Nothing to track yet.</p>
        </div>
      </div>
    </main>
  );
}
