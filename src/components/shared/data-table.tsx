"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderContext,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { CaretDownIcon, CaretUpDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// The one table every admin list uses (replaces yajra DataTables — R30).
// Client-side sorting/pagination by default; pass `server` (from
// useAdminList) for the server-paginated lists.
interface ServerMode {
  total: number;
  page: number; // 1-based
  pageSize: number;
  onPageChange: (page: number) => void;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  loading?: boolean;
}

/** One text filter box rendered under a specific column's header (by column id). */
export interface ColumnFilterConfig {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Empty states invite an action — pass e.g. "No vendors yet. Add your first vendor." */
  emptyMessage?: string;
  server?: ServerMode;
  /** Per-column search boxes under the header row (SETU reference) — opt-in per list. */
  columnFilters?: ColumnFilterConfig[];
  /** Makes each row open something (CRM-style lists): the whole row is the click target. */
  onRowClick?: (row: TData) => void;
}

/** Column header that toggles server/client sorting: `header: sortableHeader("Name")`. */
export function sortableHeader<TData, TValue>(label: string) {
  const Header = ({ column }: HeaderContext<TData, TValue>) => {
    const sorted = column.getIsSorted();
    return (
      <button
        type="button"
        className="flex items-center gap-1 font-medium hover:text-foreground"
        onClick={() => column.toggleSorting(sorted === "asc")}
      >
        {label}
        {sorted === "asc" ? (
          <CaretUpIcon className="size-3" />
        ) : sorted === "desc" ? (
          <CaretDownIcon className="size-3" />
        ) : (
          <CaretUpDownIcon className="size-3 opacity-50" />
        )}
      </button>
    );
  };
  return Header;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "Nothing here yet.",
  server,
  columnFilters,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [clientSorting, setClientSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting: server ? server.sorting : clientSorting },
    onSortingChange: server ? server.onSortingChange : setClientSorting,
    getCoreRowModel: getCoreRowModel(),
    ...(server
      ? {
          manualPagination: true,
          manualSorting: true,
          rowCount: server.total,
        }
      : {
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
        }),
  });

  const pageCount = server ? Math.max(1, Math.ceil(server.total / server.pageSize)) : 0;
  const from = server ? (server.total === 0 ? 0 : (server.page - 1) * server.pageSize + 1) : 0;
  const to = server ? Math.min(server.total, server.page * server.pageSize) : 0;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-tys-mist",
          server?.loading && "pointer-events-none opacity-60",
        )}
      >
        {/* table-fixed + an explicit width per column (ColumnDef.size) locks
            the grid to the header row's widths permanently — without this,
            the browser resizes every column to fit whatever's currently in
            the body, so a search/filter that changes row content (a longer
            name matches, a row disappears) visibly shifts the whole table
            sideways/around on every keystroke. Report: 2026-08-10. */}
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
            {columnFilters && (
              <TableRow className="hover:bg-transparent">
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const filter = columnFilters.find((f) => f.id === header.column.id);
                  return (
                    <TableHead
                      key={`filter-${header.id}`}
                      className="py-1.5"
                      style={{ width: header.getSize() }}
                    >
                      {filter && (
                        <Input
                          value={filter.value}
                          onChange={(e) => filter.onChange(e.target.value)}
                          placeholder={filter.placeholder ?? "Search…"}
                          className="h-8 text-xs"
                          aria-label={`Filter by ${header.column.id}`}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="overflow-hidden text-ellipsis"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {server?.loading ? "Loading…" : emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {server ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {server.total === 0 ? "0 results" : `Showing ${from}–${to} of ${server.total}`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => server.onPageChange(server.page - 1)}
              disabled={server.page <= 1 || server.loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => server.onPageChange(server.page + 1)}
              disabled={server.page >= pageCount || server.loading}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        table.getPageCount() > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        )
      )}
    </div>
  );
}
