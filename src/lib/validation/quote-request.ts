import { z } from "zod";
import { TIME_SLOTS, quoteContact, timezoneField } from "@/lib/validation/quote-store";

// Client-side counterpart to quoteStoreInput (src/lib/validation/quote-store.ts)
// for the single-page /quotes form (react-hook-form + zodResolver). Replaces
// the old 4-step quote-wizard.ts — the public form no longer collects
// box/tv/auto dimensions, zip codes, or residence/commercial type up front
// (all staff-side follow-ups on the callback) — just which countries the
// shipment is between, package type, and a callback window. The one
// structural difference from the server schema: package types are collected
// as a checkbox array (`package_types`) rather than the server's joined CSV
// string (`package_type`) — toApiPayload() does that join at submit time, so
// POST /api/quotes still receives the shape quoteStoreInput expects (with
// from_zip/to_zip/is_residence simply omitted — quoteStoreInput treats those
// as optional precisely for this caller).

export { TIME_SLOTS };

export const PACKAGE_TYPES = [
  { value: "envelope", label: "Document" },
  { value: "boxes", label: "Boxes" },
  { value: "television", label: "Television" },
  { value: "furniture", label: "Furniture" },
  { value: "auto", label: "Auto" },
  { value: "packers_movers", label: "Packers & Movers" },
] as const;

const timeSlotValues = ["morning", "afternoon", "evening"] as const;

export const quoteRequestSchema = z.object({
  from_country: z.string().min(1, "Please select the country you are sending from."),
  to_country: z.string().min(1, "Please select the country you are sending to."),

  package_types: z.array(z.string()).min(1, "Please select at least one package type."),

  time_slot: z.enum(timeSlotValues, { error: () => "Please select a time that works for you." }),
  timezone: timezoneField,

  contact: quoteContact,
});
export type QuoteRequestValues = z.infer<typeof quoteRequestSchema>;

/** Builds the exact POST /api/quotes payload quoteStoreInput validates. */
export function toApiPayload(values: QuoteRequestValues) {
  return {
    from_country: values.from_country,
    to_country: values.to_country,
    package_type: values.package_types.join(","),
    packages: [],
    box_details: [],
    television_details: [],
    auto_details: [],
    time_slot: values.time_slot,
    timezone: values.timezone,
    contact: values.contact,
  };
}
