"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ShipmentDetail } from "./mock-data";

// UI-first stub, same rationale as AccountsSection: carrier tracking (FedEx
// webhook/poll) and manual tracking-event entry both need backend work this
// phase doesn't include yet.
export function TrackingSection({ shipment }: { shipment: ShipmentDetail }) {
  const openStub = (what: string) =>
    toast.info(`${what} isn't wired up yet — no tracking backend configured.`);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between rounded-xl border border-tys-mist p-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Tracking</h2>
          <p className="text-sm text-muted-foreground">
            {shipment.hasTracking
              ? "Automated carrier tracking is available for this shipment."
              : "No automated tracking events yet."}
          </p>
        </div>
        <Button
          className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
          onClick={() => openStub("Tracking")}
        >
          Open
        </Button>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-tys-mist p-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Manual Tracking</h2>
          <p className="text-sm text-muted-foreground">
            {shipment.hasManualTracking
              ? "Manual tracking events have been logged."
              : "No manual tracking events yet."}
          </p>
        </div>
        <Button
          className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
          onClick={() => openStub("Manual tracking")}
        >
          Open
        </Button>
      </div>
    </div>
  );
}
