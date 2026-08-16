import { z } from "zod";
import { quoteContact } from "@/lib/validation/quote-store";

// Client-side counterpart to quoteStoreInput (src/lib/validation/quote-store.ts)
// for the /quotes wizard (react-hook-form + zodResolver). Reuses the exact
// contact sub-schema so messages never drift from the server.
//
// 2026-08-16: the wizard no longer collects box/television/auto dimensions
// at all — every package type now behaves like envelope always did. Staff
// capture exact package details on the callback via the admin editor, same
// as the single-page form's flow already worked. This dropped what used to
// be step 3 ("Package Details") entirely; the wizard is Location → Select
// Package → Contact Information. quoteStoreInput's box_details/
// television_details/auto_details stay nullish server-side for the admin
// editor's own writes — this file just stops ever sending them.

export const PACKAGE_TYPES = [
  { value: "envelope", label: "Envelope" },
  { value: "boxes", label: "Boxes" },
  { value: "television", label: "Television" },
  { value: "furniture", label: "Furniture" },
  { value: "auto", label: "Auto" },
] as const;

export const quoteWizardSchema = z.object({
  from_country: z.string().min(1, "Please select the country you are sending from."),
  from_zip: z.string().min(1, "Please enter the zip code you are sending from.").max(20),
  to_country: z.string().min(1, "Please select the country you are sending to."),
  to_zip: z.string().min(1, "Please enter the zip code you are sending to.").max(20),
  is_residence: z.boolean(),

  package_types: z.array(z.string()).min(1, "Please select at least one package type."),

  // No customer-facing field: the wizard fills this in itself from the
  // origin country (see quote-wizard-form.tsx). The matching "best time to
  // call you back" question was dropped from the form on 2026-08-15, so
  // time_slot is no longer collected here at all and quoteStoreInput now
  // accepts it as optional. Left unvalidated (no .min(1)) on purpose —
  // there is no input for the customer to correct if the guess ever fails.
  timezone: z.string(),

  contact: quoteContact,
});

export type QuoteWizardValues = z.output<typeof quoteWizardSchema>;
export type QuoteWizardInput = z.input<typeof quoteWizardSchema>;

/** Builds the exact POST /api/quotes payload quoteStoreInput validates. */
export function toApiPayload(values: QuoteWizardValues) {
  return {
    from_country: values.from_country,
    from_zip: values.from_zip,
    to_country: values.to_country,
    to_zip: values.to_zip,
    is_residence: values.is_residence,
    package_type: values.package_types.join(","),
    timezone: values.timezone,
    contact: values.contact,
  };
}
