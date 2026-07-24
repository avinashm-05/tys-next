import { z } from "zod";
import { activeInactive, nonBlank, usPhone } from "@/lib/validation/common";

// VendorContactStore/UpdateRequest (04-validation §VendorContact). Both phone
// fields use the strict US format from common.ts — its message is verbatim.
// Status defaults to active when absent (VendorContactController:60-62).
export const vendorContactInput = z.object({
  name: nonBlank(
    "Contact name cannot be empty or contain only whitespace.",
    "The name field must not be greater than 255 characters.",
  ),
  title: z
    .string()
    .max(255, "The title field must not be greater than 255 characters.")
    .nullish(),
  city: z
    .string()
    .max(100, "The city field must not be greater than 100 characters.")
    .nullish(),
  state: z
    .string()
    .max(100, "The state field must not be greater than 100 characters.")
    .nullish(),
  email: z
    .email("Please enter a valid email address.")
    .max(255, "The email field must not be greater than 255 characters."),
  work_phone: usPhone.nullish(),
  cell_phone: usPhone.nullish(),
  status: activeInactive.default("active"),
});

export type VendorContactInput = z.infer<typeof vendorContactInput>;

// UniqueVendorContactEmail: case-insensitive uniqueness WITHIN the vendor,
// live rows only (the app check ignores soft-deleted; the DB index doesn't —
// that R7 collision lands on the P2002 net as a 422).
export const UNIQUE_CONTACT_EMAIL_MESSAGE =
  "This email address is already used by another contact for this vendor.";
