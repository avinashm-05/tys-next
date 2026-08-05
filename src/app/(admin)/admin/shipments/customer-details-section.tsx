"use client";

import {
  BuildingsIcon,
  EnvelopeIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldRow, IconInput } from "@/components/admin/field-row";
import type { Address, ShipmentDetail } from "./mock-data";

function AddressFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: Address;
  onChange: (patch: Partial<Address>) => void;
}) {
  const field = (key: keyof Address) => ({
    id: `${idPrefix}-${key}`,
    value: value[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value }),
  });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FieldRow label="Contact Name" htmlFor={`${idPrefix}-contactName`}>
        <IconInput icon={UserIcon} {...field("contactName")} />
      </FieldRow>
      <FieldRow label="Address Line 1" htmlFor={`${idPrefix}-addressLine1`}>
        <IconInput icon={MapPinIcon} {...field("addressLine1")} />
      </FieldRow>
      <FieldRow label="Address Line 2" htmlFor={`${idPrefix}-addressLine2`}>
        <IconInput icon={MapPinIcon} {...field("addressLine2")} />
      </FieldRow>
      <FieldRow label="Address Line 3" htmlFor={`${idPrefix}-addressLine3`}>
        <IconInput icon={MapPinIcon} {...field("addressLine3")} />
      </FieldRow>
      <FieldRow label="Country" htmlFor={`${idPrefix}-country`}>
        <IconInput icon={GlobeIcon} {...field("country")} />
      </FieldRow>
      <FieldRow label="Zip Code" htmlFor={`${idPrefix}-zipCode`}>
        <IconInput icon={BuildingsIcon} {...field("zipCode")} />
      </FieldRow>
      <FieldRow label="City" htmlFor={`${idPrefix}-city`}>
        <IconInput icon={BuildingsIcon} {...field("city")} />
      </FieldRow>
      <FieldRow label="State" htmlFor={`${idPrefix}-state`}>
        <IconInput icon={GlobeIcon} {...field("state")} />
      </FieldRow>
      <FieldRow label="Company Name" htmlFor={`${idPrefix}-companyName`}>
        <IconInput icon={BuildingsIcon} {...field("companyName")} />
      </FieldRow>
      <FieldRow label="Phone 1" htmlFor={`${idPrefix}-phone1`}>
        <IconInput icon={PhoneIcon} {...field("phone1")} />
      </FieldRow>
      <FieldRow label="Phone 2" htmlFor={`${idPrefix}-phone2`}>
        <IconInput icon={PhoneIcon} {...field("phone2")} />
      </FieldRow>
      <FieldRow label="Email" htmlFor={`${idPrefix}-email`}>
        <IconInput icon={EnvelopeIcon} type="email" {...field("email")} />
      </FieldRow>
    </div>
  );
}

export function CustomerDetailsSection({
  shipment,
  onChange,
}: {
  shipment: ShipmentDetail;
  onChange: (patch: Partial<ShipmentDetail>) => void;
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Sender Details</h2>
        <AddressFields
          idPrefix="sender"
          value={shipment.sender}
          onChange={(patch) => onChange({ sender: { ...shipment.sender, ...patch } })}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Recipient Details</h2>
        <AddressFields
          idPrefix="recipient"
          value={shipment.recipient}
          onChange={(patch) => onChange({ recipient: { ...shipment.recipient, ...patch } })}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Pickup Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FieldRow label="Pickup Provider" htmlFor="pickup-provider">
            <Input
              id="pickup-provider"
              value={shipment.pickup.pickupProvider}
              onChange={(e) =>
                onChange({ pickup: { ...shipment.pickup, pickupProvider: e.target.value } })
              }
            />
          </FieldRow>
          <FieldRow label="Pickup Date" htmlFor="pickup-date">
            <Input
              id="pickup-date"
              type="date"
              value={shipment.pickup.pickupDate}
              onChange={(e) => onChange({ pickup: { ...shipment.pickup, pickupDate: e.target.value } })}
            />
          </FieldRow>
          <FieldRow label="Start Time" htmlFor="pickup-start">
            <Input
              id="pickup-start"
              type="time"
              value={shipment.pickup.startTime}
              onChange={(e) => onChange({ pickup: { ...shipment.pickup, startTime: e.target.value } })}
            />
          </FieldRow>
          <FieldRow label="End Time" htmlFor="pickup-end">
            <Input
              id="pickup-end"
              type="time"
              value={shipment.pickup.endTime}
              onChange={(e) => onChange({ pickup: { ...shipment.pickup, endTime: e.target.value } })}
            />
          </FieldRow>
          <FieldRow label="Special Instruction (Max 29 Char)" htmlFor="pickup-instruction">
            <Input
              id="pickup-instruction"
              maxLength={29}
              value={shipment.pickup.specialInstruction}
              onChange={(e) =>
                onChange({ pickup: { ...shipment.pickup, specialInstruction: e.target.value } })
              }
            />
          </FieldRow>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Additional Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FieldRow label="Ship Date" htmlFor="additional-ship-date">
            <Input
              id="additional-ship-date"
              type="date"
              value={shipment.additional.shipDate.slice(0, 10)}
              onChange={(e) =>
                onChange({ additional: { ...shipment.additional, shipDate: e.target.value } })
              }
            />
          </FieldRow>
          <FieldRow label="Location Type">
            <Select
              value={shipment.additional.locationType}
              onValueChange={(v) =>
                onChange({
                  additional: { ...shipment.additional, locationType: v as "residential" | "commercial" },
                })
              }
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Duties & Taxes Paid By" htmlFor="additional-duties">
            <Input
              id="additional-duties"
              value={shipment.additional.dutiesTaxesPaidBy}
              onChange={(e) =>
                onChange({ additional: { ...shipment.additional, dutiesTaxesPaidBy: e.target.value } })
              }
              placeholder="Recipient / Sender…"
            />
          </FieldRow>
        </div>
      </section>
    </div>
  );
}
