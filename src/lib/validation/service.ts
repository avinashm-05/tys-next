import { z } from "zod";
import { nonBlank } from "@/lib/validation/common";

// ServiceStore/UpdateRequest (04-validation). Status is "deactive" (sic) —
// live data depends on the exact value; never normalize it to "inactive".
export const serviceStatus = z.enum(["active", "deactive"]);

export const serviceInput = z.object({
  name: nonBlank(
    "Service name cannot be empty or contain only whitespace.",
    "The name field must not be greater than 255 characters.",
  ),
  system_name: z
    .string()
    .max(255, "The system name field must not be greater than 255 characters.")
    .regex(
      /^[a-z0-9\-_]+$/,
      "The system name may only contain lowercase letters, numbers, hyphens, and underscores.",
    )
    .nullish(),
  status: serviceStatus,
});

export type ServiceInput = z.infer<typeof serviceInput>;

export const UNIQUE_SYSTEM_NAME_MESSAGE =
  "This system name is already in use. Please choose a different one.";
