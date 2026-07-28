import type { ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Shared presentational pieces for FedEx rate results — used by the quote
// workstation's FedExRatesPanel (A4.3, with "Use this rate" actions and a
// checkbox column to pick a few to email as options) and the Price Check
// tool (A4.4, read-only). Extracted so the rate-row layout and the
// soft-failure state can't drift between the two.
//
// No Retail/Savings columns: they come from FedEx's LIST vs ACCOUNT rate
// types, which are identical on this sandbox account (no negotiated discount
// tier configured) — every row showed a bare "—", pure clutter. Worth
// re-adding once running against a production account with real negotiated
// rates, where LIST and ACCOUNT would actually differ.

export type Rate = {
  service_type: string;
  service_name: string;
  currency: string;
  total_charge: number;
  raw_total_charge: number;
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

/**
 * The rates table. `renderAction` optionally adds a trailing per-row cell.
 * `markupPercent`, when passed, adds a "Markup" column showing TYS's own
 * margin on each row (raw FedEx cost vs. the quoted price) — the percent is
 * one global setting so it's the same every row, but the dollar amount
 * varies per service, which is the useful part for support to see.
 */
export function FedExRatesTable({
  rates,
  markupPercent,
  renderAction,
  selection,
}: {
  rates: Rate[];
  markupPercent?: number;
  renderAction?: (rate: Rate) => ReactNode;
  /** Adds a leading checkbox column — e.g. "pick a few options to offer the
   * customer" rather than locking one rate outright. */
  selection?: { selected: Set<string>; onToggle: (serviceType: string, on: boolean) => void };
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {selection && <TableHead className="w-8" />}
            <TableHead>Service</TableHead>
            <TableHead>Estimated delivery</TableHead>
            <TableHead className="text-right">FedEx cost</TableHead>
            {markupPercent != null && (
              <TableHead className="text-right">Markup ({markupPercent}%)</TableHead>
            )}
            <TableHead className="text-right">Quoted (with markup)</TableHead>
            {renderAction && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rates.map((r) => (
            <TableRow key={r.service_type}>
              {selection && (
                <TableCell>
                  <Checkbox
                    checked={selection.selected.has(r.service_type)}
                    onCheckedChange={(v) => selection.onToggle(r.service_type, v === true)}
                    aria-label={`Offer ${r.service_name} to the customer`}
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">{r.service_name}</TableCell>
              <TableCell className="text-xs">{r.estimated_delivery || "N/A"}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {money(r.raw_total_charge, r.currency)}
              </TableCell>
              {markupPercent != null && (
                <TableCell className="text-right text-tys-teal">
                  +{money(r.total_charge - r.raw_total_charge, r.currency)}
                </TableCell>
              )}
              <TableCell className="text-right font-medium">
                {money(r.total_charge, r.currency)}
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
