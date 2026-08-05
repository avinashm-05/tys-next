import { FedExError, type FedExRequester } from "./client";
import { fedexConfig, PACKAGE_DEFAULTS } from "./config";

// Verbatim port of App\Services\FedEx\FedExRateQuoteService.
const KG_TO_LB = 2.20462;

const SERVICE_NAMES: Record<string, string> = {
  FEDEX_GROUND: "FedEx Ground",
  GROUND_HOME_DELIVERY: "FedEx Home Delivery",
  FEDEX_2_DAY: "FedEx 2 Day",
  FEDEX_2_DAY_AM: "FedEx 2 Day AM",
  FEDEX_EXPRESS_SAVER: "FedEx Express Saver",
  STANDARD_OVERNIGHT: "FedEx Standard Overnight",
  PRIORITY_OVERNIGHT: "FedEx Priority Overnight",
  FIRST_OVERNIGHT: "FedEx First Overnight",
  SMART_POST: "FedEx Ground Economy",
  // International parcel services (net-new path). Unknown types still fall
  // back to a Title-cased label via resolveServiceName.
  INTERNATIONAL_PRIORITY: "FedEx International Priority",
  FEDEX_INTERNATIONAL_PRIORITY: "FedEx International Priority",
  INTERNATIONAL_PRIORITY_EXPRESS: "FedEx International Priority Express",
  INTERNATIONAL_ECONOMY: "FedEx International Economy",
  INTERNATIONAL_FIRST: "FedEx International First",
  FEDEX_INTERNATIONAL_CONNECT_PLUS: "FedEx International Connect Plus",
  INTERNATIONAL_GROUND: "FedEx International Ground",
};

// Generic, human-readable descriptions for the customs commodity placeholder
// (see buildPlaceholderCommodity) — just enough for FedEx's validation to
// accept the request, not a real customs declaration.
const COMMODITY_LABELS: Record<string, string> = {
  box: "Personal effects",
  boxes: "Personal effects",
  television: "Consumer electronics",
  envelope: "Documents",
  furniture: "Household goods",
  auto: "Motor vehicle",
  packers_movers: "Household goods",
};

// PHP round() (half away from zero) to 2 dp. EPSILON nudge avoids binary-float
// truncation on the exact-.005 boundary. ponytail: matches all recorded
// fixtures; if a future value lands on a float edge, swap for a decimal lib.
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

type Detail = Record<string, unknown>;
type LineItem = Record<string, unknown>;

export type ParsedRate = {
  service_type: string;
  service_name: string;
  currency: string;
  save_percent: number | null;
  estimated_delivery: string;
  // Marked-up figures (what the Laravel quote() returned):
  total_charge: number;
  retail_charge: number | null;
  per_lb_rate: number | null;
  // Pre-markup figures, exposed for A4.3's dual display:
  raw_total_charge: number;
  raw_retail_charge: number | null;
  raw_per_lb_rate: number | null;
};

export type ShipmentInput = {
  from_zip: string;
  to_zip: string;
  is_residence?: boolean;
  package_type: string;
  box_details?: Detail[];
  television_details?: Detail[];
  auto_details?: Detail[];
  total_chargeable_weight?: number | null;
  ship_date?: string | null;
  pickup_type?: string | null;
  packaging_type?: string | null;
};

export type QuoteResult =
  | {
      success: true;
      rates: ParsedRate[];
      markupPercent: number;
      // International results only — transport charges, no duties/taxes.
      dutiesTaxesIncluded?: boolean;
    }
  | { success: false; message: string };

export class FedExRateQuoteService {
  private cfg = fedexConfig();

  constructor(private client: FedExRequester) {}

  /**
   * Domestic US↔US rating (unchanged from A4.2, fixture-verified).
   * `markupPercent` is the DOMESTIC markup, applied to total/retail/per-lb
   * exactly as the Laravel parseRates() did.
   */
  async quote(shipment: ShipmentInput, markupPercent = 0): Promise<QuoteResult> {
    return this.rate(shipment, "US", "US", markupPercent);
  }

