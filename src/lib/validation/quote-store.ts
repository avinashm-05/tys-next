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
// Exported (along with the tv/auto/contact schemas below) so the public quote
// wizard's client-side react-hook-form validation can share these exact rules
// instead of re-declaring them — one source of truth for the messages.
export const boxDetail = z.object({
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
export const televisionDetail = z.object({
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
export const autoDetail = z.object({
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

// Public quote form asks a single best-time-to-call window instead of
// collecting box/tv/auto dimensions — staff work out the exact details (and
// can still add PackageDetail rows manually) on the callback. Exported so
// callback-request.ts's own (now-unlinked, kept-for-reference) schema shares
// the same values instead of drifting.
export const TIME_SLOTS = [
  { value: "morning", label: "Morning", hint: "8am – 12pm" },
  { value: "afternoon", label: "Afternoon", hint: "12pm – 5pm" },
  { value: "evening", label: "Evening", hint: "5pm – 8pm" },
] as const;
const timeSlotValues = ["morning", "afternoon", "evening"] as const;

// IANA zone name, e.g. "America/New_York" — validated as non-empty rather
// than against Intl's zone list, since that list is runtime/ICU-dependent and
// the server shouldn't reject a valid zone just because Node's build
// disagrees with the browser's about the exact catalog.
export const timezoneField = z
  .string({ error: () => "Please select your timezone." })
  .min(1, "Please select your timezone.")
  .max(64);

// National significant number digit length by dial code (E.164 calling
// code, e.g. "+1") — a RANGE, not an exact count, since several countries
// legitimately vary (mobile vs. landline, area-code differences). Covers the
// most commonly selected codes; anything not listed here falls back to the
// generic DEFAULT_PHONE_DIGIT_RANGE below rather than guessing wrong for a
// country we haven't verified.
const PHONE_DIGIT_RANGE: Record<string, [min: number, max: number]> = {
  "+1": [10, 10], // NANP: US, Canada, Caribbean
  "+91": [10, 10], // India
  "+44": [10, 10], // UK
  "+61": [9, 9], // Australia
  "+86": [11, 11], // China
  "+81": [9, 10], // Japan
  "+33": [9, 9], // France
  "+34": [9, 9], // Spain
  "+7": [10, 10], // Russia, Kazakhstan
  "+971": [9, 9], // UAE
  "+966": [9, 9], // Saudi Arabia
  "+65": [8, 8], // Singapore
  "+63": [10, 10], // Philippines
  "+92": [10, 10], // Pakistan
  "+880": [10, 10], // Bangladesh
  "+94": [9, 9], // Sri Lanka
  "+977": [10, 10], // Nepal
  "+52": [10, 10], // Mexico
  "+55": [10, 11], // Brazil
  "+27": [9, 9], // South Africa
  "+234": [10, 10], // Nigeria
  "+20": [10, 10], // Egypt
  "+212": [9, 9], // Morocco
  "+82": [9, 10], // South Korea
  "+351": [9, 9], // Portugal
  "+31": [9, 9], // Netherlands
  "+41": [9, 9], // Switzerland
  "+47": [8, 8], // Norway
  "+45": [8, 8], // Denmark
  "+48": [9, 9], // Poland
  "+420": [9, 9], // Czechia
  "+30": [10, 10], // Greece
  "+90": [10, 10], // Turkey
  "+972": [9, 9], // Israel
  "+353": [9, 9], // Ireland
};
const DEFAULT_PHONE_DIGIT_RANGE: [min: number, max: number] = [7, 15];

// Exported so the wizard's client-side schema shares these exact rules/messages.
export const quoteContact = z
  .object({
    name: z.string({ error: () => "Please enter your name." }).max(255).regex(/\S/, "Please enter a valid name."),
    email: z
      .string({ error: () => "Please enter your email address." })
      .max(255)
      .email("Please enter a valid email address."),
    country_code: requiredStr("Please select a country code.", 10),
    phone: z
      .string({ error: () => "Please enter your phone number." })
      .min(1, "Please enter your phone number.")
      .max(20)
      .regex(/^[0-9\s\-()]+$/, "Phone number can only contain numbers, spaces, hyphens, and parentheses."),
  })
  // Cross-field: the expected digit count depends on which country code was
  // selected (e.g. 10 digits for +1/US) rather than one fixed rule for every
  // country.
  .superRefine((data, ctx) => {
    if (!data.phone.trim()) return; // the field's own required rule already covers this
    const digits = data.phone.replace(/\D/g, "").length;
    const [min, max] = PHONE_DIGIT_RANGE[data.country_code] ?? DEFAULT_PHONE_DIGIT_RANGE;
    if (digits < min || digits > max) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message:
          min === max
            ? `Phone number must be exactly ${min} digits for this country code.`
            : `Phone number must be between ${min} and ${max} digits for this country code.`,
      });
    }
  });

export const quoteStoreInput = z
  .object({
    from_country: requiredStr("Please select the country you are sending from."),
    // Zip is no longer collected by the single-page public form — just the
    // route's countries, plus a callback window — so staff get the exact
    // zips on the call. Still accepted when present (admin-side callers).
    from_zip: z.string().max(20, "The zip code is invalid.").nullish(),
    to_country: requiredStr("Please select the country you are sending to."),
    to_zip: z.string().max(20, "The zip code is invalid.").nullish(),
    is_residence: z.preprocess((v) => v === true || v === 1 || v === "1", z.boolean()).optional(),

    package_type: z
      .string({ error: () => "Please select a package type." })
      .min(1, "Please select a package type.")
      .max(255, "The selected package type is invalid."),

    // Both OPTIONAL as of 2026-08-15. The multi-step wizard is the public
    // form again, and it no longer asks the customer when to call back — that
    // question was removed as unnecessary friction on a quote form. The
    // wizard still sends `timezone`, inferred silently from the origin
    // country, so sales knows what hour it is at the lead's end.
    //
    // Keep these OPTIONAL, not deleted: the columns are nullable
    // (`preferred_time_slot`, `timezone` on `quotes`), older rows still carry
    // real values, and the admin editor may still submit them. Making them
    // required again would 422 every public submission — that exact bug was
    // shipped once already on 2026-08-11.
    time_slot: z.enum(timeSlotValues, { error: () => "Please select a time that works for you." }).nullish(),
    timezone: timezoneField.nullish(),

    // Still accepted (and still validated below when present) so the admin
    // editor's own writes and any legacy caller keep working — the public
    // form itself never sends these three anymore.
    // .max(20) (security audit 2026-09-30): each row is its own insert in
    // one transaction, so an unbounded list let a single request tie up a
    // DB connection and a process on a host already at its process cap.
    packages: z.array(legacyPackage).max(20, "Too many packages in one request.").nullish(),
    box_details: z.array(boxDetail).max(20, "Too many packages in one request.").nullish(),
    television_details: z.array(televisionDetail).max(20, "Too many packages in one request.").nullish(),
    auto_details: z.array(autoDetail).max(20, "Too many packages in one request.").nullish(),

    contact: quoteContact,
  })
  // withValidator: allowed package types only. Per-type detail rows (box/tv/
  // auto dimensions) are no longer required from the public form — the
  // customer picks a callback window instead, and staff capture exact
  // package details on the call.
  .superRefine((data, ctx) => {
    const selected = selectedPackageTypes(data.package_type);
    const allowed = ["envelope", "box", "boxes", "television", "furniture", "auto", "packers_movers"];

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
  });

export type QuoteStoreInput = z.infer<typeof quoteStoreInput>;
