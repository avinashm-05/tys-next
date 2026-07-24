import { z } from "zod";
import { weightUnit } from "@/lib/validation/common";

// Port of App\Http\Requests\QuoteRequest (04-validation) — the public store
// payload. Zod issue paths are joined with "." by zodTo422, so they match
// Laravel's keys exactly ("box_details.0.weight", "contact.email",
// "package_type") — which the wizard's mapServerErrors maps onto the right
// fields. Messages are verbatim where the FormRequest defines them; the
// box/tv/auto rows reuse the semantically-identical `packages.*` messages (the
// FormRequest left those to Laravel defaults, but these read better and the
// client validates step 3 first anyway).

const requiredStr = (msg: string, max = 255) =>
  z.string({ error: () => msg }).min(1, msg).max(max);

// Numeric field mirroring the FormRequest's required + min rules.
const num = (requiredMsg: string, min: number, minMsg: string) =>
  z.coerce.number({ error: () => requiredMsg }).min(min, minMsg);

// Box row: every field required when box_details is present (required_with).
const boxDetail = z.object({
  quantity: z.coerce
    .number({ error: () => "Package quantity is required." })
    .int("Package quantity must be at least 1.")
    .min(1, "Package quantity must be at least 1."),
  weight: num("Package weight is required.", 0.01, "Package weight must be greater than 0."),
  weight_unit: weightUnit,
  length: num("Package length is required.", 0, "Package length must be 0 or greater."),
  width: num("Package width is required.", 0, "Package width must be 0 or greater."),
  height: num("Package height is required.", 0, "Package height must be 0 or greater."),
  chargeable_weight: z.coerce.number().min(0).nullish(),
});

// Television row: brand/model required too; quantity optional.
const televisionDetail = z.object({
  quantity: z.coerce.number().int().min(1).nullish(),
  brand_name: requiredStr("TV brand name is required."),
  tv_model: requiredStr("TV model is required."),
  weight: num("Package weight is required.", 0.01, "Package weight must be greater than 0."),
  weight_unit: weightUnit,
  length: num("Package length is required.", 0, "Package length must be 0 or greater."),
  width: num("Package width is required.", 0, "Package width must be 0 or greater."),
  height: num("Package height is required.", 0, "Package height must be 0 or greater."),
  chargeable_weight: z.coerce.number().min(0).nullish(),
});

// Auto row: make/model/year required; car_year is exactly 4 digits (digits:4),
// kept as a STRING (R8).
const autoDetail = z.object({
  brand_name: requiredStr("Please provide the vehicle make."),
  car_model: requiredStr("Please provide the car model."),
  car_year: z.coerce.string().regex(/^\d{4}$/, "Please enter a valid 4-digit car year."),
});

// Legacy single "packages" payload — permissive (every rule was nullable in the
// FormRequest); kept for old submitters. The wizard never sends it.
const legacyPackage = z
  .object({
    quantity: z.coerce.number().int().min(1).nullish(),
    weight: z.coerce.number().min(0.01).nullish(),
    weight_unit: weightUnit.nullish(),
    length: z.coerce.number().min(0).nullish(),
    width: z.coerce.number().min(0).nullish(),
    height: z.coerce.number().min(0).nullish(),
    chargeable_weight: z.coerce.number().min(0).nullish(),
    brand_name: z.string().max(255).nullish(),
    tv_model: z.string().max(255).nullish(),
  })
  .passthrough();

/** Lowercase/trim CSV or array of package types (no canonicalization here). */
export function selectedPackageTypes(packageType: string | string[]): string[] {
  const arr = Array.isArray(packageType) ? packageType : String(packageType).split(",");
  return arr.map((t) => t.toLowerCase().trim()).filter((t) => t !== "");
}

export const quoteStoreInput = z
  .object({
    from_country: requiredStr("Please select the country you are sending from."),
    from_zip: requiredStr("Please enter the zip code you are sending from.", 20),
    to_country: requiredStr("Please select the country you are sending to."),
    to_zip: requiredStr("Please enter the zip code you are sending to.", 20),
    is_residence: z.preprocess((v) => v === true || v === 1 || v === "1", z.boolean()).optional(),

    package_type: z
      .string({ error: () => "Please select a package type." })
      .min(1, "Please select a package type.")
      .max(255, "The selected package type is invalid."),

    packages: z.array(legacyPackage).nullish(),
    box_details: z.array(boxDetail).nullish(),
    television_details: z.array(televisionDetail).nullish(),
    auto_details: z.array(autoDetail).nullish(),

    contact: z.object({
      name: z.string({ error: () => "Please enter your name." }).max(255).regex(/\S/, "Please enter a valid name."),
      email: z
        .string({ error: () => "Please enter your email address." })
        .max(255)
        .email("Please enter a valid email address."),
      country_code: requiredStr("Please select a country code.", 10),
      phone: z
        .string({ error: () => "Please enter your phone number." })
        .min(7, "Phone number must be at least 7 characters.")
        .max(20)
        .regex(/^[0-9\s\-()]+$/, "Phone number can only contain numbers, spaces, hyphens, and parentheses."),
    }),
  })
  // withValidator: allowed types + the envelope/furniture override.
  .superRefine((data, ctx) => {
    const selected = selectedPackageTypes(data.package_type);
    const allowed = ["envelope", "box", "boxes", "television", "furniture", "auto"];

    if (selected.length === 0) {
      ctx.addIssue({ code: "custom", path: ["package_type"], message: "Please select at least one package type." });
      return;
    }
    for (const t of selected) {
      if (!allowed.includes(t)) {
        ctx.addIssue({ code: "custom", path: ["package_type"], message: "The selected package type is invalid." });
        return;
      }
    }

    const hasBox = selected.includes("box") || selected.includes("boxes");
    const hasTelevision = selected.includes("television");
    const hasAuto = selected.includes("auto");
    // Envelope/furniture override: skip box/tv/auto detail requirements.
    if (selected.includes("envelope") || selected.includes("furniture")) return;

    const hasPackages = (data.packages?.length ?? 0) > 0;
    if (hasBox && (data.box_details?.length ?? 0) === 0 && !hasPackages) {
      ctx.addIssue({ code: "custom", path: ["box_details"], message: "Please provide box details." });
    }
    if (hasTelevision && (data.television_details?.length ?? 0) === 0 && !hasPackages) {
      ctx.addIssue({ code: "custom", path: ["television_details"], message: "Please provide television details." });
    }
    if (hasAuto && (data.auto_details?.length ?? 0) === 0) {
      ctx.addIssue({ code: "custom", path: ["auto_details"], message: "Please provide auto details." });
    }
  });

export type QuoteStoreInput = z.infer<typeof quoteStoreInput>;
