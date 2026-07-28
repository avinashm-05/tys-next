import { Badge } from "@/components/ui/badge";
import { QUOTE_STATUS_LABELS } from "@/lib/quote-status";
import { cn } from "@/lib/utils";

// QuoteStatus: pending | quoted | accepted | cancelled.
const META: Record<string, { label: string; dot: string; text?: string }> = {
  pending: { label: QUOTE_STATUS_LABELS.pending, dot: "bg-amber-500" },
  quoted: { label: QUOTE_STATUS_LABELS.quoted, dot: "bg-tys-navy" },
  accepted: { label: QUOTE_STATUS_LABELS.accepted, dot: "bg-emerald-500" },
  cancelled: {
    label: QUOTE_STATUS_LABELS.cancelled,
    dot: "bg-muted-foreground/50",
    text: "text-muted-foreground",
  },
};

export function QuoteStatusBadge({ status }: { status: string }) {
  const m = META[status] ?? { label: status, dot: "bg-muted-foreground/50" };
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal", m.text)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", m.dot)} />
      {m.label}
    </Badge>
  );
}
