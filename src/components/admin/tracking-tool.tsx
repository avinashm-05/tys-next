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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TrackingTool() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  const [bulkText, setBulkText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkTrackResult[] | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  async function track() {
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await adminApi<TrackResult>("/api/admin/tracking", {
        method: "POST",
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      });
      setResult(res);
    } catch (e) {
      setResult({
        success: false,
        message: e instanceof ApiError ? e.message : "Couldn't reach FedEx. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const bulkNumbers = splitTrackingNumbers(bulkText);

  async function trackBulk() {
    if (bulkNumbers.length === 0) return;
    setBulkLoading(true);
    setBulkResults(null);
    setBulkError(null);
    try {
      const res = await adminApi<{ results: BulkTrackResult[] }>("/api/admin/tracking/bulk", {
        method: "POST",
        body: JSON.stringify({ trackingNumbers: bulkNumbers.slice(0, BULK_LIMIT) }),
      });
      setBulkResults(res.results);
    } catch (e) {
      setBulkError(e instanceof ApiError ? e.message : "Couldn't reach FedEx. Try again.");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
    <Card size="sm">
      <CardHeader>
        <CardTitle>FedEx tracking</CardTitle>
        <CardDescription>
          Look up any FedEx tracking number directly — works today, independent of Book Shipment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && track()}
            placeholder="Tracking number…"
            className="max-w-xs"
            aria-label="Tracking number"
          />
          <Button
            onClick={track}
            disabled={loading || !trackingNumber.trim()}
            className="bg-tys-blue text-white hover:bg-tys-blue/90"
          >
            <MagnifyingGlassIcon size={16} weight="bold" />
            {loading ? "Tracking…" : "Track"}
          </Button>
        </div>

        {result && !result.success && (
          <p className="text-sm text-destructive">{result.message}</p>
        )}

        {result?.success && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-tys-mist p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-10 items-center justify-center rounded-full ${STATUS_TONE[result.tracking.statusCode ?? ""] ?? "bg-muted text-muted-foreground"}`}
                >
                  <TruckIcon size={20} weight="bold" />
                </span>
                <div>
                  <p className="font-semibold">{result.tracking.statusDescription}</p>
                  <p className="text-xs text-muted-foreground">{result.tracking.trackingNumber}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Row label="Service" value={result.tracking.serviceDescription} />
                <Row
                  label="Ship date"
                  value={result.tracking.shipDate && <LocalDateTime iso={result.tracking.shipDate} />}
                />
                <Row
                  label={result.tracking.actualDelivery ? "Delivered" : "Estimated delivery"}
                  value={
                    (result.tracking.actualDelivery ?? result.tracking.estimatedDelivery) && (
                      <LocalDateTime
                        iso={result.tracking.actualDelivery ?? result.tracking.estimatedDelivery}
                      />
                    )
                  }
                />
              </div>
            </div>

            {result.tracking.events.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <PackageIcon size={16} />
                  Tracking history
                </p>
                <ol className="flex flex-col">
                  {result.tracking.events.map((e, i) => (
                    <li key={i} className="flex gap-3 border-l-2 border-tys-mist py-2 pl-4 last:border-transparent">
                      <span className="-ml-[21px] flex size-4 items-center justify-center rounded-full bg-background">
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
      </CardContent>
    </Card>

    <Card size="sm">
      <CardHeader>
        <CardTitle>Bulk tracking</CardTitle>
        <CardDescription>
          Check up to {BULK_LIMIT} tracking numbers at once — paste one per line or comma-separated.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={"449044304137821\n449044304137822\n449044304137823"}
          rows={4}
          aria-label="Tracking numbers"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {bulkNumbers.length > BULK_LIMIT
              ? `${bulkNumbers.length} entered — only the first ${BULK_LIMIT} will be checked.`
              : `${bulkNumbers.length} tracking number${bulkNumbers.length === 1 ? "" : "s"}`}
          </p>
          <Button
            onClick={trackBulk}
            disabled={bulkLoading || bulkNumbers.length === 0}
            className="bg-tys-blue text-white hover:bg-tys-blue/90"
          >
            <MagnifyingGlassIcon size={16} weight="bold" />
            {bulkLoading ? "Tracking…" : "Track all"}
          </Button>
        </div>

        {bulkError && <p className="text-sm text-destructive">{bulkError}</p>}

        {bulkResults && (
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
                <TableRow key={r.trackingNumber}>
                  <TableCell className="font-medium">{r.trackingNumber}</TableCell>
                  <TableCell>
                    {r.success ? (
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`size-2 rounded-full ${STATUS_TONE[r.tracking.statusCode ?? ""]?.split(" ")[0] ?? "bg-muted-foreground/40"}`}
                        />
                        {r.tracking.statusDescription}
                      </span>
                    ) : (
                      <span className="text-destructive">{r.message}</span>
                    )}
                  </TableCell>
                  <TableCell>{r.success ? (r.tracking.serviceDescription ?? "—") : "—"}</TableCell>
                  <TableCell>
                    {r.success && r.tracking.shipDate ? <LocalDateTime iso={r.tracking.shipDate} /> : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
