"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AirplaneTiltIcon,
  BoatIcon,
  CaretDownIcon,
  CheckIcon,
  PlusIcon,
  PulseIcon,
  ShippingContainerIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAdminList } from "@/hooks/use-admin-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShipmentStatus, ShipmentType } from "@prisma/client";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { RowActions } from "@/components/admin/row-actions";
import { SHIPMENT_STATUS_LABELS } from "./types";
import { ShipmentStatusBadge } from "./shipment-status-badge";

// Real row shape from GET /api/admin/shipments.
type ShipmentListRow = {
  id: number;
  date: string | null;
  trackingNumber: string | null;
  senderName: string;
  senderCity: string;
  senderState: string;
  senderCountry: string;
  receiverName: string;
  receiverCity: string;
  receiverState: string;
  receiverCountry: string;
  shipmentType: ShipmentType;
  status: ShipmentStatus;
};

// Same visual checkbox-multiselect pattern as the Vendor list filters
// (src/app/(admin)/admin/vendors/vendors-list.tsx) — kept local rather than
// shared since the option shape differs (string values here, id-based there).
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

function CheckboxFilterDropdown<T extends string>({
  label,
  icon: Icon,
  options,
  labels,
  selected,
  onToggle,
  onToggleAll,
  className,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: "bold" }>;
  options: T[];
  labels: Record<T, string>;
  selected: Set<T>;
  onToggle: (value: T, on: boolean) => void;
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
      <DropdownMenuContent align="end" className="max-h-80 w-56 overflow-y-auto">
        <DropdownMenuLabel>Filter by {label.toLowerCase()}</DropdownMenuLabel>
        <DropdownMenuSeparator />
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
            key={o}
            onSelect={(e) => {
              e.preventDefault();
              onToggle(o, !selected.has(o));
            }}
            className="gap-2.5"
          >
            <FilterCheckMark checked={selected.has(o)} />
            <span className="whitespace-nowrap">{labels[o]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// "ground" has no icon of its own in this list yet — reuses the truck glyph
// already used for the account-portal Shipments empty state.
const TYPE_LABELS: Record<ShipmentType, string> = { air: "Air", ground: "Ground", ocean: "Ocean" };
const TYPE_OPTIONS = Object.keys(TYPE_LABELS) as ShipmentType[];
const STATUS_OPTIONS = Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[];

function TypeIcon({ type }: { type: ShipmentType }) {
  if (type === "air") return <AirplaneTiltIcon size={14} weight="bold" className="text-tys-blue" />;
  if (type === "ocean") return <BoatIcon size={14} weight="bold" className="text-tys-teal" />;
  return <TruckIcon size={14} weight="bold" className="text-tys-indigo" />;
}

export function ShipmentsList() {
  const router = useRouter();
  const [selectedStatuses, setSelectedStatuses] = useState<Set<ShipmentStatus>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<ShipmentType>>(new Set());

  const list = useAdminList<ShipmentListRow>("/api/admin/shipments", [{ id: "createdAt", desc: true }], {
    ...(selectedStatuses.size > 0 ? { status: [...selectedStatuses].join(",") } : {}),
    ...(selectedTypes.size > 0 ? { type: [...selectedTypes].join(",") } : {}),
  });

  function toggleSet<T>(setter: (v: Set<T>) => void, current: Set<T>, value: T, on: boolean) {
    const next = new Set(current);
    if (on) next.add(value);
    else next.delete(value);
    setter(next);
    list.setPage(1);
  }

  const columns: ColumnDef<ShipmentListRow>[] = [
    {
      accessorKey: "date",
      header: sortableHeader("Date"),
      cell: ({ row }) => <LocalDateTime iso={row.original.date} />,
    },
    {
      accessorKey: "trackingNumber",
      header: sortableHeader("Tracking"),
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.trackingNumber ?? "—"}</span>,
    },
    {
      id: "sender",
      header: "Sender",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className="block font-medium">{row.original.senderName || "—"}</span>
          <span className="text-muted-foreground">
            {row.original.senderState}, {row.original.senderCountry}
          </span>
        </div>
      ),
    },
    {
      id: "receiver",
      header: "Receiver",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className="block font-medium">{row.original.receiverName || "—"}</span>
          <span className="text-muted-foreground">
            {row.original.receiverState}, {row.original.receiverCountry}
          </span>
        </div>
      ),
    },
    {
      id: "shipmentType",
      header: "Type",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <TypeIcon type={row.original.shipmentType} />
          {TYPE_LABELS[row.original.shipmentType]}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <ShipmentStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <RowActions
            actions={[
              { label: "Edit", onSelect: () => router.push(`/admin/shipments/${row.original.id}/edit`) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-tys-blue text-white">
            <ShippingContainerIcon size={22} weight="bold" />
          </div>
          <h1 className="text-h2">Shipments</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search tracking / sender / receiver…"
            className="max-w-xs"
            aria-label="Search shipments"
          />
          <CheckboxFilterDropdown
            label="Status"
            icon={PulseIcon}
            options={STATUS_OPTIONS}
            labels={SHIPMENT_STATUS_LABELS}
            selected={selectedStatuses}
            onToggle={(v, on) => toggleSet(setSelectedStatuses, selectedStatuses, v, on)}
            onToggleAll={(on) => {
              setSelectedStatuses(on ? new Set(STATUS_OPTIONS) : new Set());
              list.setPage(1);
            }}
            className="bg-tys-indigo text-white uppercase hover:bg-tys-indigo/90"
          />
          <CheckboxFilterDropdown
            label="Type"
            icon={AirplaneTiltIcon}
            options={TYPE_OPTIONS}
            labels={TYPE_LABELS}
            selected={selectedTypes}
            onToggle={(v, on) => toggleSet(setSelectedTypes, selectedTypes, v, on)}
            onToggleAll={(on) => {
              setSelectedTypes(on ? new Set(TYPE_OPTIONS) : new Set());
              list.setPage(1);
            }}
            className="bg-tys-teal text-white uppercase hover:bg-tys-teal/90"
          />
          <Button asChild className="bg-tys-rose text-white uppercase hover:bg-tys-rose/90">
            <Link href="/admin/shipments/new">
              <PlusIcon size={16} weight="bold" />
              New shipment
            </Link>
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage="No shipments match the current filters."
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
