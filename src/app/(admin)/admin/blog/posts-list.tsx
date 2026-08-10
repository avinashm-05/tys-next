"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  CaretDownIcon,
  CheckIcon,
  NewspaperIcon,
  PencilSimpleIcon,
  PlusIcon,
  PulseIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/admin-api";
import { useAdminList } from "@/hooks/use-admin-list";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, sortableHeader, type ColumnFilterConfig } from "@/components/shared/data-table";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { PostStatusBadge, type PostStatus } from "./post-status-badge";

type PostRow = {
  id: number;
  slug: string;
  title: string;
  category: string;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string | null;
};

const STATUS_LABELS: Record<PostStatus, string> = { draft: "Draft", published: "Published" };
const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as PostStatus[];

// Same visual pattern as the Shipments/Quotes checkbox filters.
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

export function PostsList() {
  const [selectedStatuses, setSelectedStatuses] = useState<Set<PostStatus>>(new Set());
  const [titleFilter, setTitleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const debouncedTitle = useDebouncedValue(titleFilter);
  const debouncedCategory = useDebouncedValue(categoryFilter);
  const [toDelete, setToDelete] = useState<PostRow | null>(null);

  const list = useAdminList<PostRow>("/api/admin/blog/posts", [{ id: "createdAt", desc: true }], {
    ...(selectedStatuses.size > 0 ? { status: [...selectedStatuses].join(",") } : {}),
    ...(debouncedTitle ? { title: debouncedTitle } : {}),
    ...(debouncedCategory ? { category: debouncedCategory } : {}),
  });

  function toggleStatus(value: PostStatus, on: boolean) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (on) next.add(value);
      else next.delete(value);
      return next;
    });
    list.setPage(1);
  }

  function columnFilter(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      list.setPage(1);
    };
  }

  const columnFilters: ColumnFilterConfig[] = [
    { id: "title", value: titleFilter, onChange: columnFilter(setTitleFilter), placeholder: "Search title…" },
    {
      id: "category",
      value: categoryFilter,
      onChange: columnFilter(setCategoryFilter),
      placeholder: "Search category…",
    },
  ];

  const columns: ColumnDef<PostRow>[] = [
    {
      accessorKey: "title",
      size: 320,
      header: sortableHeader("Title"),
      cell: ({ row }) => (
        <div>
          <span className="block font-medium">{row.original.title}</span>
          <span className="block text-xs text-muted-foreground">/blog/{row.original.slug}</span>
        </div>
      ),
    },
    { id: "category", size: 160, header: "Category", cell: ({ row }) => row.original.category },
    {
      id: "status",
      size: 130,
      header: "Status",
      cell: ({ row }) => <PostStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "publishedAt",
      size: 190,
      header: sortableHeader("Published"),
      cell: ({ row }) =>
        row.original.publishedAt ? <LocalDateTime iso={row.original.publishedAt} /> : "—",
    },
    {
      accessorKey: "updatedAt",
      size: 190,
      header: sortableHeader("Updated"),
      cell: ({ row }) => <LocalDateTime iso={row.original.updatedAt} />,
    },
    {
      id: "actions",
      size: 90,
      header: () => <span className="sr-only">Actions</span>,
      // Same split as Vendors: Edit is a direct icon (the safe, primary
      // action); Delete stays behind the ⋯ menu since it's destructive.
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href={`/admin/blog/${row.original.id}/edit`} aria-label="Edit post">
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
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-tys-blue text-white">
            <NewspaperIcon size={22} weight="bold" />
          </div>
          <h1 className="text-h2">Blog</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-tys-indigo text-white uppercase hover:bg-tys-indigo/90">
                <PulseIcon size={16} weight="bold" />
                Status
                {selectedStatuses.size > 0 ? ` (${selectedStatuses.size})` : ""}
                <CaretDownIcon size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  const on = !(selectedStatuses.size === STATUS_OPTIONS.length);
                  setSelectedStatuses(on ? new Set(STATUS_OPTIONS) : new Set());
                  list.setPage(1);
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
          <Button asChild className="bg-tys-blue text-white uppercase hover:bg-tys-blue/90">
            <Link href="/admin/blog/new">
              <PlusIcon size={16} weight="bold" />
              New post
            </Link>
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={list.rows}
        emptyMessage="No posts match the current filters."
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
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete "${toDelete?.title ?? ""}"?`}
        description="This permanently deletes the post and its hero image. This can't be undone."
        confirmLabel="Delete post"
        onConfirm={async () => {
          await adminApi(`/api/admin/blog/posts/${toDelete!.id}`, { method: "DELETE" });
          toast.success("Post deleted.");
          list.refresh();
        }}
      />
    </div>
  );
}
