import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/auth";
import { AccountNav } from "@/components/public/account/account-nav";

export const metadata: Metadata = { title: "Shipments — TYS Global Logistics" };

// Empty-state stub — populated by the fulfillment track (C3–C5). No fake rows.
export default async function ShipmentsPage() {
  await requireCustomerPage();
  return (
    <main className="container" style={{ paddingTop: 160, paddingBottom: 80, maxWidth: 960 }}>
      <AccountNav current="/account/shipments" />
      <h1 className="quote-wizard-section-title" style={{ marginBottom: 20 }}>
        Shipments
      </h1>
      <div className="quote-wizard-location-card text-center" style={{ padding: "48px 24px" }}>
        <i className="fa-solid fa-truck-fast" style={{ fontSize: "2.5rem", color: "#dee2e6" }}></i>
        <p className="m-0 mt-3 text-muted">No shipments yet.</p>
      </div>
    </main>
  );
}
