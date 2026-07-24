import { z } from "zod";

// Currencies staff can lock a price in (FedEx returns USD/CAD; manual intl
// covers the common lanes). 422 on anything else (R27).
export const ALLOWED_CURRENCIES = ["USD", "CAD", "GBP", "EUR", "INR", "AUD", "MXN"] as const;

const money = z.coerce
  .number({ error: "The rate must be a number." })
  .positive("The rate must be greater than 0.")
  // Fits the estimated_cost DECIMAL(10,2) column.
  .max(99999999.99, "The rate is too large.");

const currency = z.enum(ALLOWED_CURRENCIES, { error: "The selected currency is invalid." });

/**
 * Two ways to lock a price:
 * - `service`  (domestic): staff picked a rate row; `amount` is that service's
 *   already-marked-up total (markup was applied server-side in the rate call).
 * - `manual`   (international / auto-failed): staff enter a base rate; the
 *   server applies the international markup — never trust a client final (R27).
 */
export const lockPriceInput = z.discriminatedUnion("source", [
  z.object({ source: z.literal("service"), amount: money, currency }),
  z.object({ source: z.literal("manual"), baseRate: money, currency }),
]);

export type LockPriceInput = z.infer<typeof lockPriceInput>;
