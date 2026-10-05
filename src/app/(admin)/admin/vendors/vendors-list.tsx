"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  CaretDownIcon,
  CheckIcon,
  DownloadSimpleIcon,
  ListChecksIcon,
  MapPinIcon,
  PencilSimpleIcon,
  PlusIcon,
  StorefrontIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { adminApi } from "@/lib/admin-api";
import { useAdminList } from "@/hooks/use-admin-list";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, sortableHeader, type ColumnFilterConfig } from "@/components/shared/data-table";
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
  createdByName?: string;
  serviceNames?: string[];
  vendorType: { id: number; name: string };
  // Dependent rows a hard delete would cascade away (includes soft-deleted
  // contacts/comments — they are destroyed too).
  counts: { contacts: number; comments: number; services: number };
};

type Option = { id: number; name: string };

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

// A purely visual checkbox square (not a real <button>) — the enclosing
// DropdownMenuItem is what's actually clickable/keyboard-selectable. A real
// nested Checkbox button here swallowed clicks before they reached the item.
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

/** Shared shape for the Services and Vendor Type checkbox-multiselect filter dropdowns. */
function CheckboxFilterDropdown({
  label,
  icon: Icon,
  options,
  selected,
  onToggle,
  onToggleAll,
  className,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: "bold" }>;
  options: Option[];
  selected: Set<number>;
  onToggle: (id: number, on: boolean) => void;
  onToggleAll: (on: boolean) => void;
  className: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className}>
          <Icon size={16} weight="bold" />
          {label}
          {selected.size > 0 ? ` (${selected.size})` : ""}
          <CaretDownIcon size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
        <DropdownMenuLabel>Filter by {label.toLowerCase()}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.length === 0 ? (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">Nothing yet.</div>
        ) : (
          <>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                onToggleAll(!(selected.size > 0 && selected.size === options.length));
              }}
              className="gap-2.5"
            >
              <FilterCheckMark checked={selected.size > 0 && selected.size === options.length} />
              <span className="whitespace-nowrap">All</span>
            </DropdownMenuItem>
            {options.map((o) => (
              <DropdownMenuItem
                key={o.id}
                onSelect={(e) => {
                  e.preventDefault();
                  onToggle(o.id, !selected.has(o.id));
                }}
                className="gap-2.5"
              >
                <FilterCheckMark checked={selected.has(o.id)} />
                <span className="whitespace-nowrap">{o.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function VendorsList() {
  const [serviceOptions, setServiceOptions] = useState<Option[]>([]);
  const [vendorTypeOptions, setVendorTypeOptions] = useState<Option[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<number>>(new Set());
  const [selectedVendorTypeIds, setSelectedVendorTypeIds] = useState<Set<number>>(new Set());
  // Per-column search boxes under the header row (SETU reference) — this is
  // the only search UI on this page now; no separate global search box.
  const [nameFilter, setNameFilter] = useState("");
  const [vendorTypeFilter, setVendorTypeFilter] = useState("");
  const [serviceNameFilter, setServiceNameFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [createdByFilter, setCreatedByFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // Live value feeds the input (typing never lags), debounced value feeds
  // the query — a request (and the resulting loading-flicker + row-count/
  // height change) on every keystroke is what "jittering while typing" was.
  const debouncedName = useDebouncedValue(nameFilter);
  const debouncedVendorType = useDebouncedValue(vendorTypeFilter);
  const debouncedServiceName = useDebouncedValue(serviceNameFilter);
  const debouncedCountry = useDebouncedValue(countryFilter);
  const debouncedCreatedBy = useDebouncedValue(createdByFilter);
  const debouncedStatus = useDebouncedValue(statusFilter);
  const list = useAdminList<VendorRow>("/api/admin/vendors", [{ id: "createdAt", desc: true }], {
    ...(selectedServiceIds.size > 0 ? { serviceIds: [...selectedServiceIds].join(",") } : {}),
    ...(selectedVendorTypeIds.size > 0
      ? { vendorTypeIds: [...selectedVendorTypeIds].join(",") }
      : {}),
    ...(debouncedName ? { name: debouncedName } : {}),
    ...(debouncedVendorType ? { vendorType: debouncedVendorType } : {}),
    ...(debouncedServiceName ? { serviceName: debouncedServiceName } : {}),
    ...(debouncedCountry ? { country: debouncedCountry } : {}),
    ...(debouncedCreatedBy ? { createdBy: debouncedCreatedBy } : {}),
    ...(debouncedStatus ? { status: debouncedStatus } : {}),
  });
  const [toDelete, setToDelete] = useState<VendorRow | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<"export" | "activate" | "deactivate" | null>(null);

  // Bulk actions on the ticked rows (2026-10-05). Export downloads a CSV
  // that opens straight in Excel; activate/deactivate update in one go.
  async function bulk(action: "export" | "activate" | "deactivate") {
    setBulkBusy(action);
    try {
      const res = await fetch("/api/admin/vendors/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json, text/csv" },
        body: JSON.stringify({ action, ids: [...selectedRows] }),
      });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { message?: string }).message ?? "Something went wrong.");
      if (action === "export") {
        const blob = await res.blob();
        const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "TYS_vendors.csv";
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${selectedRows.size} ${selectedRows.size === 1 ? "vendor" : "vendors"}.`);
      } else {
        const { updated } = (await res.json()) as { updated: number };
        toast.success(`${updated} ${updated === 1 ? "vendor" : "vendors"} marked ${action === "activate" ? "active" : "inactive"}.`);
        setSelectedRows(new Set());
        list.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBulkBusy(null);
    }
  }

  function columnFilter(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      list.setPage(1);
    };
  }

  const columnFilters: ColumnFilterConfig[] = [
    {
      id: "name",
      value: nameFilter,
      onChange: columnFilter(setNameFilter),
      placeholder: "Search name…",
    },
    {
      id: "vendorType",
      value: vendorTypeFilter,
      onChange: columnFilter(setVendorTypeFilter),
      placeholder: "Search type…",
    },
    {
      id: "services",
      value: serviceNameFilter,
      onChange: columnFilter(setServiceNameFilter),
      placeholder: "Search services…",
    },
    {
      id: "city",
      value: countryFilter,
      onChange: columnFilter(setCountryFilter),
      placeholder: "Search country…",
    },
    {
      id: "createdBy",
      value: createdByFilter,
      onChange: columnFilter(setCreatedByFilter),
      placeholder: "Search…",
    },
    {
      id: "status",
      value: statusFilter,
      onChange: columnFilter(setStatusFilter),
      placeholder: "active…",
    },
  ];

  useEffect(() => {
    adminApi<{ rows: Option[] }>("/api/admin/services?pageSize=100")
      .then((res) => setServiceOptions(res.rows))
      .catch(() => {
        /* filter just won't populate — list itself still works */
      });
    adminApi<{ rows: Option[] }>("/api/admin/vendor-types?pageSize=100")
      .then((res) => setVendorTypeOptions(res.rows))
      .catch(() => {
        /* filter just won't populate — list itself still works */
      });
  }, []);

  function toggleService(id: number, on: boolean) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    list.setPage(1);
  }

  function toggleAllServices(on: boolean) {
    setSelectedServiceIds(on ? new Set(serviceOptions.map((s) => s.id)) : new Set());
    list.setPage(1);
  }

  function toggleVendorType(id: number, on: boolean) {
    setSelectedVendorTypeIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    list.setPage(1);
  }

  function toggleAllVendorTypes(on: boolean) {
    setSelectedVendorTypeIds(on ? new Set(vendorTypeOptions.map((t) => t.id)) : new Set());
    list.setPage(1);
  }

  const pageIds = list.rows.map((r) => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedRows.has(id));

  const columns = useMemo<ColumnDef<VendorRow>[]>(
    () => [
      {
        id: "select",
        size: 40,
        header: () => (
          <Checkbox
            aria-label="Select all on this page"
            checked={allPageSelected}
            onCheckedChange={(on) =>
              setSelectedRows((prev) => {
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
            checked={selectedRows.has(row.original.id)}
            onCheckedChange={(on) =>
              setSelectedRows((prev) => {
                const next = new Set(prev);
                if (on === true) next.add(row.original.id);
                else next.delete(row.original.id);
                return next;
              })
            }
          />
        ),
      },
      {
        accessorKey: "name",
        size: 220,
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
        size: 140,
        header: "Type",
        cell: ({ row }) => row.original.vendorType.name,
      },
      {
        id: "services",
        size: 220,
        header: "Services",
        cell: ({ row }) => {
          const names = row.original.serviceNames ?? [];
          if (names.length === 0) return <span className="text-muted-foreground">N/A</span>;
          const extra = row.original.counts.services - names.length;
          return (
            <span>
              {names.join(", ")}
              {extra > 0 ? ` +${extra}` : ""}
            </span>
          );
        },
      },
      {
        accessorKey: "city",
        size: 160,
        header: sortableHeader("Location"),
        cell: ({ row }) => `${row.original.city}, ${row.original.country}`,
      },
      {
        id: "createdBy",
        size: 140,
        header: "Created By",
        cell: ({ row }) => row.original.createdByName ?? "—",
      },
      {
        accessorKey: "status",
        size: 110,
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        size: 90,
        header: () => <span className="sr-only">Actions</span>,
        // Edit is a direct icon (the thing every row exists to let staff
        // do) rather than buried behind the ⋯ menu; Delete stays there —
        // destructive, so it keeps the extra deliberate step.
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="size-8" asChild>
              <Link href={`/admin/vendors/${row.original.id}/edit`} aria-label="Edit vendor">
                <PencilSimpleIcon weight="bold" />
              </Link>
            </Button>
            <RowActions
              actions={[
                { label: "Delete", destructive: true, onSelect: () => setToDelete(row.original) },
              ]}
            />
          </div>
        ),
      },
    ],
    [allPageSelected, pageIds, selectedRows],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-tys-blue">
            <StorefrontIcon size={22} weight="bold" />
          </div>
          <h1 className="text-h2">Vendor list</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            className="border border-input bg-background text-foreground shadow-none hover:bg-muted"
          >
            <Link href="/admin/vendors/map">
              <MapPinIcon size={16} weight="bold" />
              Map view
            </Link>
          </Button>
          <CheckboxFilterDropdown
            label="Vendor Type"
            icon={TagIcon}
            options={vendorTypeOptions}
            selected={selectedVendorTypeIds}
            onToggle={toggleVendorType}
            onToggleAll={toggleAllVendorTypes}
            className="border border-input bg-background text-foreground shadow-none hover:bg-muted"
          />
          <CheckboxFilterDropdown
            label="Services"
            icon={ListChecksIcon}
            options={serviceOptions}
            selected={selectedServiceIds}
            onToggle={toggleService}
            onToggleAll={toggleAllServices}
            className="border border-input bg-background text-foreground shadow-none hover:bg-muted"
          />
          <Button asChild className="bg-tys-blue text-white hover:bg-tys-blue/90">
            <Link href="/admin/vendors/new">
              <PlusIcon size={16} weight="bold" />
              Add vendor
            </Link>
          </Button>
        </div>
      </div>
      {selectedRows.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-brand-softer px-3 py-2">
          <span className="text-sm font-semibold">
            {selectedRows.size} {selectedRows.size === 1 ? "vendor" : "vendors"} selected
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedRows(new Set())}>
            Clear
          </Button>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={bulkBusy !== null} onClick={() => bulk("export")}>
              <DownloadSimpleIcon size={14} /> {bulkBusy === "export" ? "Exporting…" : "Export to Excel"}
            </Button>
            <Button variant="outline" size="sm" disabled={bulkBusy !== null} onClick={() => bulk("activate")}>
              {bulkBusy === "activate" ? "Saving…" : "Mark active"}
            </Button>
            <Button variant="outline" size="sm" disabled={bulkBusy !== null} onClick={() => bulk("deactivate")}>
              {bulkBusy === "deactivate" ? "Saving…" : "Mark inactive"}
            </Button>
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={list.rows}
        columnFilters={columnFilters}
        emptyMessage="No vendors match the current filters."
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