  /**
   * International parcel rating (net-new; built to the FedEx Rate API, not
   * ported). Reuses the exact same line-item builder and parse path as
   * domestic, but sends the real origin/destination country codes and applies
   * the INTERNATIONAL markup. Transport charges only: freight services are
   * excluded (parcels-only rule) and dutiesTaxesIncluded is false — no
   * customs/duties/taxes estimation is attempted. Customs clearance is on by
   * default (see `rate()`'s customsClearance opt) — FedEx's international
   * parcel rate types need a customs declaration on the request to be
   * returned at all; without one, cross-border requests can silently come
   * back short of the services a dutiable shipment actually qualifies for.
   */
  async quoteInternational(
    shipment: ShipmentInput,
    originCountry: string,
    destCountry: string,
    markupPercent = 0,
  ): Promise<QuoteResult> {
    const result = await this.rate(shipment, originCountry, destCountry, markupPercent, {
      filterFreight: true,
      customsClearance: true,
    });
    return result.success ? { ...result, dutiesTaxesIncluded: false } : result;
  }

  /**
   * Shared rate call. The ONLY thing that differs between domestic and
   * international is the shipper/recipient countryCode plus (international
   * only) the customs declaration — the account check, line-item build,
   * payload shape, request, and parse are otherwise identical, so the
   * fixture-verified domestic output is preserved byte-for-byte (guarded by
   * `npm run fedex:check`). Domestic passes ("US","US") and never sets
   * customsClearance, so its payload is byte-for-byte unchanged.
   */
  private async rate(
    shipment: ShipmentInput,
    originCountry: string,
    destCountry: string,
    markupPercent: number,
    opts: { filterFreight?: boolean; customsClearance?: boolean } = {},
  ): Promise<QuoteResult> {
    const accountNumber = this.cfg.accountNumber.trim();
    if (accountNumber === "") {
      return { success: false, message: "FedEx account number is not configured." };
    }

    const lineItems = this.buildPackageLineItems(shipment);
    if (lineItems.length === 0) {
      return { success: false, message: "No package details were provided for rate quoting." };
    }

    const payload = {
      accountNumber: { value: accountNumber },
      rateRequestControlParameters: { returnTransitTimes: true },
      requestedShipment: {
        shipper: { address: { postalCode: shipment.from_zip, countryCode: originCountry } },
        recipient: {
          address: {
            postalCode: shipment.to_zip,
            countryCode: destCountry,
            residential: Boolean(shipment.is_residence ?? false),
          },
        },
        shipDateStamp: shipment.ship_date ?? new Date().toISOString().slice(0, 10),
        pickupType: shipment.pickup_type ?? this.cfg.pickupType,
        rateRequestType: this.cfg.rateRequestTypes,
        // Required by FedEx production (sandbox never enforced it, confirmed
        // via a live production rate call returning ACCOUNT.NUMBER.MISMATCH
        // without this) — SENDER-pay must name the payor account explicitly,
        // and it has to match accountNumber above.
        shippingChargesPayment: {
          paymentType: "SENDER",
          payor: { responsibleParty: { accountNumber: { value: accountNumber } } },
        },
        requestedPackageLineItems: lineItems,
        // International only, on by default (see quoteInternational): tells
        // FedEx this is a dutiable cross-border shipment, sender pays duties.
        // `commodities` is required too — confirmed live against production
        // 2026-08-06 (the earlier "minimal declaration, no per-commodity
        // value/description" note above was wrong for production; sandbox
        // never enforced it, same pattern as the accountNumber/payor fix
        // above). This is a real quote-request submission, not a booked
        // shipment — the customer hasn't given a declared value yet, so this
        // is a rough placeholder good enough to make FedEx return a rate; a
        // real Ship-time booking flow must collect the actual declared
        // value/description before creating a label. `unitPrice`/
        // `customsValue` don't feed the returned freight charge itself
        // (rateRequestType here is ["ACCOUNT","LIST"], not a duties/taxes
        // estimate) — they only need to be present and non-zero to pass
        // FedEx's validation.
        ...(opts.customsClearance
          ? {
              customsClearanceDetail: {
                dutiesPayment: { paymentType: "SENDER" },
                commodities: [this.buildPlaceholderCommodity(shipment, originCountry, lineItems)],
              },
            }
          : {}),
      },
    };

    let response: Record<string, unknown>;
    try {
      response = await this.client.request(
        "POST",
        this.cfg.ratesQuotesEndpoint,
        payload,
        { "X-locale": this.cfg.locale },
      );
    } catch (e) {
      if (e instanceof FedExError) {
        console.error("[fedex] Rate Quote API failed", {
          status: e.httpStatus,
          error_body: e.errorBody,
          message: e.message,
        });
        return { success: false, message: this.extractErrorMessage(e) };
      }
      throw e;
    }

    let rates = this.parseRates(
      response,
      Number(shipment.total_chargeable_weight ?? 0),
      markupPercent,
    );
    // Parcels only (hard rule): drop any freight services FedEx surfaces on the
    // international path. Domestic never sets this, so its output is unchanged.
    if (opts.filterFreight) {
      rates = rates.filter((r) => !r.service_type.toUpperCase().includes("FREIGHT"));
    }
    if (rates.length === 0) {
      return { success: false, message: "No FedEx rates were returned for this shipment." };
    }
    return { success: true, rates, markupPercent };
  }

