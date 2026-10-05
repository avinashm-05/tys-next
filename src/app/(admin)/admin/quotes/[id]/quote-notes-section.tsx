"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "sonner";
import { ChatTextIcon, EnvelopeSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { QUOTE_NOTES_REFRESH_EVENT } from "@/components/admin/quote-follow-up-button";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // Notes as a simple feed (2026-10-05): write box on top, newest first,
  // emails sent show with an envelope.
  return (
    <Card size="sm" className="overflow-visible">
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-[15px] font-semibold">Notes</h2>
        <div className="flex flex-col gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && draft.trim()) void postDraft();
            }}
            placeholder="Add a note for the team, e.g. called, no answer; try again at 3 PM"
            rows={2}
            disabled={posting}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Only staff see notes. ⌘ + Enter to add.</span>
            <Button type="button" size="sm" disabled={!draft.trim() || posting} onClick={postDraft}>
              <PlusIcon size={14} /> {posting ? "Adding…" : "Add note"}
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading notes…</p>
        ) : notes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-xl border">
            {notes.map((note) => {
              const isEmail = note.comment.startsWith("Email sent:");
              return (
                <li key={note.id} className="group flex items-start gap-3 px-4 py-3">
                  <span
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
                      isEmail ? "bg-brand-soft text-tys-blue" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isEmail ? <EnvelopeSimpleIcon size={14} /> : <ChatTextIcon size={14} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm whitespace-pre-wrap">{isEmail ? note.comment.replace(/^Email sent:\s*/, "Email sent: ") : note.comment}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {note.createdByName ? note.createdByName : isEmail ? "Sent automatically" : "Staff"} ·{" "}
                      {note.createdAt ? <LocalDateTime iso={note.createdAt} /> : "—"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    title="Delete"
                    aria-label="Delete note"
                    className="opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                    disabled={deletingId === note.id}
                    onClick={() => removeNote(note.id)}
                  >
                    <TrashIcon size={15} />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
    );
  },
);
