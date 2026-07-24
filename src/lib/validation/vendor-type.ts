import { z } from "zod";
import { activeInactive, nonBlank } from "@/lib/validation/common";

// VendorTypeStore/UpdateRequest (04-validation). The async uniqueness check
// on vendor_types.name (ignore self on update) lives in the route — it needs
// the DB — and answers 422 with UNIQUE_NAME_MESSAGE on the field.
export const vendorTypeInput = z.object({
  name: nonBlank(
    "Vendor type name cannot be empty or contain only whitespace.",
    "The name field must not be greater than 255 characters.",
  ),
  description: z
    .string()
    .max(1000, "The description field must not be greater than 1000 characters.")
    .nullish(),
  status: activeInactive,
});

export type VendorTypeInput = z.infer<typeof vendorTypeInput>;

export const UNIQUE_NAME_MESSAGE = "The name has already been taken.";
