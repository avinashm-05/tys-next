"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminApi, ApiError } from "@/lib/admin-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = ["pending", "quoted", "accepted", "cancelled"] as const;
const LABELS: Record<string, string> = {
  pending: "Pending",
  quoted: "Quoted",
  accepted: "Accepted",
  cancelled: "Cancelled",
};

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
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

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
      toast.success(`Status changed to ${LABELS[next] ?? next}.`);
      onChanged?.(next);
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
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
