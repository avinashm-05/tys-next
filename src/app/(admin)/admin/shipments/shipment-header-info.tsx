"use client";

import { AirplaneTiltIcon, BoatIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldRow } from "./field-row";
import { SHIPMENT_STATUS_LABELS, type ShipmentDetail, type ShipmentStatus, type ShipmentType } from "./mock-data";

const SERVICE_TYPES = ["Standard", "Express", "Economy"];
const SUB_SERVICE_TYPES = ["Door to Door", "Door to Port", "Port to Port"];

export function ShipmentHeaderInfo({
  shipment,
  onChange,
}: {
  shipment: ShipmentDetail;
  onChange: (patch: Partial<ShipmentDetail>) => void;
}) {
  const Icon = shipment.shipmentType === "air" ? AirplaneTiltIcon : BoatIcon;

  return (
    <div className="rounded-2xl border border-tys-mist bg-card p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-tys-blue text-white shadow-md">
          <Icon size={28} weight="bold" />
        </div>
        <h1 className="text-h2">
          Shipment Information
          {shipment.trackingNumber !== "NEW" && (
            <span className="text-muted-foreground"> : {shipment.trackingNumber}</span>
          )}
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FieldRow label="Shipment Status">
          <Select
            value={shipment.status}
            onValueChange={(v) => onChange({ status: v as ShipmentStatus })}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="All Clear">
          <Select
            value={shipment.allClear}
            onValueChange={(v) => onChange({ allClear: v as ShipmentDetail["allClear"] })}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="not_ready">Not Ready</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Package Type">
          <Select
            value={shipment.packageType}
            onValueChange={(v) => onChange({ packageType: v as ShipmentDetail["packageType"] })}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="package">Package</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="pallet">Pallet</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Username" htmlFor="shipment-username">
          <Input
            id="shipment-username"
            value={shipment.username}
            onChange={(e) => onChange({ username: e.target.value })}
            disabled
          />
        </FieldRow>
        <FieldRow label="Managed By" htmlFor="shipment-managed-by">
          <Input
            id="shipment-managed-by"
            value={shipment.managedBy}
            onChange={(e) => onChange({ managedBy: e.target.value })}
            placeholder="Assign a staff member…"
          />
        </FieldRow>
        <FieldRow label="Shipment Type">
          <Select
            value={shipment.shipmentType}
            onValueChange={(v) => onChange({ shipmentType: v as ShipmentType })}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="air">Air</SelectItem>
              <SelectItem value="ocean">Ocean</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Service Type">
          <Select value={shipment.serviceType} onValueChange={(v) => onChange({ serviceType: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Sub Service Type">
          <Select value={shipment.subServiceType} onValueChange={(v) => onChange({ subServiceType: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              {SUB_SERVICE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </div>
    </div>
  );
}
