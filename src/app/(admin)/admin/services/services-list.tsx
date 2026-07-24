"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";
import { formatDateTime } from "@/lib/format";
import { useAdminList } from "@/hooks/use-admin-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/status-badge";

export type ServiceRow = {
  id: number;
  name: string;
  systemName: string;
  status: "active" | "deactive";
  createdAt: string | null;
  updatedAt: string | null;
};

export function ServicesList() {
  const router = useRouter();
  const list = useAdminList<ServiceRow>("/api/admin/services", [{ id: "createdAt", desc: true }]);
  const [toDelete, setToDelete] = useState<ServiceRow | null>(null);
  const [detail, setDetail] = useState<ServiceRow | null>(null);

  async function openDetail(id: number) {
    try {
      // JSON detail endpoint (replaces Laravel's modal-HTML fragment).
      setDetail(await adminApi<ServiceRow>(`/api/admin/services/${id}`));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't load the service.");
    }
  }

  const columns = useMemo<ColumnDef<ServiceRow>[]>(
    () => [
      { accessorKey: "name", header: sortableHeader("Name") },
      {
        accessorKey: "systemName",
        header: sortableHeader("System name"),
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.systemName}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: sortableHeader("Created"),
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <RowActions
              actions={[
                { label: "View", onSelect: () => openDetail(row.original.id) },
                {
                  label: "Edit",
                  onSelect: () => router.push(`/admin/services/${row.original.id}/edit`),
                },
                { label: "Delete", destructive: true, onSelect: () => setToDelete(row.original) },
              ]}
            />
          </div>
        ),
      },
    ],
    [router],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-h2">Services</h1>
        <Button asChild className="bg-tys-orange text-white hover:bg-tys-orange/90">
          <Link href="/admin/services/new">Add service</Link>
        </Button>
      </div>
      <Input
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
        placeholder="Search services…"
        className="max-w-xs"
        aria-label="Search services"
      />
      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage={
          list.search
            ? `No services match "${list.search}".`
            : "No services yet. Add your first service."
        }
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
      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>Service details</DialogDescription>
          </DialogHeader>
          {detail && (
            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">System name</dt>
              <dd className="font-mono text-xs">{detail.systemName}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge status={detail.status} />
              </dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDateTime(detail.createdAt)}</dd>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{formatDateTime(detail.updatedAt)}</dd>
            </dl>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete service"
        description={`Delete the service "${toDelete?.name}"? This can't be undone.`}
        confirmLabel="Delete service"
        onConfirm={async () => {
          await adminApi(`/api/admin/services/${toDelete!.id}`, { method: "DELETE" });
          toast.success("Service deleted.");
          list.refresh();
        }}
      />
    </div>
  );
}
