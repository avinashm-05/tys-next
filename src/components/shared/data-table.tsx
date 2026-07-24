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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Empty states invite an action — pass e.g. "No vendors yet. Add your first vendor." */
  emptyMessage?: string;
  server?: ServerMode;
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
        className={cn("rounded-md border", server?.loading && "pointer-events-none opacity-60")}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
