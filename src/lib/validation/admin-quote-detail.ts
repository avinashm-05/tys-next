import { z } from "zod";
import { weightUnit } from "@/lib/validation/common";

// Server-side shape for PATCH /api/admin/quotes/[id] — the admin detail
// editor's Save/Save & Exit. Deliberately permissive compared to the public
// quoteStoreInput: staff can leave a field blank mid-edit without the whole
// save failing, since this is an internal tool, not a customer-facing form.

export const adminPackageRowInput = z.object({
  // Negative ids are client-generated temp ids for a row added in this
  // session (see quote-detail-editor.tsx's emptyPackage()) — the route
  // creates a new PackageDetail row for those instead of updating one.
  id: z.coerce.number(),
  package_type: z.string().min(1, "Please select a package type.").max(50),
  quantity: z.coerce.number().int().min(1).default(1),
  weight: z.coerce.number().min(0).nullish(),
  weight_unit: weightUnit.nullish(),
  length: z.coerce.number().min(0).nullish(),
  width: z.coerce.number().min(0).nullish(),
  height: z.coerce.number().min(0).nullish(),
  brand_name: z.string().max(255).nullish(),
  tv_model: z.string().max(255).nullish(),
  car_model: z.string().max(255).nullish(),
  car_year: z.coerce.string().max(10).nullish(),
});

export const adminQuoteDetailInput = z.object({
  from_country: z.string().min(1, "Please enter the origin country.").max(50),
  from_zip: z.string().max(20).nullish(),
  to_country: z.string().min(1, "Please enter the destination country.").max(50),
  to_zip: z.string().max(20).nullish(),
  is_residence: z.boolean(),
  contact: z.object({
    name: z.string().max(255).nullish(),
    email: z.string().max(255).nullish(),
    country_code: z.string().max(10).nullish(),
    phone: z.string().max(30).nullish(),
  }),
  packages: z.array(adminPackageRowInput),
});
export type AdminQuoteDetailInput = z.infer<typeof adminQuoteDetailInput>;

export const quoteNoteInput = z.object({
  comment: z.string({ error: () => "Please write a comment." }).min(1, "Please write a comment.").max(5000),
});
