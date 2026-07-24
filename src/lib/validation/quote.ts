import { z } from "zod";

// UpdateQuoteStatusRequest (04-validation). Enum values match QuoteStatus.
export const quoteStatus = z.enum(["pending", "quoted", "accepted", "cancelled"], {
  error: "The selected status is invalid.",
});

export const updateQuoteStatusInput = z.object({ status: quoteStatus });

export type QuoteStatus = z.infer<typeof quoteStatus>;
