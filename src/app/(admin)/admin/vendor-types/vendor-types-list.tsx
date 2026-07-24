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
import { Input } from "@/components/ui/input";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/status-badge";

export type VendorTypeRow = {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  createdAt: string | null;
};

export function VendorTypesList() {
  const router = useRouter();
  const list = useAdminList<VendorTypeRow>("/api/admin/vendor-types", [
    { id: "createdAt", desc: true },
  ]);
  const [toDelete, setToDelete] = useState<VendorTypeRow | null>(null);

  const columns = useMemo<ColumnDef<VendorTypeRow>[]>(
    () => [
      { accessorKey: "name", header: sortableHeader("Name") },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="block max-w-72 truncate text-muted-foreground">
            {row.original.description ?? "—"}
          </span>
        ),
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
                {
                  label: "Edit",
                  onSelect: () => router.push(`/admin/vendor-types/${row.original.id}/edit`),
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
        <h1 className="text-h2">Vendor types</h1>
        <Button asChild className="bg-tys-orange text-white hover:bg-tys-orange/90">
          <Link href="/admin/vendor-types/new">Add vendor type</Link>
        </Button>
      </div>
      <Input
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
        placeholder="Search vendor types…"
        className="max-w-xs"
        aria-label="Search vendor types"
      />
      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage={
          list.search
            ? `No vendor types match "${list.search}".`
            : "No vendor types yet. Add your first vendor type."
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
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete vendor type"
        description={`Delete the vendor type "${toDelete?.name}"? This can't be undone.`}
        confirmLabel="Delete vendor type"
        onConfirm={async () => {
          await adminApi(`/api/admin/vendor-types/${toDelete!.id}`, { method: "DELETE" });
          toast.success("Vendor type deleted.");
          list.refresh();
        }}
      />
    </div>
  );
}
