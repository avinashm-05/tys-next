"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  CircleIcon,
  MagnifyingGlassIcon,
  MapPinLineIcon,
  PackageIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LocalDateTime } from "@/components/shared/local-date-time";

type ScanEvent = { dateTime: string | null; description: string; location: string | null };
type ParsedTracking = {
  trackingNumber: string;
  statusDescription: string;
  statusCode: string | null;
  serviceDescription: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  shipDate: string | null;
  events: ScanEvent[];
};
type TrackResult = { success: true; tracking: ParsedTracking } | { success: false; message: string };
type BulkTrackResult = { trackingNumber: string } & (
  | { success: true; tracking: ParsedTracking }
  | { success: false; message: string }
);

// DL/OD/... are FedEx's own status codes — a small known set is worth
// color-coding; anything else just falls back to a neutral badge rather
// than guessing.
const STATUS_TONE: Record<string, string> = {
  DL: "bg-emerald-500/10 text-emerald-700",
  IT: "bg-tys-blue/10 text-tys-blue",
  OD: "bg-tys-blue/10 text-tys-blue",
  PU: "bg-tys-indigo/10 text-tys-indigo",
  DE: "bg-amber-500/10 text-amber-700",
  CA: "bg-muted-foreground/10 text-muted-foreground",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

const BULK_LIMIT = 30;

function splitTrackingNumbers(raw: string): string[] {
  return [...new Set(raw.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean))];
}

// One box for one or many numbers (2026-10-05): one number shows the full
// journey; several show a status table, and clicking a row opens that one.
export function TrackingTool() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkTrackResult[] | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const numbers = splitTrackingNumbers(query);

  async function trackOne(n: string) {
    setLoading(true);
    setResult(null);
    try {
      const res = await adminApi<TrackResult>("/api/admin/tracking", {
        method: "POST",
        body: JSON.stringify({ trackingNumber: n }),
      });
      setResult(res);
    } catch (e) {
      setResult({ success: false, message: e instanceof ApiError ? e.message : "Couldn't reach FedEx. Try again." });
    } finally {
      setLoading(false);
    }
  }

  async function run() {
    if (numbers.length === 0) return;
    setResult(null);
    setBulkResults(null);
    setBulkError(null);
    if (numbers.length === 1) return trackOne(numbers[0]);
    setLoading(true);
    try {
      const res = await adminApi<{ results: BulkTrackResult[] }>("/api/admin/tracking/bulk", {
        method: "POST",
        body: JSON.stringify({ trackingNumbers: numbers.slice(0, BULK_LIMIT) }),
      });
      setBulkResults(res.results);
    } catch (e) {
      setBulkError(e instanceof ApiError ? e.message : "Couldn't reach FedEx. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h2">Tracking</h1>
        <p className="text-sm text-muted-foreground">Look up any FedEx tracking number, or paste up to {BULK_LIMIT} at once.</p>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void run();
              }
            }}
            placeholder="Tracking number, or several separated by commas or new lines"
            rows={numbers.length > 1 || query.includes("\n") ? 3 : 1}
            className="min-h-10 flex-1 resize-none py-2.5"
            aria-label="Tracking numbers"
          />
          <Button onClick={run} disabled={loading || numbers.length === 0} className="sm:self-start">
            <MagnifyingGlassIcon size={16} weight="bold" />
            {loading ? "Tracking…" : numbers.length > 1 ? `Track ${Math.min(numbers.length, BULK_LIMIT)}` : "Track"}
          </Button>
        </div>
        {numbers.length > BULK_LIMIT && (
          <p className="text-xs text-muted-foreground">{numbers.length} entered, only the first {BULK_LIMIT} will be checked.</p>
        )}
      </div>

      {bulkError && <p className="text-sm text-destructive">{bulkError}</p>}
      {result && !result.success && <p className="text-sm text-destructive">{result.message}</p>}

      {result?.success && (
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`flex size-10 items-center justify-center rounded-full ${STATUS_TONE[result.tracking.statusCode ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                <TruckIcon size={20} weight="bold" />
              </span>
              <div>
                <p className="font-semibold">{result.tracking.statusDescription}</p>
                <p className="text-xs text-muted-foreground">{result.tracking.trackingNumber}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Row label="Service" value={result.tracking.serviceDescription} />
              <Row label="Ship date" value={result.tracking.shipDate && <LocalDateTime iso={result.tracking.shipDate} />} />
              <Row
                label={result.tracking.actualDelivery ? "Delivered" : "Estimated delivery"}
                value={
                  (result.tracking.actualDelivery ?? result.tracking.estimatedDelivery) && (
                    <LocalDateTime iso={result.tracking.actualDelivery ?? result.tracking.estimatedDelivery} />
                  )
                }
              />
            </div>
          </div>

          {result.tracking.events.length > 0 && (
            <div className="flex flex-col gap-1 border-t pt-4">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <PackageIcon size={16} />
                Journey
              </p>
              <ol className="flex flex-col">
                {result.tracking.events.map((e, i) => (
                  <li key={i} className="flex gap-3 border-l-2 border-border py-2 pl-4 last:border-transparent">
                    <span className="-ml-[21px] flex size-4 items-center justify-center rounded-full bg-card">
                      {i === 0 ? (
                        <CheckCircleIcon size={16} weight="fill" className="text-tys-blue" />
                      ) : (
                        <CircleIcon size={10} weight="fill" className="text-muted-foreground" />
                      )}
                    </span>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{e.description}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {e.location && (
                          <>
                            <MapPinLineIcon size={11} /> {e.location} ·
                          </>
                        )}
                        {e.dateTime ? <LocalDateTime iso={e.dateTime} /> : "—"}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {bulkResults && (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Ship date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bulkResults.map((r) => (
                <TableRow
                  key={r.trackingNumber}
                  className={r.success ? "cursor-pointer" : undefined}
                  onClick={r.success ? () => void trackOne(r.trackingNumber) : undefined}
                  title={r.success ? "Show the full journey" : undefined}
                >
                  <TableCell className="font-medium">{r.trackingNumber}</TableCell>
                  <TableCell>
                    {r.success ? (
                      <span className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${STATUS_TONE[r.tracking.statusCode ?? ""]?.split(" ")[0] ?? "bg-muted-foreground/40"}`} />
                        {r.tracking.statusDescription}
                      </span>
                    ) : (
                      <span className="text-destructive">{r.message}</span>
                    )}
                  </TableCell>
                  <TableCell>{r.success ? (r.tracking.serviceDescription ?? "—") : "—"}</TableCell>
                  <TableCell>{r.success && r.tracking.shipDate ? <LocalDateTime iso={r.tracking.shipDate} /> : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
