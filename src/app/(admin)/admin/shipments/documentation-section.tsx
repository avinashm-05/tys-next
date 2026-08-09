"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DownloadSimpleIcon, PlusIcon, SpinnerIcon, TagIcon, UploadIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
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

const LABEL_TYPE = "Label";
const DOCUMENT_TYPES = [
  LABEL_TYPE,
  "Commercial Invoice",
  "Invoice",
  "Packing List",
  "Bill of Lading",
  "Other",
];

// Generic file upload is still a stub (no upload endpoint yet) — but a row
// whose type is "Label" can produce its own file: Generate Label calls FedEx
// Ship, stores the returned PDF, and the row becomes downloadable. The row
// itself (type/name/status) is real, persisted state (PATCH
// /api/admin/shipments/[id]) — negative ids are client-generated temp ids
// for a row added this session (create).
export function DocumentationSection({
  shipment,
  onChange,
}: {
  shipment: ShipmentDetail;
  onChange: (patch: Partial<ShipmentDetail>) => void;
}) {
  const [generating, setGenerating] = useState(false);

  async function generateLabel(row: DocumentationRow) {
    setGenerating(true);
    try {
      const res = await adminApi<{
        masterTrackingNumber: string;
        documents: DocumentationRow[];
      }>(`/api/admin/shipments/${shipment.id}/label`, {
        method: "POST",
        // Negative ids are rows added this session that were never saved, so
        // there's nothing on the server to fill in — the server creates a row
        // instead and the unsaved placeholder is dropped below.
        body: JSON.stringify({ documentId: row.id > 0 ? row.id : undefined }),
      });

      const returnedIds = new Set(res.documents.map((d) => d.id));
      onChange({
        // Drop the row we generated from (the server either replaced it and
        // returns it, or it was an unsaved placeholder) plus any other unsaved
        // Label placeholder, then append what came back persisted.
        documentation: [
          ...shipment.documentation.filter(
            (r) =>
              r.id !== row.id && !returnedIds.has(r.id) && !(r.documentType === LABEL_TYPE && r.id < 0),
          ),
          ...res.documents,
        ],
        trackingNumber: res.masterTrackingNumber,
      });
      toast.success(`Label generated — tracking ${res.masterTrackingNumber}`);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't generate the label.");
    } finally {
      setGenerating(false);
    }
  }

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
                    {row.hasFile ? (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`/api/admin/shipments/${shipment.id}/documents/${row.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <DownloadSimpleIcon size={14} />
                          Download
                        </a>
                      </Button>
                    ) : row.documentType === LABEL_TYPE ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateLabel(row)}
                        disabled={generating}
                      >
                        {generating ? (
                          <SpinnerIcon size={14} className="animate-spin" />
                        ) : (
                          <TagIcon size={14} />
                        )}
                        {generating ? "Generating…" : "Generate label"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Document storage isn't configured yet.")}
                      >
                        <UploadIcon size={14} />
                        Upload
                      </Button>
                    )}
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
