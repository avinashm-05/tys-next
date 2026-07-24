import { z } from "zod";

// VendorMapController inline validations (04-validation table).
const lat = z.coerce
  .number({ error: "The latitude must be between -90 and 90." })
  .min(-90, "The latitude must be between -90 and 90.")
  .max(90, "The latitude must be between -90 and 90.");
const lng = z.coerce
  .number({ error: "The longitude must be between -180 and 180." })
  .min(-180, "The longitude must be between -180 and 180.")
  .max(180, "The longitude must be between -180 and 180.");

export const mapBoundsInput = z.object({
  bounds: z.object({
    sw: z.object({ lat, lng }),
    ne: z.object({ lat, lng }),
  }),
  status: z.enum(["all", "active", "inactive"]).optional(),
  vendor_type_id: z.coerce.number().int().nullish(),
});
export type MapBoundsInput = z.infer<typeof mapBoundsInput>;

export const mapRadiusInput = z.object({
  lat,
  lng,
  radius: z.coerce
    .number({ error: "The radius must be between 0.1 and 500." })
    .min(0.1, "The radius must be between 0.1 and 500.")
    .max(500, "The radius must be between 0.1 and 500."),
  unit: z.enum(["miles", "kilometers"]),
  status: z.enum(["all", "active", "inactive"]).optional(),
  vendor_type_id: z.coerce.number().int().nullish(),
});
export type MapRadiusInput = z.infer<typeof mapRadiusInput>;

export const mapSearchInput = z.object({
  query: z
    .string({ error: "The query field is required." })
    .min(2, "The query field must be at least 2 characters.")
    .max(255, "The query field must not be greater than 255 characters."),
});

export const geocodeInput = z.object({
  address: z
    .string({ error: "The address field is required." })
    .min(1, "The address field is required.")
    .max(500, "The address field must not be greater than 500 characters."),
});

export const INVALID_VENDOR_TYPE_MESSAGE = "The selected vendor type is invalid.";
