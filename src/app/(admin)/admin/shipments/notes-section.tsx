"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "sonner";
import { PaperPlaneTiltIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { LocalDateTime } from "@/components/shared/local-date-time";
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
import type { NoteRow } from "./types";

export type NotesSectionHandle = {
  /** Posts whatever's currently sitting in the draft box, if anything — so
   *  the page's main Save button can't silently drop an unposted comment. */
  flushDraft: () => Promise<void>;
  /** Re-fetch, e.g. after a save logged a status-email note server-side. */
  reload: () => void;
};

// Backed by the real shipment_notes table (POST/DELETE
// /api/admin/shipments/[id]/notes) — same pattern as the Quote admin
// editor's QuoteNotesSection. Each comment posts the moment its own "+" is
// clicked (immediate, not tied to the page's Save button) — flushDraft is
// only a safety net for a draft typed but never explicitly posted.
export const NotesSection = forwardRef<NotesSectionHandle, { shipmentId: number }>(
  function NotesSection({ shipmentId }, ref) {
    const [notes, setNotes] = useState<NoteRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState("");
    const [posting, setPosting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
      let cancelled = false;
      adminApi<NoteRow[]>(`/api/admin/shipments/${shipmentId}/notes`)
        .then((rows) => {
          if (!cancelled) setNotes(rows);
        })
        .catch((e) => {
          if (!cancelled) toast.error(e instanceof ApiError ? e.message : "Couldn't load notes.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [shipmentId, reloadKey]);

    async function postDraft() {
      const comment = draft.trim();
      if (!comment) return;
      setPosting(true);
      try {
        const note = await adminApi<NoteRow>(`/api/admin/shipments/${shipmentId}/notes`, {
          method: "POST",
          body: JSON.stringify({ comment }),
        });
        setNotes((prev) => [note, ...prev]);
        setDraft("");
      } catch (e) {
        toast.error(e instanceof ApiError ? e.message : "Couldn't post the comment.");
      } finally {
        setPosting(false);
      }
    }

    useImperativeHandle(ref, () => ({ flushDraft: postDraft, reload: () => setReloadKey((k) => k + 1) }));

    async function removeNote(id: number) {
      setDeletingId(id);
      try {
        await adminApi(`/api/admin/shipments/${shipmentId}/notes/${id}`, { method: "DELETE" });
        setNotes((prev) => prev.filter((n) => n.id !== id));
      } catch (e) {
        toast.error(e instanceof ApiError ? e.message : "Couldn't delete the comment.");
      } finally {
        setDeletingId(null);
      }
    }

    return (
      <Card className="overflow-visible">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <SectionIconBadge icon={PaperPlaneTiltIcon} />
            <h2 className="font-heading text-lg font-semibold">Notes</h2>
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
                    disabled={!draft.trim() || posting}
                    onClick={postDraft}
                    aria-label="Post comment"
                  >
                    <PlusIcon size={16} />
                  </Button>
                </TableCell>
              </TableRow>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    Loading notes…
                  </TableCell>
                </TableRow>
              ) : notes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    No comments yet.
                  </TableCell>
                </TableRow>
              ) : (
                notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="align-top text-xs">
                      {note.createdAt ? <LocalDateTime iso={note.createdAt} /> : "—"}
                    </TableCell>
                    <TableCell className="align-top text-sm whitespace-pre-wrap">
                      {note.comment}
                      {note.createdByName && (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          — {note.createdByName}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        title="Delete"
                        aria-label="Delete comment"
                        disabled={deletingId === note.id}
                        onClick={() => removeNote(note.id)}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  },
);
