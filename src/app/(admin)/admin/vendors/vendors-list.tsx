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

// Serialized vendor from the API — SSN never appears here (only hasSsn).
export type VendorRow = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  city: string;
  state: string;
  country: string;
  createdAt: string | null;
  vendorType: { id: number; name: string };
  // Dependent rows a hard delete would cascade away (includes soft-deleted
  // contacts/comments — they are destroyed too).
  counts: { contacts: number; comments: number; services: number };
};

function deleteDescription(vendor: VendorRow | null): string {
  if (!vendor) return "";
  const { contacts, comments, services } = vendor.counts;
  if (contacts + comments + services === 0) {
    return `Delete the vendor "${vendor.name}"? This can't be undone.`;
  }
  const parts = [
    contacts > 0 ? `${contacts} contact${contacts === 1 ? "" : "s"}` : null,
    comments > 0 ? `${comments} comment${comments === 1 ? "" : "s"}` : null,
    services > 0 ? `${services} service assignment${services === 1 ? "" : "s"}` : null,
  ].filter((p): p is string => p !== null);
  const listed =
    parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return `Deleting "${vendor.name}" will also permanently delete ${listed}. This cannot be undone.`;
}

export function VendorsList() {
  const router = useRouter();
  const list = useAdminList<VendorRow>("/api/admin/vendors", [{ id: "createdAt", desc: true }]);
  const [toDelete, setToDelete] = useState<VendorRow | null>(null);

  const columns = useMemo<ColumnDef<VendorRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: sortableHeader("Name"),
        cell: ({ row }) => (
          <div>
            <span className="block font-medium">{row.original.name}</span>
            <span className="block text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        ),
      },
      {
        id: "vendorType",
        header: "Type",
        cell: ({ row }) => row.original.vendorType.name,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "city",
        header: sortableHeader("Location"),
        cell: ({ row }) => `${row.original.city}, ${row.original.country}`,
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
                  onSelect: () => router.push(`/admin/vendors/${row.original.id}/edit`),
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
        <h1 className="text-h2">Vendors</h1>
        <Button asChild className="bg-tys-orange text-white hover:bg-tys-orange/90">
          <Link href="/admin/vendors/new">Add vendor</Link>
        </Button>
      </div>
      <Input
        value={list.search}
        onChange={(e) => list.setSearch(e.target.value)}
        placeholder="Search vendors…"
        className="max-w-xs"
        aria-label="Search vendors"
      />
      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage={
          list.search
            ? `No vendors match "${list.search}".`
            : "No vendors yet. Add your first vendor."
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
        title="Delete vendor"
        description={deleteDescription(toDelete)}
        confirmLabel="Delete vendor"
        onConfirm={async () => {
          await adminApi(`/api/admin/vendors/${toDelete!.id}`, { method: "DELETE" });
          toast.success("Vendor deleted.");
          list.refresh();
        }}
      />
    </div>
  );
}
