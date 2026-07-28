"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { UsersIcon } from "@phosphor-icons/react";
import { adminApi } from "@/lib/admin-api";
import { useAdminList } from "@/hooks/use-admin-list";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { SectionIconBadge } from "@/components/admin/section-icon-badge";
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
// Columns match the SETU reference (Name/Title/City/State/Email/Work
// Phone/Cell Phone, single edit action) — Status and Added-by still live in
// the edit dialog, just not shown as their own table columns here.
export function ContactsSection({ vendorId }: { vendorId: number }) {
  const list = useAdminList<ContactRow>(`/api/admin/vendors/${vendorId}/contacts`, [
    { id: "createdAt", desc: true },
  ]);
  const [dialog, setDialog] = useState<ContactRow | "new" | null>(null);
  const [toDelete, setToDelete] = useState<ContactRow | null>(null);

  const columns = useMemo<ColumnDef<ContactRow>[]>(
    () => [
      { accessorKey: "name", header: sortableHeader("Name") },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => row.original.title ?? "—",
      },
      {
        accessorKey: "city",
        header: "City",
        cell: ({ row }) => row.original.city ?? "—",
      },
      {
        accessorKey: "state",
        header: "State",
        cell: ({ row }) => row.original.state ?? "—",
      },
      { accessorKey: "email", header: sortableHeader("Email") },
      {
        accessorKey: "workPhone",
        header: "Work phone",
        cell: ({ row }) => row.original.workPhone ?? "—",
      },
      {
        accessorKey: "cellPhone",
        header: "Cell phone",
        cell: ({ row }) => row.original.cellPhone ?? "—",
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Action</span>,
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
    <Card className="overflow-visible">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SectionIconBadge icon={UsersIcon} />
            <h2 className="font-heading text-lg font-semibold">Contact list</h2>
          </div>
          <CardAction>
            <Button
              className="bg-tys-blue text-white hover:bg-tys-blue/90"
              onClick={() => setDialog("new")}
            >
              Add
            </Button>
          </CardAction>
        </div>
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