  private buildPackageLineItems(shipment: ShipmentInput): LineItem[] {
    const selectedTypes = this.normalizePackageTypes(shipment.package_type);
    const packagingType = shipment.packaging_type ?? "YOUR_PACKAGING";
    let lineItems: LineItem[] = [];

    if (selectedTypes.includes("box")) {
      for (const detail of shipment.box_details ?? []) {
        lineItems = lineItems.concat(this.buildDimensionalLineItems(detail, packagingType));
      }
    }
    if (selectedTypes.includes("television")) {
      for (const detail of shipment.television_details ?? []) {
        lineItems = lineItems.concat(this.buildDimensionalLineItems(detail, packagingType));
      }
    }
    if (selectedTypes.includes("envelope")) {
      const item = this.buildDefaultLineItem("envelope");
      if (item) lineItems.push(item);
    }
    if (selectedTypes.includes("furniture")) {
      const item = this.buildDefaultLineItem("furniture");
      if (item) lineItems.push(item);
    }
    if (selectedTypes.includes("packers_movers")) {
      const item = this.buildDefaultLineItem("packers_movers");
      if (item) lineItems.push(item);
    }
    if (selectedTypes.includes("auto")) {
      const autoDetails = shipment.auto_details ?? [];
      if (autoDetails.length === 0) {
        lineItems = lineItems.concat(this.buildDefaultLineItemsForType("auto", 1));
      } else {
        // One default auto line item per provided auto detail (dims ignored —
        // autos always use config defaults, verbatim).
        for (let i = 0; i < autoDetails.length; i++) {
          lineItems = lineItems.concat(this.buildDefaultLineItemsForType("auto", 1));
        }
      }
    }

    return lineItems.filter(Boolean);
  }

  // customsClearanceDetail.commodities — required by FedEx production for any
  // dutiable (international) rate quote (see the call site's comment). One
  // aggregate line for the whole shipment is enough to satisfy validation;
  // FedEx doesn't require it to be split per package for a rate-only request
  // the way a real Ship API booking would. Values here are a rate-quoting
  // placeholder, not a customs declaration — nothing about this shipment's
  // actual contents/value has been collected from the customer at quote time.
  private buildPlaceholderCommodity(
    shipment: ShipmentInput,
    originCountry: string,
    lineItems: LineItem[],
  ): Record<string, unknown> {
    const totalWeightLb = lineItems.reduce((sum, item) => {
      const w = item.weight as { value?: number } | undefined;
      return sum + Number(w?.value ?? 0);
    }, 0);
    const label = COMMODITY_LABELS[this.normalizePackageTypes(shipment.package_type)[0] ?? ""] ?? "Merchandise";
    return {
      description: label,
      countryOfManufacture: originCountry,
      quantity: 1,
      quantityUnits: "PCS",
      weight: { units: "LB", value: round2(Math.max(totalWeightLb, 0.1)) },
      unitPrice: { amount: 100, currency: "USD" },
      customsValue: { amount: 100, currency: "USD" },
    };
  }

