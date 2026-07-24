"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { adminApi, ApiError } from "@/lib/admin-api";
import { useAdminList } from "@/hooks/use-admin-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/admin/status-badge";

type ServicePickerRow = {
  id: number;
  name: string;
  systemName: string;
  status: "active" | "deactive";
  is_assigned: boolean;
};

type Summary = { total: number; assigned: number; unassigned: number };
type BulkResult = { message: string; failed: number[] };

const MAX_BULK = 50;

export function ServicesSection({ vendorId }: { vendorId: number }) {
  const [status, setStatus] = useState("all");
  const [assignment, setAssignment] = useState("all");
  const list = useAdminList<ServicePickerRow, { summary: Summary }>(
    `/api/admin/vendors/${vendorId}/services`,
    [],
    {
      ...(status !== "all" ? { status } : {}),
      ...(assignment !== "all" ? { assignment } : {}),
    },
  );
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const summary = list.extra?.summary;

  function toggleSelected(id: number, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function singleOp(row: ServicePickerRow) {
    try {
      const path = row.is_assigned ? "unassign" : "assign";
      await adminApi(`/api/admin/vendors/${vendorId}/services/${path}`, {
        method: row.is_assigned ? "DELETE" : "POST",
        body: JSON.stringify({ serviceId: row.id }),
      });
      toast.success(row.is_assigned ? "Service unassigned." : "Service assigned.");
      list.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "The change failed. Try again.");
    }
  }

  async function bulkOp(kind: "bulk-assign" | "bulk-unassign") {
    setBusy(true);
    try {
      const res = await adminApi<BulkResult>(
        `/api/admin/vendors/${vendorId}/services/${kind}`,
        {
          method: kind === "bulk-assign" ? "POST" : "DELETE",
          body: JSON.stringify({ serviceIds: [...selected] }),
        },
      );
      (res.failed.length > 0 ? toast.warning : toast.success)(res.message);
      setSelected(new Set());
      list.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "The bulk change failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const pageIds = list.rows.map((r) => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  // No useMemo: the selection checkboxes depend on `selected`/page rows anyway,
  // and the React Compiler handles memoization.
  const columns: ColumnDef<ServicePickerRow>[] = [
      {
        id: "select",
        header: () => (
          <Checkbox
            aria-label="Select all on this page"
            checked={allPageSelected}
            onCheckedChange={(on) =>
              setSelected((prev) => {
                const next = new Set(prev);
                for (const id of pageIds) {
                  if (on) next.add(id);
                  else next.delete(id);
                }
                return next;
              })
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select ${row.original.name}`}
            checked={selected.has(row.original.id)}
            onCheckedChange={(on) => toggleSelected(row.original.id, on === true)}
          />
        ),
      },
      { accessorKey: "name", header: sortableHeader("Name") },
      {
        accessorKey: "systemName",
        header: "System name",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.systemName}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "assigned",
        header: "Assignment",
        cell: ({ row }) =>
          row.original.is_assigned ? (
            <Badge variant="outline" className="gap-1.5 font-normal">
              <span aria-hidden className="size-1.5 rounded-full bg-tys-orange" />
              Assigned
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Not assigned</span>
          ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              disabled={busy || (!row.original.is_assigned && row.original.status !== "active")}
              title={
                !row.original.is_assigned && row.original.status !== "active"
                  ? "Only active services can be assigned."
                  : undefined
              }
              onClick={() => singleOp(row.original)}
            >
              {row.original.is_assigned ? "Unassign" : "Assign"}
            </Button>
          </div>
        ),
      },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardDescription>
          {summary
            ? `${summary.total} service${summary.total === 1 ? "" : "s"} · ${summary.assigned} assigned · ${summary.unassigned} unassigned`
            : "Which services this vendor provides."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search services…"
            className="max-w-xs"
            aria-label="Search services"
          />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              list.setPage(1);
            }}
          >
            <SelectTrigger className="w-36" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="deactive">Deactive</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={assignment}
            onValueChange={(v) => {
              setAssignment(v);
              list.setPage(1);
            }}
          >
            <SelectTrigger className="w-40" aria-label="Filter by assignment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border border-tys-mist bg-muted/40 px-3 py-2">
            <span className="text-xs font-medium">
              {selected.size} selected{selected.size > MAX_BULK ? ` (max ${MAX_BULK})` : ""}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || selected.size > MAX_BULK}
              onClick={() => bulkOp("bulk-assign")}
            >
              Bulk assign
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || selected.size > MAX_BULK}
              onClick={() => bulkOp("bulk-unassign")}
            >
              Bulk unassign
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        )}
        <DataTable
          columns={columns}
          data={list.rows}
          emptyMessage="No services match the current filters."
          server={{
            total: list.total,
            page: list.page,
            pageSize: list.pageSize,
            onPageChange: list.setPage,
            sorting: list.sorting,
            onSortingChange: list.setSorting,
            loading: list.loading,
          }}
        />
      </CardContent>
    </Card>
  );
}
