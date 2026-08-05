import { z } from "zod";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { isUnitedStates, normalizeCode } from "@/lib/countries";
import { FedExClient } from "@/lib/fedex/client";
import { rateCredentials } from "@/lib/fedex/config";
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

// FedExRateQuoteService reads box_details/television_details/auto_details —
// snake_case Detail objects (see rate-quote.ts's buildDimensionalLineItems).
// The OLD wizard wrote those as one JSON blob per type on the Quote row
// itself (boxData/televisionData/autoData); this app no longer writes those
// columns for ANY current flow — not the single-page public form, not the
// admin Package card — both write PackageDetail rows instead (`packages`
// relation). Reading only the legacy JSON columns here meant "Get live
// rates" always saw an empty array and failed with "No package details were
// provided" for every quote created since that migration, sandbox or
// production alike (caught while verifying the FedEx production cutover).
// This maps the real rows to the shape FedExRateQuoteService expects.
type PackageRow = {
  packageType: string;
  quantity: number;
  weight: unknown;
  weightUnit: string | null;
  length: unknown;
  width: unknown;
  height: unknown;
};

function detailsFromPackages(packages: PackageRow[], type: "box" | "television"): Record<string, unknown>[] {
  return packages
    .filter((p) => p.packageType === type || (type === "box" && p.packageType === "boxes"))
    .map((p) => ({
      quantity: p.quantity,
      weight: p.weight,
      weight_unit: p.weightUnit ?? "lb",
      length: p.length,
      width: p.width,
      height: p.height,
    }));
}

export const GET = adminRoute<Ctx>(async (req, ctx) => {
  const id = parseId((await ctx.params).id);
  const quote =
    id !== null ? await db.quote.findUnique({ where: { id }, include: { packages: true } }) : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  const raw = new URL(req.url).searchParams.get("overrides");
  // JSON.parse throwing SyntaxError → 400 via toErrorResponse; schema fail → 422.
  const o = raw ? rerateOverrides.parse(JSON.parse(raw)) : {};

  // Legacy JSON columns as a last-resort fallback (a handful of very old
  // quotes from before the PackageDetail-rows migration may still only have
  // those) — real rows win whenever any exist.
  //
  // package_type is the one field that ISN'T covered by that "real rows win"
  // rule below unless we do it explicitly: `quote.packageType` is a snapshot
  // written once when the quote was created (or converted) and the admin
  // PATCH handler (../route.ts) never touches it — it only upserts
  // PackageDetail rows. So a quote created as "envelope" and later edited by
  // staff into a real "box" row (or vice versa) keeps reporting the
  // ORIGINAL type here forever. That silently rates against the wrong
  // profile: a stale "envelope" type ignores the box row entirely and rates
  // a fake default-weight envelope instead (confirmed live, 2026-08-06,
  // same investigation that found the box/TV zero-weight bug in
  // rate-quote.ts). Whenever real PackageDetail rows exist, derive the type
  // list from them — same "real rows win" precedent as box_details/
  // television_details/auto_details below — and only fall back to the
  // stale column for legacy pre-migration quotes with zero rows.
  const packageTypeFromRows = () =>
    Array.from(new Set(quote.packages.map((p) => p.packageType))).join(",");
  const shipment: ShipmentInput = {
    from_zip: quote.fromZip,
    to_zip: quote.toZip,
    is_residence: o.is_residence ?? quote.isResidence,
    package_type:
      o.package_type ?? (quote.packages.length > 0 ? packageTypeFromRows() : quote.packageType),
    box_details:
      o.box_details ?? (quote.packages.length > 0 ? detailsFromPackages(quote.packages, "box") : asArray(quote.boxData)),
    television_details:
      o.television_details ??
      (quote.packages.length > 0 ? detailsFromPackages(quote.packages, "television") : asArray(quote.televisionData)),
    auto_details:
      o.auto_details ??
      (quote.packages.length > 0
        ? quote.packages.filter((p) => p.packageType === "auto").map(() => ({}))
        : asArray(quote.autoData)),
    total_chargeable_weight:
      o.total_chargeable_weight ?? Number(quote.totalChargeableWeight ?? 0),
    ship_date: o.ship_date ?? null,
    pickup_type: o.pickup_type ?? null,
    packaging_type: o.packaging_type ?? null,
  };

  const service = new FedExRateQuoteService(new FedExClient(rateCredentials()));
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
