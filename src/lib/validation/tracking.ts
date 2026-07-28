import { z } from "zod";

export const trackingInput = z.object({
  trackingNumber: z
    .string({ error: () => "Enter a tracking number." })
    .trim()
    .min(1, "Enter a tracking number.")
    .max(50, "That doesn't look like a valid tracking number."),
});

// FedEx caps a single Track by Tracking Number request at 30 numbers.
export const bulkTrackingInput = z.object({
  trackingNumbers: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Enter at least one tracking number.")
    .max(30, "FedEx allows up to 30 tracking numbers per request."),
});
