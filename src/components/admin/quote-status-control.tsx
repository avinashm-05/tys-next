"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminApi, ApiError } from "@/lib/admin-api";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_VALUES } from "@/lib/quote-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Inline status changer — reused by the list rows and the detail page. */
export function QuoteStatusControl({
  quoteId,
  status,
  onChanged,
  className,
}: {
  quoteId: number;
  status: string;
  onChanged?: (status: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  // `useState(status)` only seeds from the prop on mount — a status change
  // from anywhere else (the Next Step banner's Accept/Decline, the new
  // send-options email, another tab) re-renders this component with a new
  // `status` prop but never touches `value` on its own, leaving this select
  // showing a stale status. Resync during render (React's documented
  // "adjust state during render" pattern) rather than in a useEffect, which
  // would let one stale-render frame slip through before the effect ran.
  const [prevStatus, setPrevStatus] = useState(status);
  if (status !== prevStatus) {
    setPrevStatus(status);
    setValue(status);
  }

  async function change(next: string) {
    if (next === value) return;
    const prev = value;
    setValue(next); // optimistic
    setBusy(true);
    try {
      await adminApi(`/api/admin/quotes/${quoteId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      toast.success(`Status changed to ${QUOTE_STATUS_LABELS[next] ?? next}.`);
      onChanged?.(next);
      // The detail page's Next Step banner is server-rendered off this same
      // status — without a refresh it'd keep showing the old step after a
      // change made right here in the header.
      router.refresh();
    } catch (e) {
      setValue(prev); // revert on failure
      toast.error(e instanceof ApiError ? e.message : "Couldn't update the status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Select value={value} onValueChange={change} disabled={busy}>
      <SelectTrigger className={className} aria-label="Change status" onClick={(e) => e.stopPropagation()}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {QUOTE_STATUS_VALUES.map((s) => (
          <SelectItem key={s} value={s}>
            {QUOTE_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
