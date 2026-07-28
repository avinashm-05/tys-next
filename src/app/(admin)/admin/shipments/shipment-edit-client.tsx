"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DetailTabs,
  DetailTabsContent,
  DetailTabsList,
  DetailTabsTrigger,
} from "@/components/admin/detail-tabs";
import { ShipmentHeaderInfo } from "./shipment-header-info";
import { CustomerDetailsSection } from "./customer-details-section";
import { PackageSection } from "./package-section";
import { CommercialInvoiceSection } from "./commercial-invoice-section";
import { AccountsSection } from "./accounts-section";
import { TrackingSection } from "./tracking-section";
import { DocumentationSection } from "./documentation-section";
import { NotesSection } from "./notes-section";
import type { ShipmentDetail } from "./mock-data";

// Every tab + Notes writes into one shipment object, patched via onChange —
// there's no Shipment API yet (UI-lock phase, see the plan), so Save/Save &
// Exit only confirm the shape is right; nothing persists until that backend
// phase wires this to real endpoints.
export function ShipmentEditClient({ initial }: { initial: ShipmentDetail }) {
  const router = useRouter();
  const [shipment, setShipment] = useState(initial);
  const [tab, setTab] = useState("customer");

  const pendingScrollY = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingScrollY.current !== null) {
      window.scrollTo(0, pendingScrollY.current);
      pendingScrollY.current = null;
    }
  }, [tab]);

  function patch(p: Partial<ShipmentDetail>) {
    setShipment((prev) => ({ ...prev, ...p }));
  }

  function save(andExit: boolean) {
    toast.success(
      andExit
        ? "Shipment saved locally — database wiring comes in a later phase."
        : "Shipment saved locally.",
    );
    if (andExit) router.push("/admin/shipments");
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ShipmentHeaderInfo shipment={shipment} onChange={patch} />

      <DetailTabs
        value={tab}
        onValueChange={(value) => {
          pendingScrollY.current = window.scrollY;
          setTab(value);
        }}
      >
        <DetailTabsList className="grid-cols-3 sm:grid-cols-6">
          <DetailTabsTrigger value="customer">Customer Details</DetailTabsTrigger>
          <DetailTabsTrigger value="package">Package</DetailTabsTrigger>
          <DetailTabsTrigger value="invoice">Commercial Inv.</DetailTabsTrigger>
          <DetailTabsTrigger value="accounts">Accounts</DetailTabsTrigger>
          <DetailTabsTrigger value="tracking">Tracking</DetailTabsTrigger>
          <DetailTabsTrigger value="documentation">Documentation</DetailTabsTrigger>
        </DetailTabsList>
        <div className="rounded-b-2xl border border-t-0 border-tys-mist bg-card">
          <DetailTabsContent value="customer">
            <CustomerDetailsSection shipment={shipment} onChange={patch} />
          </DetailTabsContent>
          <DetailTabsContent value="package">
            <PackageSection shipment={shipment} onChange={patch} />
          </DetailTabsContent>
          <DetailTabsContent value="invoice">
            <CommercialInvoiceSection shipment={shipment} onChange={patch} />
          </DetailTabsContent>
          <DetailTabsContent value="accounts">
            <AccountsSection shipment={shipment} />
          </DetailTabsContent>
          <DetailTabsContent value="tracking">
            <TrackingSection shipment={shipment} />
          </DetailTabsContent>
          <DetailTabsContent value="documentation">
            <DocumentationSection shipment={shipment} onChange={patch} />
          </DetailTabsContent>
        </div>
      </DetailTabs>

      <NotesSection shipment={shipment} onChange={patch} />

      <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-tys-mist bg-background/95 px-6 py-3 backdrop-blur">
        <Button variant="outline" onClick={() => router.push("/admin/shipments")}>
          Cancel
        </Button>
        <Button
          className="bg-tys-rose text-white hover:bg-tys-rose/90"
          onClick={() => save(false)}
        >
          Save
        </Button>
        <Button
          className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
          onClick={() => save(true)}
        >
          Save & Exit
        </Button>
      </div>
    </div>
  );
}
