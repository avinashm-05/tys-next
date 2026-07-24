import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// "deactive" is Services' real status value (sic — live data depends on it);
// vendor types / vendors use "inactive". Display capitalizes, value is shown
// as stored — never normalized.
const LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  deactive: "Deactive",
};

export function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground/50")}
      />
      {LABELS[status] ?? status}
    </Badge>
  );
}
