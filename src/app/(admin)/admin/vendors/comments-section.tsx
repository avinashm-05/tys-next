"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";
import { formatDateTime } from "@/lib/format";
import { useAdminList } from "@/hooks/use-admin-list";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, sortableHeader } from "@/components/shared/data-table";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { RowActions } from "@/components/admin/row-actions";
import { CommentDialog } from "./comment-dialog";

export type CommentRow = {
  id: number;
  title: string;
  content: string;
  category: "general" | "performance" | "issues" | "compliance" | "communication";
  priority: "low" | "normal" | "high" | "critical";
  createdAt: string | null;
  createdBy: { id: number; name: string } | null;
};

export const CATEGORY_LABELS: Record<CommentRow["category"], string> = {
  general: "General",
  performance: "Performance",
  issues: "Issues",
  compliance: "Compliance",
  communication: "Communication",
};

export const PRIORITY_LABELS: Record<CommentRow["priority"], string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  critical: "Critical",
};

export function CommentsSection({ vendorId }: { vendorId: number }) {
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const list = useAdminList<CommentRow>(
    `/api/admin/vendors/${vendorId}/comments`,
    [{ id: "createdAt", desc: true }],
    {
      ...(category !== "all" ? { category } : {}),
      ...(priority !== "all" ? { priority } : {}),
    },
  );
  const [dialog, setDialog] = useState<CommentRow | "new" | null>(null);
  const [toDelete, setToDelete] = useState<CommentRow | null>(null);

  const exportParams = new URLSearchParams({
    ...(category !== "all" ? { category } : {}),
    ...(priority !== "all" ? { priority } : {}),
  }).toString();
  const exportHref = `/api/admin/vendors/${vendorId}/comments/export${exportParams ? `?${exportParams}` : ""}`;

  const columns = useMemo<ColumnDef<CommentRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: sortableHeader("Title"),
        cell: ({ row }) => (
          <div className="max-w-80">
            <span className="block font-medium">{row.original.title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {row.original.content}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {CATEGORY_LABELS[row.original.category]}
          </Badge>
        ),
      },
      {
        accessorKey: "priority",
        header: sortableHeader("Priority"),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "font-normal",
              row.original.priority === "critical" && "border-destructive/40 text-destructive",
            )}
          >
            {PRIORITY_LABELS[row.original.priority]}
          </Badge>
        ),
      },
      {
        id: "author",
        header: "Author",
        cell: ({ row }) => row.original.createdBy?.name ?? "—",
      },
      {
        accessorKey: "createdAt",
        header: sortableHeader("Created"),
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
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
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
        <CardDescription>Internal notes about this vendor.</CardDescription>
        <CardAction className="flex gap-2">
          <Button asChild variant="outline">
            {/* Direct download — the session cookie rides along. */}
            <a href={exportHref}>Export CSV</a>
          </Button>
          <Button variant="outline" onClick={() => setDialog("new")}>
            Add comment
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search comments…"
            className="max-w-xs"
            aria-label="Search comments"
          />
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              list.setPage(1);
            }}
          >
            <SelectTrigger className="w-44" aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(v) => {
              setPriority(v);
              list.setPage(1);
            }}
          >
            <SelectTrigger className="w-40" aria-label="Filter by priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {Object.entries(PRIORITY_LABELS).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DataTable
          columns={columns}
          data={list.rows}
          emptyMessage={
            list.search || category !== "all" || priority !== "all"
              ? "No comments match the current filters."
              : "No comments yet. Add your first comment."
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
        <CommentDialog
          vendorId={vendorId}
          comment={dialog === "new" ? undefined : dialog}
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
        title="Delete comment"
        description={`Delete the comment "${toDelete?.title}"? This can't be undone.`}
        confirmLabel="Delete comment"
        onConfirm={async () => {
          await adminApi(`/api/admin/vendors/${vendorId}/comments/${toDelete!.id}`, {
            method: "DELETE",
          });
          toast.success("Comment deleted.");
          list.refresh();
        }}
      />
    </Card>
  );
}
