"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useAdminList } from "@/hooks/use-admin-list";
import { cn } from "@/lib/utils";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { CustomerAvatar, GoogleMark, relativeTime } from "@/components/admin/customer-bits";

export type CustomerRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string | null;
  quoteCount: number;
  bookingCount: number;
  lastActivity: string | null;
  signIn: "google" | "password";
};

const SEGMENTS = [
  ["", "All"],
  ["verified", "Verified"],
  ["booked", "Has booked"],
  ["new", "New this month"],
] as const;

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

// CRM-style customer list (2026-10-05), the standard "people" table of
// HubSpot/Attio: who they are, how engaged, how recent. Click a row for the
// profile.
export function CustomersList() {
  const router = useRouter();
  const [segment, setSegment] = useState("");
  const list = useAdminList<CustomerRow>("/api/admin/customers", [{ id: "createdAt", desc: true }], { segment });

  const columns: ColumnDef<CustomerRow>[] = [
    {
      accessorKey: "name",
      header: sortableHeader("Customer"),
      size: 300,
      cell: ({ row }) => (
        <div className="flex min-w-0 items-center gap-3">
          <CustomerAvatar name={row.original.name} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-medium">{row.original.name}</span>
              {row.original.emailVerified && (
                <CheckCircleIcon size={14} weight="fill" className="shrink-0 text-emerald-600" aria-label="Email verified" />
              )}
            </div>
            <div className="truncate text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      size: 150,
      cell: ({ row }) => <span className="tabular-nums">{row.original.phone ?? <span className="text-muted-foreground">—</span>}</span>,
    },
    {
      id: "quotes",
      header: "Quotes",
      size: 90,
      cell: ({ row }) => <Count n={row.original.quoteCount} />,
    },
    {
      id: "bookings",
      header: "Bookings",
      size: 100,
      cell: ({ row }) => <Count n={row.original.bookingCount} />,
    },
    {
      id: "lastActivity",
      header: "Last activity",
      size: 130,
      cell: ({ row }) => <span className="text-muted-foreground">{relativeTime(row.original.lastActivity)}</span>,
    },
    {
      id: "signIn",
      header: "Signs in with",
      size: 130,
      cell: ({ row }) =>
        row.original.signIn === "google" ? (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <GoogleMark /> Google
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Email</span>
        ),
    },
    {
      accessorKey: "createdAt",
      header: sortableHeader("Joined"),
      size: 120,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.createdAt ? dateFmt.format(new Date(row.original.createdAt)) : "—"}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h2">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Everyone with a TYS account{list.total ? ` · ${list.total} ${list.total === 1 ? "person" : "people"}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border bg-background p-1">
          {SEGMENTS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSegment(value);
                list.setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                segment === value ? "bg-tys-navy text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative w-full max-w-xs">
          <MagnifyingGlassIcon size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search name, email or phone"
            aria-label="Search customers"
            className="h-10 w-full rounded-xl border bg-background pr-3 pl-9 text-sm outline-none focus:border-tys-blue focus:ring-3 focus:ring-tys-blue/15"
          />
        </label>
      </div>

      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage={segment || list.search ? "No customers match." : "No customers have signed up yet."}
        onRowClick={(r) => router.push(`/admin/customers/${r.id}`)}
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

function Count({ n }: { n: number }) {
  return <span className={cn("tabular-nums", n === 0 ? "text-muted-foreground" : "font-medium")}>{n}</span>;
}
