import { z } from "zod";
import { autoDetail, boxDetail, quoteContact, televisionDetail } from "@/lib/validation/quote-store";

// Client-side counterpart to quoteStoreInput (src/lib/validation/quote-store.ts)
// for the /quotes wizard (react-hook-form + zodResolver). Reuses the exact
// box/tv/auto/contact sub-schemas so messages never drift from the server.
// The one structural difference: the UI collects package types as a checkbox
// array (`package_types`) rather than the server's joined CSV string
// (`package_type`) — toApiPayload() below does that join at submit time, so
// POST /api/quotes still receives the identical shape quoteStoreInput expects.

export const PACKAGE_TYPES = [
  { value: "envelope", label: "Envelope" },
  { value: "boxes", label: "Boxes" },
  { value: "television", label: "Television" },
  { value: "furniture", label: "Furniture" },
  { value: "auto", label: "Auto" },
] as const;

export const quoteWizardSchema = z
  .object({
    from_country: z.string().min(1, "Please select the country you are sending from."),
    from_zip: z.string().min(1, "Please enter the zip code you are sending from.").max(20),
    to_country: z.string().min(1, "Please select the country you are sending to."),
    to_zip: z.string().min(1, "Please enter the zip code you are sending to.").max(20),
    is_residence: z.boolean(),

    package_types: z.array(z.string()).min(1, "Please select at least one package type."),

    box_details: z.array(boxDetail),
    television_details: z.array(televisionDetail),
    auto_details: z.array(autoDetail),

    // Brought back with the wizard (2026-08-11). quoteStoreInput gained these
    // AFTER this wizard was first retired, and both are required server-side —
    // without them every submission 422s. They sit on step 4 beside the
    // contact details, which is where the single-page form asked for them.
    time_slot: z.enum(["morning", "afternoon", "evening"], {
      error: () => "Please select a time that works for you.",
    }),
    timezone: z.string().min(1, "Please select your timezone."),

    contact: quoteContact,
  })
  .superRefine((data, ctx) => {
    const selected = data.package_types;
    // Envelope/furniture override: no detail rows required (matches quoteStoreInput).
    if (selected.includes("envelope") || selected.includes("furniture")) return;

    if (selected.includes("boxes") && data.box_details.length === 0) {
      ctx.addIssue({ code: "custom", path: ["box_details"], message: "Please provide box details." });
    }
    if (selected.includes("television") && data.television_details.length === 0) {
      ctx.addIssue({ code: "custom", path: ["television_details"], message: "Please provide television details." });
    }
    if (selected.includes("auto") && data.auto_details.length === 0) {
      ctx.addIssue({ code: "custom", path: ["auto_details"], message: "Please provide auto details." });
    }
  });

// The box/tv detail rows use z.coerce.number() (shared with the server
// schema), so the *input* shape RHF works with (before zod coerces
// strings/unknowns to numbers) differs from the *output* shape zodResolver
// hands to onSubmit. useForm takes the input type; toApiPayload and onSubmit
// take the output type. See quote-wizard-form.tsx's useForm<Input, any, Output>.
export type QuoteWizardValues = z.output<typeof quoteWizardSchema>;
export type QuoteWizardInput = z.input<typeof quoteWizardSchema>;

export const STEP_FIELDS = {
  1: ["from_country", "from_zip", "to_country", "to_zip", "is_residence"],
  2: ["package_types"],
  3: ["box_details", "television_details", "auto_details"],
  4: ["contact", "time_slot", "timezone"],
} as const;

// Only these package types have a details sub-section on step 3 — envelope
// and furniture never do, no matter what else is selected alongside them.
const DETAIL_PACKAGE_TYPES = ["boxes", "television", "auto"];

/** True when step 3 (package details) should be skipped for the current selection. */
export function skipDetailsStep(packageTypes: string[]): boolean {
  return !packageTypes.some((t) => DETAIL_PACKAGE_TYPES.includes(t));
}

/** Builds the exact POST /api/quotes payload quoteStoreInput validates. */
export function toApiPayload(values: QuoteWizardValues) {
  return {
    from_country: values.from_country,
    from_zip: values.from_zip,
    to_country: values.to_country,
    to_zip: values.to_zip,
    is_residence: values.is_residence,
    package_type: values.package_types.join(","),
    packages: [],
    box_details: values.package_types.includes("boxes") ? values.box_details : [],
    television_details: values.package_types.includes("television") ? values.television_details : [],
    auto_details: values.package_types.includes("auto") ? values.auto_details : [],
    time_slot: values.time_slot,
    timezone: values.timezone,
    contact: values.contact,
  };
}
