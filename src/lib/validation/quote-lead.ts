import { z } from "zod";
import { quoteContact } from "@/lib/validation/quote-store";

// Partial quote lead (POST /api/quote-leads), saved from the /quotes wizard
// as soon as its first step (contact details) is valid. Same contact schema
// as the full quote, so the two can never disagree about what's valid.
// `token` is present when the browser is updating the lead it already made
// (e.g. adding the route after step 2, or after going back to fix a typo).
export const quoteLeadInput = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/).nullish(),
  contact: quoteContact,
  from_country: z.string().max(50).nullish(),
  to_country: z.string().max(50).nullish(),
});

export const quoteLeadConvertInput = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{20,64}$/),
  quote_id: z.coerce.number().int().positive(),
});
