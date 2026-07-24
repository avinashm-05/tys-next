"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/format";
import { formatPackageTypes, PACKAGE_TYPE_OPTIONS } from "@/lib/package-type";
import { useAdminList } from "@/hooks/use-admin-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { QuoteStatusControl } from "@/components/admin/quote-status-control";

export type QuoteRow = {
  id: number;
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  isResidence: boolean;
  packageType: string;
  status: string;
  totalChargeableWeight: string | null;
  estimatedCost: string | null;
  currency: string | null;
  contact: { name: string | null; email: string | null; phone: string | null };
  emailStatistic: { openCount: number } | null;
  createdAt: string | null;
};

export function QuotesList() {
  const router = useRouter();
  const [status, setStatus] = useState("all");
  const [packageType, setPackageType] = useState("all");
  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const list = useAdminList<QuoteRow>("/api/admin/quotes", [{ id: "createdAt", desc: true }], {
    ...(status !== "all" ? { status } : {}),
    ...(packageType !== "all" ? { packageType } : {}),
    ...(fromCountry ? { fromCountry } : {}),
    ...(toCountry ? { toCountry } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
  });

  const columns: ColumnDef<QuoteRow>[] = [
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className="block font-medium">
            {row.original.fromZip} {row.original.fromCountry} → {row.original.toZip}{" "}
            {row.original.toCountry}
          </span>
          <span className="text-muted-foreground">
            {row.original.isResidence ? "Residential" : "Commercial"}
          </span>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className="block font-medium">{row.original.contact.name ?? "—"}</span>
          <span className="block text-muted-foreground">{row.original.contact.email ?? "—"}</span>
          <span className="block text-muted-foreground">{row.original.contact.phone ?? "—"}</span>
        </div>
      ),
    },
    {
      id: "packageType",
      header: "Packages",
      cell: ({ row }) => formatPackageTypes(row.original.packageType),
    },
    {
      accessorKey: "totalChargeableWeight",
      header: sortableHeader("Chg. weight"),
      cell: ({ row }) => row.original.totalChargeableWeight ?? "—",
    },
    {
      accessorKey: "estimatedCost",
      header: sortableHeader("Est. cost"),
      cell: ({ row }) =>
        row.original.estimatedCost == null
          ? "—"
          : `${row.original.estimatedCost} ${row.original.currency ?? ""}`.trim(),
    },
    {
      id: "opens",
      header: "Email opens",
      cell: ({ row }) => row.original.emailStatistic?.openCount ?? "—",
    },
    {
      accessorKey: "createdAt",
      header: sortableHeader("Created"),
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <QuoteStatusControl
          quoteId={row.original.id}
          status={row.original.status}
          onChanged={() => list.refresh()}
          className="w-36"
        />
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/quotes/${row.original.id}`)}>
          View
        </Button>
      ),
    },
  ];

  function resetToPage1<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      list.setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h2">Quotes</h1>
      <div className="flex flex-wrap gap-2">
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder="Search name / email / phone…"
          className="max-w-xs"
          aria-label="Search quotes"
        />
        <Select value={status} onValueChange={resetToPage1(setStatus)}>
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={packageType} onValueChange={resetToPage1(setPackageType)}>
          <SelectTrigger className="w-40" aria-label="Filter by package type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All package types</SelectItem>
            {PACKAGE_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {formatPackageTypes(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={fromCountry}
          onChange={(e) => resetToPage1(setFromCountry)(e.target.value)}
          placeholder="From country"
          className="w-36"
          aria-label="Filter by from country"
        />
        <Input
          value={toCountry}
          onChange={(e) => resetToPage1(setToCountry)(e.target.value)}
          placeholder="To country"
          className="w-36"
          aria-label="Filter by to country"
        />
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => resetToPage1(setFromDate)(e.target.value)}
          className="w-40"
          aria-label="From date"
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => resetToPage1(setToDate)(e.target.value)}
          className="w-40"
          aria-label="To date"
        />
      </div>
      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage="No quotes match the current filters."
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
