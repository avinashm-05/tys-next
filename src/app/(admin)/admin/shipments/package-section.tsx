"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ShipmentDetail, ShipmentPackage } from "./mock-data";

function emptyPackage(number: number): ShipmentPackage {
  return { number, weight: "", dimL: "", dimW: "", dimH: "", chargeLbs: "0.00", insurance: "0.00" };
}

export function PackageSection({
  shipment,
  onChange,
}: {
  shipment: ShipmentDetail;
  onChange: (patch: Partial<ShipmentDetail>) => void;
}) {
  const [addCount, setAddCount] = useState("1");

  function updateRow(index: number, patch: Partial<ShipmentPackage>) {
    const packages = shipment.packages.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onChange({ packages });
  }

  function removeRow(index: number) {
    const packages = shipment.packages
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, number: i + 1 }));
    onChange({ packages: packages.length > 0 ? packages : [emptyPackage(1)] });
  }

  function addRows() {
    const count = Math.max(1, Math.min(20, parseInt(addCount, 10) || 1));
    const start = shipment.packages.length;
    const added = Array.from({ length: count }, (_, i) => emptyPackage(start + i + 1));
    onChange({ packages: [...shipment.packages, ...added] });
  }

  const totalCharge = shipment.packages.reduce((sum, p) => sum + (parseFloat(p.chargeLbs) || 0), 0);
  const totalInsurance = shipment.packages.reduce((sum, p) => sum + (parseFloat(p.insurance) || 0), 0);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">Package</h2>
        <div className="flex items-end gap-2">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground" htmlFor="package-add-count">
              No. of Packages
            </label>
            <Input
              id="package-add-count"
              type="number"
              min={1}
              max={20}
              className="w-28"
              value={addCount}
              onChange={(e) => setAddCount(e.target.value)}
            />
          </div>
          <Button type="button" onClick={addRows} className="bg-tys-indigo text-white hover:bg-tys-indigo/90">
            <PlusIcon size={16} weight="bold" />
            Add
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-tys-mist">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Dim(L)</TableHead>
              <TableHead>Dim(W)</TableHead>
              <TableHead>Dim(H)</TableHead>
              <TableHead>Charge (Lbs)</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipment.packages.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.number}</TableCell>
                <TableCell>
                  <Input
                    value={row.weight}
                    onChange={(e) => updateRow(i, { weight: e.target.value })}
                    className="h-8 w-24"
                    aria-label={`Package ${row.number} weight`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.dimL}
                    onChange={(e) => updateRow(i, { dimL: e.target.value })}
                    className="h-8 w-20"
                    aria-label={`Package ${row.number} length`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.dimW}
                    onChange={(e) => updateRow(i, { dimW: e.target.value })}
                    className="h-8 w-20"
                    aria-label={`Package ${row.number} width`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.dimH}
                    onChange={(e) => updateRow(i, { dimH: e.target.value })}
                    className="h-8 w-20"
                    aria-label={`Package ${row.number} height`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.chargeLbs}
                    onChange={(e) => updateRow(i, { chargeLbs: e.target.value })}
                    className="h-8 w-24"
                    aria-label={`Package ${row.number} charge`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={row.insurance}
                    onChange={(e) => updateRow(i, { insurance: e.target.value })}
                    className="h-8 w-24"
                    aria-label={`Package ${row.number} insurance`}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRow(i)}
                    aria-label={`Remove package ${row.number}`}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={2}>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox
                    checked={shipment.doNotShowOnMyShipment}
                    onCheckedChange={(v) => onChange({ doNotShowOnMyShipment: v === true })}
                  />
                  Do not show on My Shipment
                </label>
              </TableCell>
              <TableCell colSpan={2} />
              <TableCell className="text-right font-medium">Total:</TableCell>
              <TableCell className="font-medium">{totalCharge.toFixed(2)}</TableCell>
              <TableCell className="font-medium">{totalInsurance.toFixed(2)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
