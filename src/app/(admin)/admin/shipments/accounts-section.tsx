"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ShipmentDetail } from "./mock-data";

// UI-first stub: SETU's "Payment Issued" panel opens a full payment-capture
// flow — no billing/payment backend exists yet, so this renders the same
// panel the feature will use once that's wired, with a status line instead.
export function AccountsSection({ shipment }: { shipment: ShipmentDetail }) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between rounded-xl border border-tys-mist p-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Payment Issued</h2>
          <p className="text-sm text-muted-foreground">
            {shipment.paymentIssued ? "Payment has been recorded for this shipment." : "No payment recorded yet."}
          </p>
        </div>
        <Button
          className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
          onClick={() => toast.info("Payment capture isn't wired up yet — no billing backend configured.")}
        >
          Open
        </Button>
      </div>
    </div>
  );
}
