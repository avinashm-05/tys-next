import { adminRoute } from "@/lib/auth";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { isUnitedStates, normalizeCode } from "@/lib/countries";
import { FedExClient } from "@/lib/fedex/client";
import { rateCredentials } from "@/lib/fedex/config";
import { FedExRateQuoteService, type ShipmentInput } from "@/lib/fedex/rate-quote";
import {
  getFedexMarkupInternationalPercentage,
  getFedexMarkupPercentage,
} from "@/lib/settings";
import { emptyStringsToNull } from "@/lib/validation/common";
import { priceCheckInput } from "@/lib/validation/price-check";

// A4.4 Price Check — chargeable weight + live FedEx rates for an AD-HOC
// shipment. Pure calculator: NO DB writes, nothing persisted. Mirrors the
// fedex-rates re-rate endpoint's ShipmentInput build + domestic/international
// routing, just from form input instead of a saved quote. Markups applied
// server-side; an international soft failure ({success:false}) is passed
// straight through — never a fabricated rate.

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const POST = adminRoute(async (req) => {
  const data = priceCheckInput.parse(emptyStringsToNull(await req.json()));

  // Chargeable weight per row (dims absent ⇒ dimensional weight 0 ⇒ CW =
  // actual weight), × quantity into the shipment total. Strings per R3.
  const perPackage = data.packages.map((p) => {
    const chargeable = calculateChargeableWeight(
      p.weight,
      { length: p.length ?? 0, width: p.width ?? 0, height: p.height ?? 0 },
      p.weight_unit,
    );
    return { chargeable, quantity: p.quantity };
  });
  const total = round2(
    perPackage.reduce((sum, p) => sum + p.chargeable * Math.max(p.quantity, 1), 0),
  );

  // Generic rows rate exactly like box rows: the engine builds one dimensional
  // parcel line item per unit from weight/dims/quantity (weight-split at the
  // 150 lb parcel max), so package_type "box" is the faithful mapping.
  const shipment: ShipmentInput = {
    from_zip: data.from_zip,
    to_zip: data.to_zip,
    is_residence: data.is_residence ?? false,
    package_type: "box",
    box_details: data.packages.map((p) => ({
      weight: p.weight,
      weight_unit: p.weight_unit,
      length: p.length ?? 0,
      width: p.width ?? 0,
      height: p.height ?? 0,
      quantity: p.quantity,
    })),
    total_chargeable_weight: total,
    packaging_type: data.packaging_type ?? null, // engine defaults YOUR_PACKAGING
    pickup_type: null, // engine defaults from config
  };

  const service = new FedExRateQuoteService(new FedExClient(rateCredentials()));
  const domestic = isUnitedStates(data.from_country) && isUnitedStates(data.to_country);
  const rates = domestic
    ? await service.quote(shipment, await getFedexMarkupPercentage())
    : await service.quoteInternational(
        shipment,
        normalizeCode(data.from_country),
        normalizeCode(data.to_country),
        await getFedexMarkupInternationalPercentage(),
      );

  return Response.json({
    chargeable: {
      perPackage: perPackage.map((p) => ({
        chargeable: round2(p.chargeable).toFixed(2), // R3
        quantity: p.quantity,
      })),
      total: total.toFixed(2), // R3
    },
    rates,
  });
});
