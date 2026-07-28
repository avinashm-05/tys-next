"use client";

import { useState } from "react";
import { PaperPlaneTiltIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
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
import type { NoteRow, ShipmentDetail } from "./mock-data";

export function NotesSection({
  shipment,
  onChange,
}: {
  shipment: ShipmentDetail;
  onChange: (patch: Partial<ShipmentDetail>) => void;
}) {
  const [draft, setDraft] = useState("");

  function postDraft() {
    const comment = draft.trim();
    if (!comment) return;
    const note: NoteRow = { id: Date.now(), date: new Date().toISOString(), comment };
    onChange({ notes: [note, ...shipment.notes] });
    setDraft("");
  }

  function removeNote(id: number) {
    onChange({ notes: shipment.notes.filter((n) => n.id !== id) });
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
                />
              </TableCell>
              <TableCell className="text-right align-top">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={!draft.trim()}
                  onClick={postDraft}
                  aria-label="Post comment"
                >
                  <PlusIcon size={16} />
                </Button>
              </TableCell>
            </TableRow>
            {shipment.notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                  No comments yet.
                </TableCell>
              </TableRow>
            ) : (
              shipment.notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="align-top text-xs">
                    <LocalDateTime iso={note.date} />
                  </TableCell>
                  <TableCell className="align-top text-sm whitespace-pre-wrap">{note.comment}</TableCell>
                  <TableCell className="text-right align-top">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      title="Delete"
                      aria-label="Delete comment"
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
}
