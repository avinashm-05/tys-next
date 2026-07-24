import type { Prisma } from "@prisma/client";

/**
 * Laravel serializes decimal:2 casts as STRINGS ("120.50") in JSON (R3).
 * Route every Decimal that leaves the API through this so the contract
 * can't drift per endpoint.
 */
export const decimal2 = (v: Prisma.Decimal | null | undefined): string | null =>
  v == null ? null : v.toFixed(2);
