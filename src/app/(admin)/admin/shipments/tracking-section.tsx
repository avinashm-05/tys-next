"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { Button } from "@/components/ui/button";
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
import type { TrackingEvent } from "./types";

function nowForDatetimeLocal() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

// Automated carrier tracking (FedEx webhook/poll) stays a UI-only stub — no
// live FedEx call happens from this file. Manual tracking is real: backed by
// shipment_tracking_events (source="manual"), POST/GET
// /api/admin/shipments/[id]/tracking-events.
export function TrackingSection({ shipmentId }: { shipmentId: number }) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [occurredAt, setOccurredAt] = useState(nowForDatetimeLocal());
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminApi<TrackingEvent[]>(`/api/admin/shipments/${shipmentId}/tracking-events`)
      .then((rows) => {
        if (!cancelled) setEvents(rows);
      })
      .catch((e) => {
        if (!cancelled) toast.error(e instanceof ApiError ? e.message : "Couldn't load tracking events.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shipmentId]);

  async function addEvent() {
    if (!status.trim()) return;
    setPosting(true);
    try {
      const event = await adminApi<TrackingEvent>(`/api/admin/shipments/${shipmentId}/tracking-events`, {
        method: "POST",
        body: JSON.stringify({
          occurredAt: new Date(occurredAt).toISOString(),
          status: status.trim(),
          location: location.trim() || null,
          note: note.trim() || null,
        }),
      });
      setEvents((prev) => [event, ...prev]);
      setStatus("");
      setLocation("");
      setNote("");
      setOccurredAt(nowForDatetimeLocal());
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't add the tracking event.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between rounded-xl border border-tys-mist p-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Automated carrier tracking isn&apos;t wired up yet — no live FedEx integration configured
            on this tab.
          </p>
        </div>
        <Button
          className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
          onClick={() => toast.info("Automated carrier tracking isn't wired up yet.")}
        >
          Open
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-tys-mist p-4">
        <h2 className="font-heading text-lg font-semibold">Manual Tracking</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            aria-label="Event date/time"
          />
          <Input
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Status (e.g. Departed facility)"
            aria-label="Event status"
          />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            aria-label="Event location"
          />
          <div className="flex items-start gap-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              rows={1}
              className="min-h-9"
              aria-label="Event note"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={!status.trim() || posting}
              onClick={addEvent}
              aria-label="Add tracking event"
            >
              <PlusIcon size={16} />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-tys-mist">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Logged by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Loading tracking events…
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No manual tracking events yet.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">
                      <LocalDateTime iso={e.occurredAt} />
                    </TableCell>
                    <TableCell className="text-sm font-medium">{e.status}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.location ?? "—"}</TableCell>
                    <TableCell className="max-w-xs text-sm whitespace-pre-wrap text-muted-foreground">
                      {e.note ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {e.createdByName ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
