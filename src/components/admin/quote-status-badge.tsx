import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// QuoteStatus: pending | quoted | accepted | cancelled.
const META: Record<string, { label: string; dot: string; text?: string }> = {
  pending: { label: "Pending", dot: "bg-amber-500" },
  quoted: { label: "Quoted", dot: "bg-tys-navy" },
  accepted: { label: "Accepted", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", dot: "bg-muted-foreground/50", text: "text-muted-foreground" },
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
