"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";
import { formatDateTime } from "@/lib/format";
import { useAdminList } from "@/hooks/use-admin-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { ContactDialog } from "./contact-dialog";

export type ContactRow = {
  id: number;
  name: string;
  title: string | null;
  email: string;
  workPhone: string | null;
  cellPhone: string | null;
  city: string | null;
  state: string | null;
  status: "active" | "inactive";
  createdAt: string | null;
  createdBy: { id: number; name: string } | null;
};

// No CSV here on purpose: Laravel's contact controller has no CSV routes
// (02-routes) — export/import would be invented features.
export function ContactsSection({ vendorId }: { vendorId: number }) {
  const list = useAdminList<ContactRow>(`/api/admin/vendors/${vendorId}/contacts`, [
    { id: "createdAt", desc: true },
  ]);
  const [dialog, setDialog] = useState<ContactRow | "new" | null>(null);
  const [toDelete, setToDelete] = useState<ContactRow | null>(null);

  const columns = useMemo<ColumnDef<ContactRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: sortableHeader("Name"),
        cell: ({ row }) => (
          <div>
            <span className="block font-medium">{row.original.name}</span>
            {row.original.title && (
              <span className="block text-xs text-muted-foreground">{row.original.title}</span>
            )}
          </div>
        ),
      },
      { accessorKey: "email", header: sortableHeader("Email") },
      {
        id: "phones",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-xs">
            {row.original.workPhone && <span className="block">W: {row.original.workPhone}</span>}
            {row.original.cellPhone && <span className="block">C: {row.original.cellPhone}</span>}
            {!row.original.workPhone && !row.original.cellPhone && "—"}
          </div>
        ),
      },
      {
        accessorKey: "city",
        header: "Location",
        cell: ({ row }) =>
          [row.original.city, row.original.state].filter(Boolean).join(", ") || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: sortableHeader("Added"),
        cell: ({ row }) => (
          <div className="text-xs">
            <span className="block">{formatDateTime(row.original.createdAt)}</span>
            {row.original.createdBy && (
              <span className="block text-muted-foreground">
                by {row.original.createdBy.name}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="text-right">
            <RowActions
              actions={[
                { label: "Edit", onSelect: () => setDialog(row.original) },
                { label: "Delete", destructive: true, onSelect: () => setToDelete(row.original) },
              ]}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
        <CardDescription>People at this vendor. Deleted contacts are kept for the audit trail but hidden.</CardDescription>
        <CardAction>
          <Button variant="outline" onClick={() => setDialog("new")}>
            Add contact
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder="Search contacts…"
          className="max-w-xs"
          aria-label="Search contacts"
        />
        <DataTable
          columns={columns}
          data={list.rows}
          emptyMessage={
            list.search
              ? `No contacts match "${list.search}".`
              : "No contacts yet. Add your first contact."
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
      </CardContent>
      {dialog !== null && (
        <ContactDialog
          vendorId={vendorId}
          contact={dialog === "new" ? undefined : dialog}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            list.refresh();
          }}
        />
      )}
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete contact"
        description={`Delete the contact "${toDelete?.name}"? This can't be undone.`}
        confirmLabel="Delete contact"
        onConfirm={async () => {
          await adminApi(`/api/admin/vendors/${vendorId}/contacts/${toDelete!.id}`, {
            method: "DELETE",
          });
          toast.success("Contact deleted.");
          list.refresh();
        }}
      />
    </Card>
  );
}
