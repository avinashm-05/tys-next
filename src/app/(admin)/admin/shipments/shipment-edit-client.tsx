"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminApi, ApiError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { NotesSection, type NotesSectionHandle } from "./notes-section";
import type { ShipmentDetail } from "./types";

// Real backing: PATCH /api/admin/shipments/[id] (src/app/api/admin/shipments/
// [id]/route.ts). Notes post immediately on their own (see notes-section.tsx)
// — flushDraft below is only a safety net for an unposted draft. Accounts
// (payment) and the automated-carrier half of Tracking stay UI-only stubs —
// no billing backend and no live FedEx wiring here, see those files' own
// header comments.
export function ShipmentEditClient({ initial }: { initial: ShipmentDetail }) {
  const router = useRouter();
  const [shipment, setShipment] = useState(initial);
  const [tab, setTab] = useState("customer");
  const [saving, setSaving] = useState(false);
  // Status as last saved, so the "Email the recipient" option only appears
  // when this save would actually change it.
  const [savedStatus, setSavedStatus] = useState(initial.status);
  const [notifyRecipient, setNotifyRecipient] = useState(false);
  const statusChanged = shipment.status !== savedStatus;
  const recipientEmail = shipment.recipient.email?.trim() || null;
  const notesRef = useRef<NotesSectionHandle>(null);

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

  async function save(exitAfter: boolean) {
    setSaving(true);
    const payload = {
      status: shipment.status,
      notifyRecipient: statusChanged && notifyRecipient && !!recipientEmail,
      allClear: shipment.allClear,
      packageType: shipment.packageType,
      managedBy: shipment.managedBy,
      shipmentType: shipment.shipmentType,
      serviceType: shipment.serviceType,
      subServiceType: shipment.subServiceType,
      sender: shipment.sender,
      recipient: shipment.recipient,
      pickup: shipment.pickup,
      additional: shipment.additional,
      packages: shipment.packages.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        weight: p.weight,
        weightUnit: p.weightUnit,
        length: p.length,
        width: p.width,
        height: p.height,
        chargeableWeight: p.chargeableWeight,
        insuredValue: p.insuredValue,
      })),
      doNotShowOnMyShipment: shipment.doNotShowOnMyShipment,
      commercialInvoice: shipment.commercialInvoice.map((l) => ({
        id: l.id,
        packageNumber: l.packageNumber,
        packageContent: l.packageContent,
        quantity: l.quantity,
        valuePerQty: l.valuePerQty,
      })),
      documentation: shipment.documentation.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        documentName: d.documentName,
        status: d.status,
      })),
    };
    try {
      const [{ recipientEmail: emailResult, ...updated }] = await Promise.all([
        adminApi<ShipmentDetail & { recipientEmail: { sentTo: string } | { error: string } | null }>(
          `/api/admin/shipments/${shipment.id}`,
          { method: "PATCH", body: JSON.stringify(payload) },
        ),
        notesRef.current?.flushDraft(),
      ]);
      setShipment(updated);
      setSavedStatus(updated.status);
      setNotifyRecipient(false);
      if (emailResult && "sentTo" in emailResult) {
        toast.success(`Shipment saved. Status email sent to ${emailResult.sentTo}.`);
        notesRef.current?.reload();
      } else if (emailResult && "error" in emailResult) {
        toast.warning(`Shipment saved, but ${emailResult.error.charAt(0).toLowerCase()}${emailResult.error.slice(1)}`);
      } else {
        toast.success("Shipment saved.");
      }
      if (exitAfter) router.push("/admin/shipments");
      return true;
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't save the shipment.");
      return false;
    } finally {
      setSaving(false);
    }
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
            <TrackingSection shipmentId={shipment.id} />
          </DetailTabsContent>
          <DetailTabsContent value="documentation">
            <DocumentationSection shipment={shipment} onChange={patch} />
          </DetailTabsContent>
        </div>
      </DetailTabs>

      <NotesSection ref={notesRef} shipmentId={shipment.id} />

      <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center justify-end gap-2 border-t border-tys-mist bg-background/95 px-6 py-3 backdrop-blur">
        {statusChanged && (
          <label
            className={`mr-auto flex items-center gap-2 text-sm ${recipientEmail ? "" : "text-muted-foreground"}`}
            title={recipientEmail ? undefined : "Add a recipient email on Customer Details first"}
          >
            <Checkbox
              checked={notifyRecipient && !!recipientEmail}
              disabled={!recipientEmail || saving}
              onCheckedChange={(v) => setNotifyRecipient(v === true)}
            />
            {recipientEmail
              ? `Email the recipient (${recipientEmail}) about this status change`
              : "No recipient email to notify"}
          </label>
        )}
        <Button variant="outline" onClick={() => router.push("/admin/shipments")} disabled={saving}>
          Cancel
        </Button>
        <Button
          className="border border-input bg-background text-foreground shadow-none hover:bg-muted"
          onClick={() => save(false)}
          disabled={saving}
        >
          Save
        </Button>
        <Button
          className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
          onClick={() => save(true)}
          disabled={saving}
        >
          Save & Exit
        </Button>
      </div>
    </div>
  );
}
