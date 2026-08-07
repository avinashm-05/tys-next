import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SHIPMENT_STATUS_LABELS, SHIPMENT_STATUS_TONE, type ShipmentStatus } from "./types";

const DOT_TONE: Record<string, string> = {
  neutral: "bg-muted-foreground/50",
  info: "bg-tys-blue",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-tys-rose",
};

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  const tone = SHIPMENT_STATUS_TONE[status];
  return (
    <Badge variant="outline" className="gap-1.5 font-normal whitespace-nowrap">
      <span aria-hidden className={cn("size-1.5 rounded-full", DOT_TONE[tone])} />
      {SHIPMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
