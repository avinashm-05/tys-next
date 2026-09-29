import type { Metadata } from "next";
import { CrosshairIcon } from "@phosphor-icons/react/dist/ssr";
import { requireCustomerPage } from "@/lib/auth";

export const metadata: Metadata = { title: "Tracking | TYS Global Logistics" };

// Empty-state stub — populated by the fulfillment track (C3–C5). No fake rows.
export default async function TrackingPage() {
  await requireCustomerPage();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Tracking</h1>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-light bg-white px-6 py-14 text-center">
        <CrosshairIcon size={40} className="text-brand-light" />
        <p className="m-0 text-sm text-ink-muted">Nothing to track yet.</p>
      </div>
    </div>
  );
}
