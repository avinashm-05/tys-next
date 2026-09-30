"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "sonner";
import { EnvelopeSimpleIcon, PaperPlaneTiltIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { QUOTE_NOTES_REFRESH_EVENT } from "@/components/admin/quote-follow-up-button";
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

type NoteRow = { id: number; comment: string; createdAt: string | null; createdByName: string | null };

export type QuoteNotesSectionHandle = {
  /** Posts whatever's currently sitting in the draft box, if anything — so
   *  the page's main Save button can't silently drop an unposted comment. */
  flushDraft: () => Promise<void>;
};

// Backed by the real quote_notes table (POST/DELETE /api/admin/quotes/[id]/notes)
// — posting and deleting here actually persists, unlike the earlier
// local-state-only version. Each comment still posts the moment its own "+"
// is clicked (immediate, not tied to the page save) — flushDraft (above) is
// only a safety net for a draft the customer-support rep typed but never
// explicitly posted before hitting the page's Save/Save & Exit.
export const QuoteNotesSection = forwardRef<QuoteNotesSectionHandle, { quoteId: number }>(
  function QuoteNotesSection({ quoteId }, ref) {
    const [notes, setNotes] = useState<NoteRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState("");
    const [posting, setPosting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
      let cancelled = false;
      const load = () =>
        adminApi<NoteRow[]>(`/api/admin/quotes/${quoteId}/notes`)
          .then((rows) => {
            if (!cancelled) setNotes(rows);
          })
          .catch((e) => {
            if (!cancelled) toast.error(e instanceof ApiError ? e.message : "Couldn't load notes.");
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      load();
      // Email sends (quote, options, follow-up) log a note server-side;
      // reload so it shows up without a page refresh.
      window.addEventListener(QUOTE_NOTES_REFRESH_EVENT, load);
      return () => {
        cancelled = true;
        window.removeEventListener(QUOTE_NOTES_REFRESH_EVENT, load);
      };
    }, [quoteId]);

    async function postDraft() {
      const comment = draft.trim();
      if (!comment) return;
      setPosting(true);
      try {
        const note = await adminApi<NoteRow>(`/api/admin/quotes/${quoteId}/notes`, {
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

    useImperativeHandle(ref, () => ({ flushDraft: postDraft }));

  async function removeNote(id: number) {
    setDeletingId(id);
    try {
      await adminApi(`/api/admin/quotes/${quoteId}/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't delete the comment.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card size="sm" className="overflow-visible">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <PaperPlaneTiltIcon size={18} className="text-tys-blue" />
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
                    {note.comment.startsWith("Email sent:") ? (
                      <span className="flex items-start gap-2">
                        <EnvelopeSimpleIcon size={16} className="mt-0.5 shrink-0 text-tys-blue" />
                        <span>{note.comment}</span>
                      </span>
                    ) : (
                      note.comment
                    )}
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {note.createdByName ? `By ${note.createdByName}` : note.comment.startsWith("Email sent:") ? "Sent automatically" : null}
                    </span>
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
