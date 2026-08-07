"use client";

import { toast } from "sonner";
import { PlusIcon, UploadIcon } from "@phosphor-icons/react";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DocumentationRow, ShipmentDetail } from "./types";

const DOCUMENT_TYPES = ["Commercial Invoice", "Invoice", "Packing List", "Bill of Lading", "Other"];

// File upload is a stub (same rationale as the Vendor Documents tab) — no
// cloud object storage is configured yet. The row itself (type/name/status)
// is real, persisted state (PATCH /api/admin/shipments/[id]) — negative ids
// are client-generated temp ids for a row added this session (create).
export function DocumentationSection({
  shipment,
  onChange,
}: {
  shipment: ShipmentDetail;
  onChange: (patch: Partial<ShipmentDetail>) => void;
}) {
  function updateRow(index: number, patch: Partial<DocumentationRow>) {
    onChange({
      documentation: shipment.documentation.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    });
  }

  function addRow() {
    onChange({
      documentation: [
        ...shipment.documentation,
        {
          id: -Date.now(),
          documentType: "Commercial Invoice",
          documentName: "",
          createdOn: new Date().toISOString(),
          status: "active",
        },
      ],
    });
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="font-heading text-lg font-semibold">Documentation</h2>
      <div className="overflow-hidden rounded-xl border border-tys-mist">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Type</TableHead>
              <TableHead>Document Name</TableHead>
              <TableHead>Created On</TableHead>
              <TableHead>Attachments</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipment.documentation.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No documents yet — add one below.
                </TableCell>
              </TableRow>
            ) : (
              shipment.documentation.map((row, i) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Select value={row.documentType} onValueChange={(v) => updateRow(i, { documentType: v })}>
                      <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8"
                      value={row.documentName ?? ""}
                      onChange={(e) => updateRow(i, { documentName: e.target.value })}
                      placeholder="Enter document name…"
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <LocalDateTime iso={row.createdOn} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Document storage isn't configured yet.")}
                    >
                      <UploadIcon size={14} />
                      Upload
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label="Add document"
                      onClick={addRow}
                    >
                      <PlusIcon size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {shipment.documentation.length === 0 && (
        <Button variant="outline" onClick={addRow} className="self-start">
          <PlusIcon size={16} />
          Add document row
        </Button>
      )}
    </div>
  );
}
