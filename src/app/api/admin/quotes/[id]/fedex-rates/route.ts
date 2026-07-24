import { z } from "zod";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { isUnitedStates, normalizeCode } from "@/lib/countries";
import { FedExClient } from "@/lib/fedex/client";
import { FedExRateQuoteService, type ShipmentInput } from "@/lib/fedex/rate-quote";
import { parseId } from "@/lib/list-query";
import {
  getFedexMarkupInternationalPercentage,
  getFedexMarkupPercentage,
} from "@/lib/settings";
import { HttpError } from "@/lib/validation/errors";
import { packageDetailOverride } from "@/lib/validation/calculate";

type Ctx = { params: Promise<{ id: string }> };

// Optional re-rate overrides (R27): validated with the same numeric rules as
// calculate so untrusted dimension overrides never reach FedEx unchecked.
// Passed as a single URL-encoded JSON `overrides` query param; absent = rate
// the stored quote data as-is.
const rerateOverrides = z.object({
  is_residence: z.coerce.boolean().optional(),
  package_type: z.string().max(255).optional(),
  ship_date: z.string().max(20).optional(),
  pickup_type: z.string().max(64).optional(),
  packaging_type: z.string().max(64).optional(),
  total_chargeable_weight: z.coerce.number().min(0).optional(),
  box_details: z.array(packageDetailOverride).optional(),
  television_details: z.array(packageDetailOverride).optional(),
  auto_details: z.array(z.record(z.string(), z.unknown())).optional(),
});

const asArray = (v: unknown) => (Array.isArray(v) ? (v as Record<string, unknown>[]) : []);

export const GET = adminRoute<Ctx>(async (req, ctx) => {
  const id = parseId((await ctx.params).id);
  const quote = id !== null ? await db.quote.findUnique({ where: { id } }) : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  const raw = new URL(req.url).searchParams.get("overrides");
  // JSON.parse throwing SyntaxError → 400 via toErrorResponse; schema fail → 422.
  const o = raw ? rerateOverrides.parse(JSON.parse(raw)) : {};

  const shipment: ShipmentInput = {
    from_zip: quote.fromZip,
    to_zip: quote.toZip,
    is_residence: o.is_residence ?? quote.isResidence,
    package_type: o.package_type ?? quote.packageType,
    box_details: o.box_details ?? asArray(quote.boxData),
    television_details: o.television_details ?? asArray(quote.televisionData),
    auto_details: o.auto_details ?? asArray(quote.autoData),
    total_chargeable_weight:
      o.total_chargeable_weight ?? Number(quote.totalChargeableWeight ?? 0),
    ship_date: o.ship_date ?? null,
    pickup_type: o.pickup_type ?? null,
    packaging_type: o.packaging_type ?? null,
  };

  const service = new FedExRateQuoteService(new FedExClient());
  const domestic = isUnitedStates(quote.fromCountry) && isUnitedStates(quote.toCountry);

  // US↔US → domestic path + domestic markup (unchanged). Any other route →
  // international parcel rating + international markup. `automated: true` marks
  // that a live rating was attempted; A4.3's manual override is the fallback
  // when success is false.
  const result = domestic
    ? await service.quote(shipment, await getFedexMarkupPercentage())
    : await service.quoteInternational(
        shipment,
        normalizeCode(quote.fromCountry),
        normalizeCode(quote.toCountry),
        await getFedexMarkupInternationalPercentage(),
      );

  return Response.json({ ...result, automated: true });
});
