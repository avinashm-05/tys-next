import { adminRoute } from "@/lib/auth";
import { bulkTrackingInput } from "@/lib/validation/tracking";
import { FedExClient } from "@/lib/fedex/client";
import { trackCredentials } from "@/lib/fedex/config";
import { FedExTrackingService } from "@/lib/fedex/track";

// Track by Tracking Number, batched — same endpoint as the single lookup,
// just up to 30 numbers in one request. Still a pure read against FedEx, not
// tied to our own Shipment records.
export const POST = adminRoute(async (req) => {
  const { trackingNumbers } = bulkTrackingInput.parse(await req.json());
  const client = new FedExClient(trackCredentials());
  const results = await new FedExTrackingService(client).trackBulk(trackingNumbers);
  return Response.json({ results });
});
