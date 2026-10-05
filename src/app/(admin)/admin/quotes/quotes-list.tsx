"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import Link from "next/link";
import { CaretDownIcon, CheckIcon, FileTextIcon, PlusIcon, PulseIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { formatPackageTypes, PACKAGE_TYPE_OPTIONS } from "@/lib/package-type";
import { adminApi, ApiError } from "@/lib/admin-api";
import { useAdminList } from "@/hooks/use-admin-list";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { QUOTE_STATUS_LABELS } from "@/lib/quote-status";
import { Button } from "@/components/ui/button";
import { LocalDateTime } from "@/components/shared/local-date-time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, sortableHeader, type ColumnFilterConfig } from "@/components/shared/data-table";
import { QuoteStatusControl } from "@/components/admin/quote-status-control";
import { DateRangeFilter } from "@/components/admin/date-range-filter";

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

type QuoteStatusValue = "pending" | "quoted" | "accepted" | "cancelled";

// Same checkbox-dropdown pattern as the Shipments list filter
// (src/app/(admin)/admin/shipments/shipments-list.tsx). Labels come from the
// shared map so the filter chip, the row status control, and the badge never
// drift from each other again.
const STATUS_LABELS = QUOTE_STATUS_LABELS as Record<QuoteStatusValue, string>;
const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as QuoteStatusValue[];

const ROUTE_OPTIONS = [
  ["all", "All routes"],
  ["domestic", "Domestic (US↔US)"],
  ["international", "International"],
] as const;

function FilterCheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-sm border border-input",
        checked && "border-primary bg-primary text-primary-foreground",
      )}
    >
      {checked && <CheckIcon size={11} weight="bold" />}
    </span>
  );
}

export function QuotesList({ tabs }: { tabs?: React.ReactNode }) {
  const router = useRouter();
  // Defaults to "New Request" only — the list should open on what needs
  // action, not everything ever quoted; support broadens it manually.
  const [selectedStatuses, setSelectedStatuses] = useState<Set<QuoteStatusValue>>(
    () => new Set(["pending"]),
  );
  const [packageType, setPackageType] = useState("all");
  const [route, setRoute] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [convertingId, setConvertingId] = useState<number | null>(null);
  // Per-column search box under the Contact header (same pattern as the
  // Vendors list) — replaces the old single global search box. Route isn't
  // given one: raw from/to zip text was deliberately dropped before in favor
  // of the domestic/international Select above (see that filter's comment).
  const [contactFilter, setContactFilter] = useState("");
  // Live value for the input, debounced value for the actual query — a
  // request (and the resulting loading-flicker + row-count/height change)
  // on every keystroke is what "jittering while typing" actually was.
  const debouncedContact = useDebouncedValue(contactFilter);

  async function convertToShipment(quoteId: number) {
    setConvertingId(quoteId);
    try {
      const res = await adminApi<{ id: number }>(`/api/admin/quotes/${quoteId}/convert-to-shipment`, {
        method: "POST",
      });
      toast.success(`Shipment #${res.id} created.`);
      router.push("/admin/shipments");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't convert this quote to a shipment.");
    } finally {
      setConvertingId(null);
    }
  }

  const list = useAdminList<QuoteRow>("/api/admin/quotes", [{ id: "createdAt", desc: true }], {
    ...(selectedStatuses.size > 0 ? { status: [...selectedStatuses].join(",") } : {}),
    ...(packageType !== "all" ? { packageType } : {}),
    ...(route !== "all" ? { route } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
    ...(debouncedContact ? { contact: debouncedContact } : {}),
  });

  const columnFilters: ColumnFilterConfig[] = [
    {
      id: "contact",
      value: contactFilter,
      onChange: (v) => {
        setContactFilter(v);
        list.setPage(1);
      },
      placeholder: "Search name / email / phone…",
    },
  ];

  function toggleStatus(value: QuoteStatusValue, on: boolean) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (on) next.add(value);
      else next.delete(value);
      return next;
    });
    list.setPage(1);
  }

  function toggleAllStatuses(on: boolean) {
    setSelectedStatuses(on ? new Set(STATUS_OPTIONS) : new Set());
    list.setPage(1);
  }

  const columns: ColumnDef<QuoteRow>[] = [
    {
      id: "route",
      size: 160,
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
      size: 200,
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
      size: 130,
      header: "Packages",
      cell: ({ row }) => formatPackageTypes(row.original.packageType),
    },
    {
      accessorKey: "totalChargeableWeight",
      size: 110,
      header: sortableHeader("Chg. weight"),
      cell: ({ row }) => row.original.totalChargeableWeight ?? "—",
    },
    {
      accessorKey: "estimatedCost",
      size: 120,
      header: sortableHeader("Est. cost"),
      cell: ({ row }) =>
        row.original.estimatedCost == null
          ? "—"
          : `${row.original.estimatedCost} ${row.original.currency ?? ""}`.trim(),
    },
    {
      id: "opens",
      size: 110,
      header: "Email opens",
      cell: ({ row }) => row.original.emailStatistic?.openCount ?? "—",
    },
    {
      accessorKey: "createdAt",
      size: 190,
      header: sortableHeader("Created"),
      cell: ({ row }) => <LocalDateTime iso={row.original.createdAt} />,
    },
    {
      id: "status",
      size: 160,
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
      size: 180,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {row.original.status === "accepted" && (
            <Button
              size="sm"
              className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
              disabled={convertingId === row.original.id}
              onClick={() => convertToShipment(row.original.id)}
            >
              {convertingId === row.original.id ? "Converting…" : "Convert to Shipment"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/quotes/${row.original.id}`)}>
            View
          </Button>
        </div>
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
      <QuotesHeader />
      {tabs}
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="border border-input bg-background text-foreground shadow-none hover:bg-muted">
              <PulseIcon size={16} weight="bold" />
              Status
              {selectedStatuses.size > 0 ? ` (${selectedStatuses.size})` : ""}
              <CaretDownIcon size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                toggleAllStatuses(!(selectedStatuses.size === STATUS_OPTIONS.length));
              }}
              className="gap-2.5"
            >
              <FilterCheckMark checked={selectedStatuses.size === STATUS_OPTIONS.length} />
              <span className="whitespace-nowrap">All</span>
            </DropdownMenuItem>
            {STATUS_OPTIONS.map((value) => (
              <DropdownMenuItem
                key={value}
                onSelect={(e) => {
                  e.preventDefault();
                  toggleStatus(value, !selectedStatuses.has(value));
                }}
                className="gap-2.5"
              >
                <FilterCheckMark checked={selectedStatuses.has(value)} />
                <span className="whitespace-nowrap">{STATUS_LABELS[value]}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
        <Select value={route} onValueChange={resetToPage1(setRoute)}>
          <SelectTrigger className="w-44" aria-label="Filter by route">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROUTE_OPTIONS.map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onChange={(from, to) => {
            resetToPage1(setFromDate)(from);
            resetToPage1(setToDate)(to);
          }}
          label="Created"
        />
      </div>
      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage="No quotes match the current filters."
        columnFilters={columnFilters}
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

/** Title row shared by the All quotes and Incomplete tabs. */
export function QuotesHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-tys-blue">
          <FileTextIcon size={22} weight="bold" />
        </div>
        <h1 className="text-h2">Quotes</h1>
      </div>
      <Button asChild className="bg-tys-blue text-white hover:bg-tys-blue/90">
        <Link href="/admin/quotes/new">
          <PlusIcon size={16} weight="bold" />
          New quote
        </Link>
      </Button>
    </div>
  );
}
