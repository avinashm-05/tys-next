"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowBendUpRightIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";

/** Fired after any send so the Notes timeline (quote-notes-section) reloads its email log lines. */
export const QUOTE_NOTES_REFRESH_EVENT = "quote-notes:refresh";

// "Send follow-up" for a quote that was sent but not answered yet
// (2026-09-30). Manual on purpose: staff decide when to nudge.
export function QuoteFollowUpButton({ quoteId, sendTo }: { quoteId: number; sendTo: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function send() {
    try {
      const res = await adminApi<{ sentTo: string }>(`/api/admin/quotes/${quoteId}/follow-up`, { method: "POST" });
      toast.success(`Follow-up sent to ${res.sentTo}.`);
      window.dispatchEvent(new Event(QUOTE_NOTES_REFRESH_EVENT));
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't send the follow-up.");
      throw e; // keeps the dialog open with the message
    }
  }

  return (
    <>
      <Button variant="outline" disabled={!sendTo} onClick={() => setOpen(true)} title={sendTo ? undefined : "No contact email on this quote"}>
        <ArrowBendUpRightIcon size={16} weight="bold" />
        Send follow-up
      </Button>
      <ConfirmDeleteDialog
        open={open}
        onOpenChange={setOpen}
        title="Send follow-up"
        description={`Email a short check-in about this quote to ${sendTo ?? "the customer"} from sales@? It will be logged in the notes.`}
        confirmLabel="Send follow-up"
        confirmVariant="default"
        busyLabel="Sending…"
        errorFallback="The follow-up couldn't be sent. Try again."
        onConfirm={send}
      />
    </>
  );
}
