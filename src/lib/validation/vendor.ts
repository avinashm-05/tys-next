import { z } from "zod";
import { activeInactive, nonBlank } from "@/lib/validation/common";

// VendorStoreRequest / VendorUpdateRequest (04-validation). Messages listed
// there are verbatim; the rest are directive per docs/design.md. The async
// rules (vendor type exists+active, unique email / ein / ssn-hash) live in
// the routes and answer 422 with the exported messages.
export const vendorInput = z.object({
  name: nonBlank(
    "Vendor name cannot be empty or contain only whitespace.",
    "The name field must not be greater than 255 characters.",
  ),
  vendor_type_id: z.coerce
    .number({ error: "Please select a vendor type." })
    .int("Please select a vendor type."),
  email: z
    .email("Please enter a valid email address.")
    .max(255, "The email field must not be greater than 255 characters."),
  phone_number: z
    .string()
    .max(20, "The phone number field must not be greater than 20 characters.")
    .regex(/^[+]?[0-9\s\-()]+$/, "Please enter a valid phone number."),
  country_code: z
    .string()
    .max(5, "The country code field must not be greater than 5 characters.")
    .regex(/^[+]?[0-9]+$/, "Please enter a valid country code (e.g., +1, +44)."),
  website: z
    .url("Please enter a valid website URL.")
    .max(255, "The website field must not be greater than 255 characters.")
    .nullish(),
  ein_number: z
    .string()
    .max(20, "The EIN field must not be greater than 20 characters.")
    .regex(/^[0-9-]+$/, "The EIN may only contain numbers and hyphens.")
    .nullish(),
  ssn_number: z
    .string()
    .max(20, "The SSN field must not be greater than 20 characters.")
    .regex(/^[0-9-]+$/, "The SSN may only contain numbers and hyphens.")
    .nullish(),
  address_line_1: z
    .string()
    .min(1, "The address line 1 field is required.")
    .max(255, "The address line 1 field must not be greater than 255 characters."),
  address_line_2: z
    .string()
    .max(255, "The address line 2 field must not be greater than 255 characters.")
    .nullish(),
  address_line_3: z
    .string()
    .max(255, "The address line 3 field must not be greater than 255 characters.")
    .nullish(),
  city: z
    .string()
    .min(1, "The city field is required.")
    .max(100, "The city field must not be greater than 100 characters."),
  state: z
    .string()
    .min(1, "The state field is required.")
    .max(100, "The state field must not be greater than 100 characters."),
  country: z
    .string()
    .min(1, "The country field is required.")
    .max(100, "The country field must not be greater than 100 characters."),
  postal_code: z
    .string()
    .min(1, "The postal code field is required.")
    .max(20, "The postal code field must not be greater than 20 characters."),
  status: activeInactive,
});

export type VendorInput = z.infer<typeof vendorInput>;

// Verbatim (04-validation): the vendor-type closure rule.
export const VENDOR_TYPE_INACTIVE_MESSAGE =
  "The selected vendor type is not active and cannot be assigned to new vendors.";
export const UNIQUE_EMAIL_MESSAGE = "The email has already been taken.";
export const UNIQUE_EIN_MESSAGE = "The EIN has already been taken.";
export const UNIQUE_SSN_MESSAGE = "The SSN has already been taken.";
