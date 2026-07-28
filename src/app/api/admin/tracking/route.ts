import { adminRoute } from "@/lib/auth";
import { emptyStringsToNull } from "@/lib/validation/common";
import { trackingInput } from "@/lib/validation/tracking";
import { FedExClient } from "@/lib/fedex/client";
import { trackCredentials } from "@/lib/fedex/config";
import { FedExTrackingService } from "@/lib/fedex/track";

// Standalone tracking lookup — real FedEx Track API, works for ANY valid
// tracking number today, independent of "Book Shipment" (which has no real
// Ship API/Shipment record behind it yet — see admin/shipments). No DB
// reads or writes: this doesn't need our own shipment to exist first.
//
// Uses its own FedEx project credentials (FEDEX_TRACK_CLIENT_ID/SECRET) —
// the main Rate project was never entitled for Track (confirmed via a
// FORBIDDEN.ERROR reproduced outside the app), so Track runs under its own
// "tys_track" project instead, with its own sandbox-vs-production cutover.
export const POST = adminRoute(async (req) => {
  const { trackingNumber } = trackingInput.parse(emptyStringsToNull(await req.json()));
  const client = new FedExClient(trackCredentials());
  const result = await new FedExTrackingService(client).track(trackingNumber);
  return Response.json(result);
});
