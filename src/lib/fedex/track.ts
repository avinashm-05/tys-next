import { FedExError, type FedExRequester } from "./client";
import { fedexConfig } from "./config";

// FedEx Track API v1 (net-new — no Laravel equivalent to port; this business
// never had live tracking before). Distinct from a booked-shipment's stored
// tracking number: this looks up ANY valid FedEx tracking number directly
// against FedEx, the same way fedex.com's own tracking page does, so it
// works today even though "Book Shipment" itself still has no real Ship API
// behind it (see admin/shipments — that's a separate, larger build).

type Json = Record<string, unknown>;

export type ScanEvent = {
  dateTime: string | null;
  description: string;
  location: string | null;
};

export type ParsedTracking = {
  trackingNumber: string;
  statusDescription: string;
  statusCode: string | null;
  serviceDescription: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  shipDate: string | null;
  events: ScanEvent[];
};

export type TrackResult =
  | { success: true; tracking: ParsedTracking }
  | { success: false; message: string };

export type BulkTrackResult = { trackingNumber: string } & (
  | { success: true; tracking: ParsedTracking }
  | { success: false; message: string }
);

function formatLocation(loc: Json | undefined): string | null {
  if (!loc) return null;
  const parts = [loc.city, loc.stateOrProvinceCode, loc.countryCode]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function dateOfType(dateAndTimes: Json[], type: string): string | null {
  const hit = dateAndTimes.find((d) => d.type === type);
  return typeof hit?.dateTime === "string" ? hit.dateTime : null;
}

function parseTrackResult(trackResult: Json): TrackResult {
  // A tracking number FedEx doesn't recognize comes back as HTTP 200 with a
  // per-result `error` (not a top-level failure) — has to be checked here,
  // not just via FedExClient throwing.
  const perResultError = trackResult.error as { message?: string } | undefined;
  if (perResultError?.message) {
    return { success: false, message: perResultError.message };
  }

  const trackingNumber =
    ((trackResult.trackingNumberInfo as Json | undefined)?.trackingNumber as string | undefined) ?? "";
  const latest = (trackResult.latestStatusDetail as Json | undefined) ?? {};
  const dateAndTimes = (trackResult.dateAndTimes as Json[] | undefined) ?? [];
  const scanEvents = (trackResult.scanEvents as Json[] | undefined) ?? [];
  const service = trackResult.serviceDetail as Json | undefined;

  return {
    success: true,
    tracking: {
      trackingNumber,
      statusDescription:
        (latest.description as string | undefined) ??
        (latest.statusByLocale as string | undefined) ??
        "Unknown",
      statusCode: (latest.derivedCode as string | undefined) ?? (latest.code as string | undefined) ?? null,
      serviceDescription: (service?.description as string | undefined) ?? null,
      estimatedDelivery: dateOfType(dateAndTimes, "ESTIMATED_DELIVERY"),
      actualDelivery: dateOfType(dateAndTimes, "ACTUAL_DELIVERY"),
      shipDate: dateOfType(dateAndTimes, "SHIP"),
      events: scanEvents
        .map((e) => ({
          dateTime: (e.date as string | undefined) ?? null,
          description: (e.eventDescription as string | undefined) ?? "Update",
          location: formatLocation(e.scanLocation as Json | undefined),
        }))
        // FedEx returns newest-first already; sorted defensively in case a
        // future response shape doesn't guarantee it.
        .sort((a, b) => (b.dateTime ?? "").localeCompare(a.dateTime ?? "")),
    },
  };
}

export class FedExTrackingService {
  private cfg = fedexConfig();

  constructor(private client: FedExRequester) {}

  async track(trackingNumber: string): Promise<TrackResult> {
    const cleaned = trackingNumber.trim();
    if (!cleaned) return { success: false, message: "Enter a tracking number." };

    let response: Json;
    try {
      response = await this.client.request(
        "POST",
        this.cfg.trackEndpoint,
        {
          includeDetailedScans: true,
          trackingInfo: [{ trackingNumberInfo: { trackingNumber: cleaned } }],
        },
        { "X-locale": this.cfg.locale },
      );
    } catch (e) {
      if (e instanceof FedExError) {
        console.error("[fedex] Track API failed", {
          status: e.httpStatus,
          error_body: e.errorBody,
          message: e.message,
        });
        return { success: false, message: this.extractErrorMessage(e) };
      }
      throw e;
    }

    const output = (response.output as Json | undefined) ?? {};
    const complete = (output.completeTrackResults as Json[] | undefined) ?? [];
    const trackResults = (complete[0]?.trackResults as Json[] | undefined) ?? [];
    if (trackResults.length === 0) {
      return { success: false, message: "No tracking information was found for that number." };
    }
    return parseTrackResult(trackResults[0]);
  }

  /** Same endpoint as `track()`, just with up to 30 numbers in one request —
   * FedEx returns one completeTrackResults entry per number, in the order
   * requested. Used for the admin's "check several shipments at once" list,
   * not tied to any of our own Shipment records. */
  async trackBulk(trackingNumbers: string[]): Promise<BulkTrackResult[]> {
    const cleaned = trackingNumbers.map((tn) => tn.trim()).filter(Boolean);
    if (cleaned.length === 0) return [];

    let response: Json;
    try {
      response = await this.client.request(
        "POST",
        this.cfg.trackEndpoint,
        {
          includeDetailedScans: true,
          trackingInfo: cleaned.map((trackingNumber) => ({ trackingNumberInfo: { trackingNumber } })),
        },
        { "X-locale": this.cfg.locale },
      );
    } catch (e) {
      if (e instanceof FedExError) {
        console.error("[fedex] Bulk track API failed", {
          status: e.httpStatus,
          error_body: e.errorBody,
          message: e.message,
        });
        const message = this.extractErrorMessage(e);
        return cleaned.map((trackingNumber) => ({ trackingNumber, success: false, message }));
      }
      throw e;
    }

    const output = (response.output as Json | undefined) ?? {};
    const complete = (output.completeTrackResults as Json[] | undefined) ?? [];

    return cleaned.map((trackingNumber, i) => {
      const entry = complete[i];
      const trackResults = (entry?.trackResults as Json[] | undefined) ?? [];
      const resolvedNumber = (entry?.trackingNumber as string | undefined) ?? trackingNumber;
      if (trackResults.length === 0) {
        return {
          trackingNumber: resolvedNumber,
          success: false,
          message: "No tracking information was found for that number.",
        };
      }
      return { trackingNumber: resolvedNumber, ...parseTrackResult(trackResults[0]) };
    });
  }

  private extractErrorMessage(exception: FedExError): string {
    const errors = (exception.errorBody.errors ?? []) as { message?: string }[];
    for (const error of errors) {
      if (error.message) return String(error.message);
    }
    return exception.message;
  }
}
