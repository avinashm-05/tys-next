import { z } from "zod";
import { weightUnit } from "@/lib/validation/common";

// weight_unit with CalculateQuoteRequest's verbatim messages: required vs
// invalid-enum. (A plain enum + .refine can't override the enum's own
// invalid-value message, so the custom error lives on the enum itself.)
const calcWeightUnit = z.enum(["lb", "kg"], {
  error: (issue) =>
    issue.input == null ? "Weight unit is required." : "The selected weight unit is invalid.",
});

// CalculateQuoteRequest (04-validation) — messages copied verbatim.
export const calculateInput = z.object({
  length: z.coerce
    .number({
      error: (i) =>
        i.input == null ? "Package length is required." : "Package length must be a number.",
    })
    .min(0, "Package length must be 0 or greater."),
  width: z.coerce
    .number({
      error: (i) =>
        i.input == null ? "Package width is required." : "Package width must be a number.",
    })
    .min(0, "Package width must be 0 or greater."),
  height: z.coerce
    .number({
      error: (i) =>
        i.input == null ? "Package height is required." : "Package height must be a number.",
    })
    .min(0, "Package height must be 0 or greater."),
  weight: z.coerce
    .number({
      error: (i) =>
        i.input == null ? "Package weight is required." : "Package weight must be a number.",
    })
    .min(0.01, "Package weight must be greater than 0."),
  weight_unit: calcWeightUnit,
});

export type CalculateInput = z.infer<typeof calculateInput>;

// Per-row dimension override for the re-rate endpoint (R27): each row is
// validated with the same numeric rules as calculate so untrusted overrides
// can't reach FedEx unchecked.
export const packageDetailOverride = z.object({
  quantity: z.coerce.number().int().min(1).optional(),
  weight: z.coerce.number().min(0.01, "Package weight must be greater than 0."),
  weight_unit: weightUnit,
  length: z.coerce.number().min(0, "Package length must be 0 or greater."),
  width: z.coerce.number().min(0, "Package width must be 0 or greater."),
  height: z.coerce.number().min(0, "Package height must be 0 or greater."),
});
