"use client";

import { useState } from "react";
import { toast } from "sonner";
import { InfoIcon, PaperPlaneTiltIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { useAdminList } from "@/hooks/use-admin-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { SectionIconBadge } from "@/components/admin/section-icon-badge";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
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

// SETU reference: just Date + a text box + "+" to post (timestamp automatic,
// anyone can type and post). We keep the richer title/category/priority
// model underneath — the info icon opens the full edit dialog for it, the
// trash icon deletes — neither shown in the reference but needed so this
// tab doesn't lose capability the old layout had.
export function CommentsSection({ vendorId }: { vendorId: number }) {
  const list = useAdminList<CommentRow>(`/api/admin/vendors/${vendorId}/comments`, [
    { id: "createdAt", desc: true },
  ]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState<CommentRow | null>(null);
  const [toDelete, setToDelete] = useState<CommentRow | null>(null);

  function deriveTitle(content: string): string {
    const trimmed = content.trim().replace(/\s+/g, " ");
    return trimmed.length <= 60 ? trimmed : `${trimmed.slice(0, 57)}…`;
  }

  async function postDraft() {
    const content = draft.trim();
    if (!content) return;
    setPosting(true);
    try {
      await adminApi(`/api/admin/vendors/${vendorId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          title: deriveTitle(content),
          content,
          category: "general",
          priority: "normal",
        }),
      });
      setDraft("");
      list.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't post the comment. Try again.");
    } finally {
      setPosting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));

  return (
    <Card className="overflow-visible">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <SectionIconBadge icon={PaperPlaneTiltIcon} />
          <h2 className="font-heading text-lg font-semibold">Comments</h2>
        </div>
      </CardContent>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-800 hover:bg-slate-800">
              <TableHead className="w-40 text-white">Date</TableHead>
              <TableHead className="text-white">Comments</TableHead>
              <TableHead className="w-24 text-right text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="align-top text-xs text-muted-foreground">
                <LocalDateTime iso={new Date()} />
              </TableCell>
              <TableCell>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a comment…"
                  rows={2}
                  disabled={posting}
                />
              </TableCell>
              <TableCell className="text-right align-top">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={posting || !draft.trim()}
                  onClick={postDraft}
                  aria-label="Post comment"
                >
                  <PlusIcon size={16} />
                </Button>
              </TableCell>
            </TableRow>
            {list.rows.length === 0 && !list.loading ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                  No comments yet.
                </TableCell>
              </TableRow>
            ) : (
              list.rows.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="align-top text-xs">
                    <LocalDateTime iso={comment.createdAt} />
                  </TableCell>
                  <TableCell className="align-top text-sm whitespace-pre-wrap">
                    {comment.content}
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="Details"
                        aria-label="Comment details"
                        onClick={() => setEditing(comment)}
                      >
                        <InfoIcon size={16} />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="Delete"
                        aria-label="Delete comment"
                        onClick={() => setToDelete(comment)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 border-t border-tys-mist px-4 py-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              disabled={list.page <= 1}
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <span className="text-muted-foreground">
              Page {list.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={list.page >= totalPages}
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
      {editing !== null && (
        <CommentDialog
          vendorId={vendorId}
          comment={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            list.refresh();
          }}
        />
      )}
      <ConfirmDeleteDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete comment"
        description={`Delete this comment? This can't be undone.`}
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
