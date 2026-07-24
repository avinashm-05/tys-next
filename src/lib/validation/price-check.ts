import { z } from "zod";
import { weightUnit } from "@/lib/validation/common";

// A4.4 Price Check input (R27: everything validated server-side). Generic
// package rows: weight required; dimensions optional — absent dims mean
// chargeable weight falls back to actual weight (calculateChargeableWeight's
// dim≤0 ⇒ dimensional weight 0 rule). Messages reuse the calculate wording.

const priceCheckPackage = z.object({
  weight: z.coerce
    .number({ error: () => "Package weight is required." })
    .min(0.01, "Package weight must be greater than 0."),
  weight_unit: weightUnit,
  length: z.coerce.number().min(0, "Package length must be 0 or greater.").nullish(),
  width: z.coerce.number().min(0, "Package width must be 0 or greater.").nullish(),
  height: z.coerce.number().min(0, "Package height must be 0 or greater.").nullish(),
  quantity: z.coerce
    .number()
    .int("Package quantity must be at least 1.")
    .min(1, "Package quantity must be at least 1.")
    .default(1),
});

export const priceCheckInput = z.object({
  from_country: z
    .string({ error: () => "Please select the country you are sending from." })
    .min(1, "Please select the country you are sending from.")
    .max(255),
  from_zip: z
    .string({ error: () => "Please enter the zip code you are sending from." })
    .min(1, "Please enter the zip code you are sending from.")
    .max(20),
  to_country: z
    .string({ error: () => "Please select the country you are sending to." })
    .min(1, "Please select the country you are sending to.")
    .max(255),
  to_zip: z
    .string({ error: () => "Please enter the zip code you are sending to." })
    .min(1, "Please enter the zip code you are sending to.")
    .max(20),
  is_residence: z.preprocess((v) => v === true || v === 1 || v === "1", z.boolean()).optional(),
  packaging_type: z.string().max(64).nullish(),
  packages: z
    .array(priceCheckPackage, { error: () => "Please add at least one package." })
    .min(1, "Please add at least one package."),
});

export type PriceCheckInput = z.infer<typeof priceCheckInput>;
