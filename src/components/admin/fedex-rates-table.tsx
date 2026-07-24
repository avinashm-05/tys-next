import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Shared presentational pieces for FedEx rate results — used by the quote
// workstation's FedExRatesPanel (A4.3, with "Use this rate" actions) and the
// Price Check tool (A4.4, read-only). Extracted so the rate-row layout
// (marked-up quoted, struck retail, savings %) and the soft-failure state
// can't drift between the two.

export type Rate = {
  service_type: string;
  service_name: string;
  currency: string;
  total_charge: number;
  retail_charge: number | null;
  per_lb_rate: number | null;
  save_percent: number | null;
  estimated_delivery: string;
};

export const PACKAGING_TYPES = [
  ["YOUR_PACKAGING", "Your Packaging"],
  ["FEDEX_BOX", "FedEx Box"],
  ["FEDEX_ENVELOPE", "FedEx Envelope"],
  ["FEDEX_PAK", "FedEx Pak"],
  ["FEDEX_TUBE", "FedEx Tube"],
] as const;

export const PICKUP_TYPES = [
  ["DROPOFF_AT_FEDEX_LOCATION", "Dropoff at Location"],
  ["USE_SCHEDULED_PICKUP", "Use Scheduled Pickup"],
  ["CONTACT_FEDEX_TO_SCHEDULE", "Contact FedEx to Schedule"],
] as const;

export const money = (n: number, c: string) => `${n.toFixed(2)} ${c}`;

/** The rates table. `renderAction` adds a trailing per-row cell (e.g. "Use this rate"). */
export function FedExRatesTable({
  rates,
  renderAction,
}: {
  rates: Rate[];
  renderAction?: (rate: Rate) => ReactNode;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Est. delivery</TableHead>
            <TableHead className="text-right">Quoted (w/ markup)</TableHead>
            <TableHead className="text-right">Retail</TableHead>
            <TableHead>Savings</TableHead>
            {renderAction && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((r) => (
            <TableRow key={r.service_type}>
              <TableCell className="font-medium">{r.service_name}</TableCell>
              <TableCell className="text-xs">{r.estimated_delivery || "N/A"}</TableCell>
              <TableCell className="text-right font-medium">
                {money(r.total_charge, r.currency)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {r.retail_charge != null && r.retail_charge > r.total_charge ? (
                  <span className="line-through">{money(r.retail_charge, r.currency)}</span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {r.save_percent ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                  >
                    {r.save_percent}% off
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              {renderAction && <TableCell className="text-right">{renderAction(r)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * The soft-failure state (international customs / auto-rating failed). The
 * quote panel passes its manual-entry form as children; Price Check renders
 * the note alone — never a fabricated rate.
 */
export function FedExRateUnavailable({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-4">
      <p className="text-sm">
        <span className="font-medium">Automated rate unavailable.</span> {message}
        {children ? " Enter the rate manually below." : ""}
      </p>
      {children}
    </div>
  );
}
