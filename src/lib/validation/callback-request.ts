import { z } from "zod";
import { TIME_SLOTS, quoteContact, timezoneField } from "@/lib/validation/quote-store";

// NOTE: unlinked as of the /quotes consolidation — the public "call me back"
// UX (time slot + timezone + package type, no route) got folded directly
// into the single-page /quotes form, which now saves a real Quote instead of
// a CallbackRequest (so admin can still auto-rate it). This module, its
// CallbackRequest DB table, POST /api/callback-requests, and
// callback-request-form.tsx are kept working but have no live entry point
// pending a cleanup decision — see feedback_deletion_permission memory
// (ask before deleting, even confirmed-unused code).
//
// Originally: a single-step alternative to the full /quotes wizard for a
// customer who'd rather just talk to someone. Reuses quoteContact
// (name/email/country_code/phone) and the TIME_SLOTS/timezoneField now
// canonically defined in quote-store.ts, so the rules never drift from the
// main form's.

export const CALLBACK_TIME_SLOTS = TIME_SLOTS;

const timeSlotValues = ["morning", "afternoon", "evening"] as const;

export const PACKAGE_TYPES = [
  { value: "envelope", label: "Document" },
  { value: "boxes", label: "Boxes" },
  { value: "television", label: "Television" },
  { value: "furniture", label: "Furniture" },
  { value: "auto", label: "Auto" },
  { value: "packers_movers", label: "Packers & Movers" },
] as const;

// Server-canonical payload for POST /api/callback-requests.
export const callbackRequestStoreInput = z.object({
  contact: quoteContact,
  time_slot: z.enum(timeSlotValues, { error: () => "Please select a time that works for you." }),
  timezone: timezoneField,
  package_type: z
    .string({ error: () => "Please select a package type." })
    .min(1, "Please select a package type.")
    .max(255),
});
export type CallbackRequestStoreInput = z.infer<typeof callbackRequestStoreInput>;

// Client-side form schema — package_types as a checkbox array, joined into
// the server's CSV package_type at submit time.
export const callbackRequestFormSchema = z.object({
  contact: quoteContact,
  time_slot: z.enum(timeSlotValues, { error: () => "Please select a time that works for you." }),
  timezone: timezoneField,
  package_types: z.array(z.string()).min(1, "Please select a package type."),
});
export type CallbackRequestFormValues = z.infer<typeof callbackRequestFormSchema>;

export function toApiPayload(values: CallbackRequestFormValues) {
  return {
    contact: values.contact,
    time_slot: values.time_slot,
    timezone: values.timezone,
    package_type: values.package_types.join(","),
  };
}
