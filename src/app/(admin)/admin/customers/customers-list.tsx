"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { UsersIcon } from "@phosphor-icons/react";
import { useAdminList } from "@/hooks/use-admin-list";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, sortableHeader } from "@/components/shared/data-table";

export type CustomerRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string | null;
  quoteCount: number;
};

export function CustomersList() {
  const router = useRouter();
  const list = useAdminList<CustomerRow>("/api/admin/customers", [{ id: "createdAt", desc: true }]);

  const columns: ColumnDef<CustomerRow>[] = [
    {
      accessorKey: "name",
      header: sortableHeader("Name"),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: sortableHeader("Email"),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.email}
          {row.original.emailVerified ? (
            <Badge variant="outline" className="text-emerald-600">
              Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Unverified
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      id: "quotes",
      header: "Quotes",
      cell: ({ row }) => row.original.quoteCount,
    },
    {
      accessorKey: "createdAt",
      header: sortableHeader("Joined"),
      cell: ({ row }) => <LocalDateTime iso={row.original.createdAt} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/customers/${row.original.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-tys-blue text-white">
          <UsersIcon size={22} weight="bold" />
        </div>
        <h1 className="text-h2">Customers</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder="Search name / email / phone…"
          className="max-w-xs"
          aria-label="Search customers"
        />
      </div>
      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage="No customers have registered yet."
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
    </div>
  );
}
