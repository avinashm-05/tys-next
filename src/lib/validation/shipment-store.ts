import { z } from "zod";

// Server-canonical payload for POST /api/account/shipments (the "Schedule
// Shipment" self-serve booking wizard) — same split as quote-store.ts: this
// module owns the rules/messages, shipment-wizard.ts's client schema reuses
// these exact sub-schemas so nothing drifts between client and server.

const requiredStr = (msg: string, max = 255) =>
  z.string({ error: () => msg }).min(1, msg).max(max);

const num = (requiredMsg: string, min: number, minMsg: string) =>
  z.coerce.number({ error: () => requiredMsg }).min(min, minMsg);

// Unlike the quote wizard's contact.phone (paired with a separate
// country_code dial-code field), this wizard's Phone 1/2 are single fields
// where the customer types the leading "+1" themselves (matches the field's
// own placeholder) — so, unlike common.ts's intlPhone, "+" is allowed here.
const shipmentPhone = z
  .string({ error: () => "Please enter a phone number." })
  .min(7, "Phone number must be at least 7 characters.")
  .max(30)
  .regex(/^[0-9\s\-()+]+$/, "Phone number can only contain numbers, spaces, hyphens, parentheses, and +.");

// Shared shape for sender/recipient — one row per shipment (no repeating),
// so unlike box/tv/auto rows this isn't wrapped in an array.
export const shipmentPartyBase = z.object({
  contact_name: requiredStr("Please enter a contact name."),
  company_name: z.string().max(255).nullish(),
  address_line_1: requiredStr("Please enter the address."),
  address_line_2: z.string().max(255).nullish(),
  address_line_3: z.string().max(255).nullish(),
  city: requiredStr("Please enter a city.", 100),
  state: requiredStr("Please enter a state.", 100),
  country: requiredStr("Please select a country.", 100),
  postal_code: requiredStr("Please enter a zip/postal code.", 20),
  phone_1: shipmentPhone,
  phone_2: z.string().max(30).nullish(),
  email: z.email("Please enter a valid email address.").nullish().or(z.literal("")),
});

export const shipmentRecipientInput = shipmentPartyBase.extend({
  location_type: z.enum(["residential", "commercial"], {
    error: () => "Please select a location type.",
  }),
});

// Package row: chargeable weight is computed client-side (same formula as
// the quote wizard's boxes) and carried through read-only; insured value is
// the one SFL-specific field the quote wizard's packages don't have.
export const shipmentPackageLineInput = z.object({
  quantity: z.coerce
    .number({ error: () => "Quantity is required." })
    .int("Quantity must be at least 1.")
    .min(1, "Quantity must be at least 1."),
  weight: num("Weight is required.", 0.01, "Weight must be greater than 0."),
  length: num("Length is required.", 0, "Length must be 0 or greater."),
  width: num("Width is required.", 0, "Width must be 0 or greater."),
  height: num("Height is required.", 0, "Height must be 0 or greater."),
  chargeable_weight: z.coerce.number().min(0).nullish(),
  insured_value: z.coerce.number().min(0).nullish(),
});

export const shipmentStoreInput = z.object({
  shipment_type: z.enum(["air", "ground", "ocean"], {
    error: () => "Please select a shipment type.",
  }),
  from_country: requiredStr("Please select the country you are shipping from.", 100),
  to_country: requiredStr("Please select the country you are shipping to.", 100),

  sender: shipmentPartyBase,
  recipient: shipmentRecipientInput,

  packages: z.array(shipmentPackageLineInput).min(1, "Please add at least one package."),

  // Set when booked from the admin "Convert to Shipment" flow's customer
  // counterpart (a customer re-booking an already-quoted route) — server
  // verifies it belongs to the requesting session before trusting it.
  linked_quote_id: z.coerce.number().int().positive().nullish(),
});

export type ShipmentStoreInput = z.infer<typeof shipmentStoreInput>;