  private buildDimensionalLineItems(detail: Detail, packagingType: string): LineItem[] {
    // A box/TV row with no weight entered yet (weight null/0 — e.g. a
    // PackageDetail row created but never filled in by staff) must NOT
    // silently become a rate request. splitWeightIntoLineItems floors weight
    // at 0.1lb to avoid a divide-by-zero loop for the *default-profile* path
    // (envelope/furniture/auto, which always has a real weight ≥1lb from
    // PACKAGE_DEFAULTS) — reusing that same floor here would instead send
    // FedEx a fake "0.1lb, 0×0×0in" phantom package for a row that's simply
    // incomplete, and FedEx happily returns a real-looking but meaningless
    // rate for it (confirmed live, 2026-08-06). Skipping the row here means
    // an all-incomplete package list correctly falls through to the existing
    // "No package details were provided" error instead.
    if (Number(detail.weight ?? 0) <= 0) return [];
    const quantity = Math.max(Math.trunc(Number(detail.quantity ?? 1)), 1);
    const isMetric = String(detail.weight_unit ?? "lb").toLowerCase() === "kg";
    const weightLb = this.convertWeightToPounds(
      Number(detail.weight ?? 0),
      String(detail.weight_unit ?? "lb"),
    );
    // The combined unit toggle (kg/cm vs lb/in, matching the public quote
    // wizard) means dimensions ride the same weight_unit — FedEx's Rate API
    // accepts either "IN" or "CM" for dimensions.units directly, so this only
    // needs the right label, not a numeric conversion.
    const dimensions = {
      length: Math.floor(Number(detail.length ?? 0)),
      width: Math.floor(Number(detail.width ?? 0)),
      height: Math.floor(Number(detail.height ?? 0)),
      units: isMetric ? "CM" : "IN",
    };

    let lineItems: LineItem[] = [];
    for (let i = 0; i < quantity; i++) {
      lineItems = lineItems.concat(this.splitWeightIntoLineItems(weightLb, dimensions, packagingType));
    }
    return lineItems;
  }

  private buildDefaultLineItemsForType(type: string, quantity: number): LineItem[] {
    const lineItems: LineItem[] = [];
    for (let i = 0; i < Math.max(quantity, 1); i++) {
      const item = this.buildDefaultLineItem(type);
      if (item) lineItems.push(item);
    }
    return lineItems;
  }

  private buildDefaultLineItem(type: string): LineItem | null {
    const defaults = PACKAGE_DEFAULTS[type];
    if (!defaults) return null;
    const dimensions = {
      length: Math.trunc(defaults.length_in ?? 1),
      width: Math.trunc(defaults.width_in ?? 1),
      height: Math.trunc(defaults.height_in ?? 1),
      units: "IN",
    };
    const weightLb = Number(defaults.weight_lb ?? 1);
    const packagingType = String(defaults.packaging_type ?? "YOUR_PACKAGING");
    return this.splitWeightIntoLineItems(weightLb, dimensions, packagingType)[0];
  }

  private splitWeightIntoLineItems(
    weightLb: number,
    dimensions: Record<string, unknown>,
    packagingType: string,
  ): LineItem[] {
    const maxWeight = this.cfg.maxParcelWeightLb;
    const lineItems: LineItem[] = [];
    let remaining = Math.max(weightLb, 0.1);

    while (remaining > 0) {
      const chunkWeight = Math.min(remaining, maxWeight);
      const lineItem: LineItem = {
        weight: { units: "LB", value: round2(chunkWeight) },
        dimensions,
        groupPackageCount: 1,
      };
      if (packagingType !== "") lineItem.packagingType = packagingType;
      lineItems.push(lineItem);
      remaining = round2(remaining - chunkWeight);
    }
    return lineItems;
  }

  private parseRates(
    response: Record<string, unknown>,
    totalChargeableWeight: number,
    markupPercent: number,
  ): ParsedRate[] {
    const multiplier = 1 + markupPercent / 100;
    const output = (response.output ?? {}) as { rateReplyDetails?: Detail[] };
    const rates: ParsedRate[] = [];

    for (const detail of output.rateReplyDetails ?? []) {
      const parsed = this.parseRateDetail(detail, totalChargeableWeight);
      if (parsed === null) continue;
      rates.push({
        ...parsed,
        total_charge: round2(parsed.raw_total_charge * multiplier),
        retail_charge:
          parsed.raw_retail_charge !== null ? round2(parsed.raw_retail_charge * multiplier) : null,
        per_lb_rate:
          parsed.raw_per_lb_rate !== null ? round2(parsed.raw_per_lb_rate * multiplier) : null,
      });
    }
    return rates;
  }

