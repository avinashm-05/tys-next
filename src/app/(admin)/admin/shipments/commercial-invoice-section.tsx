"use client";

import { InfoIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CommercialInvoiceLine, ShipmentDetail } from "./mock-data";

export function CommercialInvoiceSection({
  shipment,
  onChange,
}: {
  shipment: ShipmentDetail;
  onChange: (patch: Partial<ShipmentDetail>) => void;
}) {
  function updateRow(index: number, patch: Partial<CommercialInvoiceLine>) {
    const commercialInvoice = shipment.commercialInvoice.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    onChange({ commercialInvoice });
  }

  function addRow() {
    const nextPackageNumber = shipment.packages[0]?.number ?? 1;
    onChange({
      commercialInvoice: [
        ...shipment.commercialInvoice,
        { packageNumber: nextPackageNumber, packageContent: "", quantity: 1, valuePerQty: "0.00" },
      ],
    });
  }

  function removeRow(index: number) {
    onChange({ commercialInvoice: shipment.commercialInvoice.filter((_, i) => i !== index) });
  }

  const totalCost = shipment.commercialInvoice.reduce(
    (sum, row) => sum + row.quantity * (parseFloat(row.valuePerQty) || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="font-heading text-lg font-semibold">Commercial Invoice</h2>
      <div className="overflow-hidden rounded-xl border border-tys-mist">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package Number</TableHead>
              <TableHead>Package Content</TableHead>
              <TableHead>Quantity *</TableHead>
              <TableHead>Value Per Qty *</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipment.commercialInvoice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No invoice lines yet — add one below.
                </TableCell>
              </TableRow>
            ) : (
              shipment.commercialInvoice.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Input
                      type="number"
                      className="h-8 w-20"
                      value={row.packageNumber}
                      onChange={(e) => updateRow(i, { packageNumber: Number(e.target.value) || 1 })}
                      aria-label={`Invoice line ${i + 1} package number`}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8"
                      value={row.packageContent}
                      onChange={(e) => updateRow(i, { packageContent: e.target.value })}
                      placeholder="Documents, Electronics…"
                      aria-label={`Invoice line ${i + 1} content`}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      className="h-8 w-20"
                      value={row.quantity}
                      onChange={(e) => updateRow(i, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                      aria-label={`Invoice line ${i + 1} quantity`}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 w-24"
                      value={row.valuePerQty}
                      onChange={(e) => updateRow(i, { valuePerQty: e.target.value })}
                      aria-label={`Invoice line ${i + 1} value per quantity`}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {(row.quantity * (parseFloat(row.valuePerQty) || 0)).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button type="button" size="icon" variant="ghost" title="Details" aria-label="Line details">
                        <InfoIcon size={16} />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Remove invoice line ${i + 1}`}
                        onClick={() => removeRow(i)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} />
              <TableCell className="text-right font-medium">Total Cost:</TableCell>
              <TableCell className="font-medium">{totalCost.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button type="button" size="icon" variant="outline" onClick={addRow} aria-label="Add invoice line">
                  <PlusIcon size={16} />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
