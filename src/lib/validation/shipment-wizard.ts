import { z } from "zod";
import {
  refinePickup,
  shipmentExtrasShape,
  shipmentPackageLineInput,
  shipmentPartyBase,
  shipmentRecipientInput,
} from "@/lib/validation/shipment-store";

// Client-side counterpart to shipmentStoreInput, for the /book-shipment
// wizard (react-hook-form + zodResolver) — same split as quote-wizard.ts.

export const SHIPMENT_TYPES = [
  { value: "air", label: "Air" },
  { value: "ground", label: "Ground" },
  { value: "ocean", label: "Ocean" },
] as const;

export const shipmentWizardSchema = z.object({
  shipment_type: z.enum(["air", "ground", "ocean"], {
    error: () => "Please select a shipment type.",
  }),
  from_country: z.string().min(1, "Please select the country you are shipping from."),
  to_country: z.string().min(1, "Please select the country you are shipping to."),

  sender: shipmentPartyBase,
  recipient: shipmentRecipientInput,

  packages: z.array(shipmentPackageLineInput).min(1, "Please add at least one package."),

  ...shipmentExtrasShape,
  agree_terms: z.boolean().refine((v) => v === true, "Please agree to the terms to book."),
}).superRefine(refinePickup);

export type ShipmentWizardValues = z.output<typeof shipmentWizardSchema>;
export type ShipmentWizardInput = z.input<typeof shipmentWizardSchema>;

export const STEP_FIELDS = {
  1: ["shipment_type", "from_country", "to_country"],
  2: ["sender", "pickup_needed", "pickup_date"],
  3: ["recipient"],
  4: ["packages", "package_type", "special_instruction", "agree_terms"],
} as const;

/** Builds the exact POST /api/account/shipments payload shipmentStoreInput validates. */
export function toApiPayload(values: ShipmentWizardValues, linkedQuoteId?: number | null) {
  return {
    shipment_type: values.shipment_type,
    from_country: values.from_country,
    to_country: values.to_country,
    sender: values.sender,
    recipient: values.recipient,
    packages: values.packages,
    linked_quote_id: linkedQuoteId ?? null,
    package_type: values.package_type,
    pickup_needed: values.pickup_needed,
    pickup_date: values.pickup_needed ? values.pickup_date : null,
    special_instruction: values.special_instruction || null,
  };
}