  private parseRateDetail(
    detail: Detail,
    totalChargeableWeight: number,
  ): ParsedRate | null {
    const serviceType = String(detail.serviceType ?? "");
    if (serviceType === "") return null;

    let accountCharge: number | null = null;
    let listCharge: number | null = null;
    let currency = "USD";

    const ratedDetails = (detail.ratedShipmentDetails ?? []) as Detail[];
    for (const ratedDetail of ratedDetails) {
      const rateType = String(ratedDetail.rateType ?? "").toUpperCase();
      const charge = this.extractChargeAmount(ratedDetail);
      if (charge === null) continue;
      currency = charge.currency;
      if (rateType === "ACCOUNT") accountCharge = charge.amount;
      if (rateType === "LIST") listCharge = charge.amount;
    }

    if (accountCharge === null && listCharge === null) {
      const fallback = this.extractChargeAmount(ratedDetails[0] ?? {});
      if (fallback === null) return null;
      accountCharge = fallback.amount;
      currency = fallback.currency;
    }

    const totalCharge = accountCharge ?? listCharge;
    if (totalCharge === null) return null;

    const retailCharge = listCharge;
    let savePercent: number | null = null;
    if (retailCharge !== null && retailCharge > totalCharge) {
      savePercent = Math.round(((retailCharge - totalCharge) / retailCharge) * 100);
    }

    let perLbRate: number | null = null;
    if (totalChargeableWeight > 0) {
      perLbRate = round2(totalCharge / totalChargeableWeight);
    }

    const rawTotal = round2(totalCharge);
    const rawRetail = retailCharge !== null ? round2(retailCharge) : null;
    return {
      service_type: serviceType,
      service_name: this.resolveServiceName(serviceType),
      currency,
      save_percent: savePercent,
      estimated_delivery: this.resolveEstimatedDelivery(detail),
      // marked-up fields overwritten by parseRates; seeded with raw for safety
      total_charge: rawTotal,
      retail_charge: rawRetail,
      per_lb_rate: perLbRate,
      raw_total_charge: rawTotal,
      raw_retail_charge: rawRetail,
      raw_per_lb_rate: perLbRate,
    };
  }

  private extractChargeAmount(ratedDetail: Detail): { amount: number; currency: string } | null {
    const srd = (ratedDetail.shipmentRateDetail ?? {}) as Detail;
    const candidates = [
      ratedDetail.totalNetCharge,
      ratedDetail.totalNetFedExCharge,
      srd.totalNetCharge,
      srd.totalNetFedExCharge,
    ];
    for (const candidate of candidates) {
      const parsed = this.normalizeMoneyValue(candidate);
      if (parsed !== null) return parsed;
    }
    return null;
  }

  private normalizeMoneyValue(value: unknown): { amount: number; currency: string } | null {
    if (value !== null && typeof value === "object") {
      const v = value as Record<string, unknown>;
      const amount = v.amount ?? v.value;
      if (amount === null || amount === undefined || isNaN(Number(amount))) return null;
      return { amount: Number(amount), currency: String(v.currency ?? "USD") };
    }
    if (value !== null && value !== undefined && !isNaN(Number(value))) {
      return { amount: Number(value), currency: "USD" };
    }
    return null;
  }

  private resolveEstimatedDelivery(detail: Detail): string {
    const opDetail = (detail.operationalDetail ?? {}) as Detail;
    const operationalDate = opDetail.deliveryDate;
    if (typeof operationalDate === "string" && operationalDate !== "") return operationalDate;

    const commit = (detail.commit ?? {}) as Detail;
    const dateDetail = (commit.dateDetail ?? {}) as Detail;
    const commitDate = dateDetail.dayFormat ?? dateDetail.date;
    if (typeof commitDate === "string" && commitDate !== "") return commitDate;

    return "N/A";
  }

  private resolveServiceName(serviceType: string): string {
    if (SERVICE_NAMES[serviceType]) return SERVICE_NAMES[serviceType];
    const label = serviceType.replace(/_/g, " ").toLowerCase();
    return label.replace(/\b\w/g, (c) => c.toUpperCase()); // ucwords
  }

  private convertWeightToPounds(weight: number, unit: string): number {
    if (unit.toLowerCase() === "kg") return round2(weight * KG_TO_LB);
    return round2(weight);
  }

  private normalizePackageTypes(packageType: string): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of packageType.split(",")) {
      const t = raw.trim().toLowerCase();
      if (!t) continue;
      const canonical =
        t === "envelop" ? "envelope" : t === "boxes" ? "box" : t === "tv" ? "television" : t;
      if (!seen.has(canonical)) {
        seen.add(canonical);
        result.push(canonical);
      }
    }
    return result;
  }

  private extractErrorMessage(exception: FedExError): string {
    const errors = (exception.errorBody.errors ?? []) as { message?: string }[];
    for (const error of errors) {
      if (error.message) return String(error.message);
    }
    return exception.message;
  }
}
