import { z } from "zod";

// VendorService requests (04-validation §VendorService). Bodies use
// { serviceId } / { serviceIds } (no form maps these — driven by the picker).
export const assignServiceInput = z.object({
  serviceId: z.coerce.number({ error: "Please select a service." }).int(),
});

export const bulkServiceInput = z.object({
  serviceIds: z
    .array(z.coerce.number().int(), { error: "Please select at least one service." })
    .min(1, "Please select at least one service.")
    .max(50, "The service ids field must not have more than 50 items."),
});

// Verbatim rule semantics: assign requires exists AND active; unassign only exists.
export const SERVICE_NOT_ACTIVE_MESSAGE =
  "The selected service does not exist or is not active.";
export const SERVICE_NOT_FOUND_MESSAGE = "The selected service does not exist.";
