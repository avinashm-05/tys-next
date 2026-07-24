import { db } from "@/lib/db";
import { publicApiRoute } from "@/lib/public-route";
import { emptyStringsToNull } from "@/lib/validation/common";
import { quoteStoreInput } from "@/lib/validation/quote-store";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { isUnitedStates } from "@/lib/countries";
import { FedExClient } from "@/lib/fedex/client";
import { FedExRateQuoteService, type ShipmentInput } from "@/lib/fedex/rate-quote";
import { getFedexMarkupPercentage } from "@/lib/settings";
import { generateTrackingToken, trackingUrl } from "@/lib/email-tracking";
import {
  sendAdminQuoteNotification,
  sendQuoteConfirmationEmail,
  type QuoteEmailData,
} from "@/lib/mail";
import { formatPackageTypes } from "@/lib/package-type";
import { decimal2 } from "@/lib/serialize";

// Public port of QuoteController@store (10/min, same-origin) — the only public
// write path. Validate → create the quote + package rows + contact + tracking
// token IN ONE TRANSACTION (no orphaned partial quote on a mid-write failure)
// → rate (US↔US only) → send emails inline (failure-safe). Honors R1 (CSV
// backend names), R3 (decimals as strings), R8 (car_year string), R26
// (estimatedCost = cheapest, US↔US, else NULL). Rating, the estimatedCost
// update, and the emails run OUTSIDE the transaction (slow/external work).

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

type DetailRow = {
  quantity?: number | null;
  weight?: number | null;
  weight_unit?: string | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  chargeable_weight?: number | null;
  brand_name?: string | null;
  tv_model?: string | null;
  car_model?: string | null;
  car_year?: string | null;
};

// R1: canonical backend names, lowercased/trimmed, deduped, order preserved.
function normalizePackageTypes(packageType: string): string[] {
  const mapped = packageType
    .split(",")
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean)
    .map((t) => (t === "envelop" ? "envelope" : t === "boxes" ? "box" : t === "tv" ? "television" : t));
  return [...new Set(mapped)];
}

// Strip undefined so Prisma's Json columns accept the arrays.
const clean = (v: unknown) => JSON.parse(JSON.stringify(v ?? []));

export const POST = publicApiRoute({ name: "quotes.store", limit: 10 }, async (req) => {
  const data = quoteStoreInput.parse(emptyStringsToNull(await req.json()));

  const selected = normalizePackageTypes(data.package_type);
  const packageTypeCsv = selected.join(",");
  const contact = data.contact;

  let boxDetails: DetailRow[] = data.box_details ?? [];
  let televisionDetails: DetailRow[] = data.television_details ?? [];
  const autoDetails: DetailRow[] = data.auto_details ?? [];

  // Legacy `packages` fallback (old submitters; the wizard doesn't send it).
  if (Array.isArray(data.packages) && data.packages.length > 0) {
    if ((selected.includes("box") || selected.includes("boxes")) && boxDetails.length === 0) {
      boxDetails = data.packages as DetailRow[];
    }
    if (selected.includes("television") && televisionDetails.length === 0) {
      televisionDetails = data.packages as DetailRow[];
    }
  }

  const now = new Date();
  const token = generateTrackingToken(); // R23: 64 URL-safe chars

  // Atomic write set: quote + package rows + total + contact + tracking token.
  // A failure anywhere rolls the whole thing back — no orphaned partial quote.
  // storePackageDetails is a closure over `tx` so its type is inferred (the
  // extended client's tx isn't assignable to Prisma.TransactionClient).
  const { quoteId, totalChargeableWeight } = await db.$transaction(async (tx) => {
    const quote = await tx.quote.create({
      data: {
        fromCountry: data.from_country,
        fromZip: data.from_zip,
        toCountry: data.to_country,
        toZip: data.to_zip,
        isResidence: data.is_residence ?? false,
        packageType: packageTypeCsv,
        name: contact.name,
        email: contact.email,
        mobileNumber: `${contact.country_code ?? ""} ${contact.phone ?? ""}`.trim(),
        boxData: clean(boxDetails),
        televisionData: clean(televisionDetails),
        autoData: clean(autoDetails),
        status: "pending",
        createdAt: now,
        updatedAt: now,
      },
    });

    // Persist one package-detail row per detail and return chargeable ×
    // quantity, computing chargeable locally when absent.
    const storePackageDetails = async (
      packageType: string,
      details: DetailRow[],
      hasDimensions = true,
    ): Promise<number> => {
      let sum = 0;
      for (const d of details) {
        const quantity = Number(d.quantity ?? 1);
        const weight = d.weight != null ? Number(d.weight) : null;
        const weightUnit = d.weight_unit ? String(d.weight_unit).toLowerCase() : null;
        let chargeable = d.chargeable_weight != null ? Number(d.chargeable_weight) : null;

        if (hasDimensions && weight !== null && chargeable === null && d.length != null && d.width != null && d.height != null) {
          chargeable = calculateChargeableWeight(
            weight,
            { length: Number(d.length), width: Number(d.width), height: Number(d.height) },
            String(weightUnit),
          );
        }
        if (hasDimensions && weight !== null && chargeable === null) chargeable = weight;

        await tx.packageDetail.create({
          data: {
            quoteId: quote.id,
            packageType,
            quantity: Number.isFinite(quantity) ? quantity : 1,
            weight,
            weightUnit: weightUnit as "lb" | "kg" | null,
            length: d.length ?? null,
            width: d.width ?? null,
            height: d.height ?? null,
            chargeableWeight: chargeable,
            brandName: d.brand_name ?? null,
            tvModel: d.tv_model ?? null,
            carModel: d.car_model ?? null,
            carYear: d.car_year != null ? String(d.car_year) : null, // string (R8)
            createdAt: now,
            updatedAt: now,
          },
        });

        if (chargeable !== null) sum += chargeable * Math.max(quantity, 1);
      }
      return sum;
    };

    let total = 0;
    if (selected.includes("box") || selected.includes("boxes")) {
      total += await storePackageDetails("box", boxDetails, true);
    }
    if (selected.includes("television")) {
      total += await storePackageDetails("television", televisionDetails, true);
    }
    if (selected.includes("auto")) {
      total += await storePackageDetails("auto", autoDetails, false);
    }
    if (total > 0) {
      await tx.quote.update({
        where: { id: quote.id },
        data: { totalChargeableWeight: round2(total).toFixed(2), updatedAt: new Date() }, // R3
      });
    }

    await tx.quoteContact.create({
      data: {
        quoteId: quote.id,
        name: contact.name,
        email: contact.email,
        countryCode: contact.country_code,
        phone: contact.phone,
        createdAt: now,
        updatedAt: now,
      },
    });

    // R25: create the tracking-stat row explicitly (part of the atomic set).
    await tx.quoteEmailStatistic.create({
      data: { quoteId: quote.id, trackingToken: token, openCount: 0, createdAt: now, updatedAt: now },
    });

    return { quoteId: quote.id, totalChargeableWeight: total };
  });

  // R26: auto-rate only US↔US (and only when FedEx is enabled); everything else
  // is created with a NULL cost for staff to price in the admin workstation.
  const isDomesticUs = isUnitedStates(data.from_country) && isUnitedStates(data.to_country);
  const fedexEnabled = (process.env.FEDEX_ENABLED ?? "true").toLowerCase() !== "false";
  const showFedexRates = isDomesticUs && fedexEnabled;

  let rates: unknown[] = [];
  let ratesError: string | null = null;
  let estimatedCost: number | null = null;
  let currency = "USD";

  if (showFedexRates) {
    const shipment: ShipmentInput = {
      from_zip: data.from_zip,
      to_zip: data.to_zip,
      is_residence: data.is_residence ?? false,
      package_type: packageTypeCsv,
      box_details: clean(boxDetails),
      television_details: clean(televisionDetails),
      auto_details: clean(autoDetails),
      total_chargeable_weight: totalChargeableWeight,
    };
    const result = await new FedExRateQuoteService(new FedExClient()).quote(
      shipment,
      await getFedexMarkupPercentage(),
    );
    if (result.success) {
      rates = result.rates;
      const cheapest = [...result.rates].sort((a, b) => a.total_charge - b.total_charge)[0];
      if (cheapest) {
        estimatedCost = cheapest.total_charge;
        currency = cheapest.currency ?? "USD";
      }
    } else {
      ratesError = result.message;
    }
    if (estimatedCost !== null) {
      await db.quote.update({
        where: { id: quoteId },
        data: { estimatedCost: estimatedCost.toFixed(2), currency, updatedAt: new Date() }, // R3
      });
    }
  }

  // Emails inline (no worker). A failure must NOT fail quote creation — log +
  // continue (the quote is already committed). Re-read with packages so the
  // confirmation body matches the admin "send" assembly exactly.
  const full = await db.quote.findUnique({ where: { id: quoteId }, include: { packages: true } });
  if (full) {
    const weightUnit = full.packages[0]?.weightUnit ?? "";
    const emailData: QuoteEmailData = {
      to: contact.email,
      contactName: contact.name,
      customerName: full.name ?? contact.name,
      customerEmail: full.email ?? contact.email,
      mobileNumber: full.mobileNumber ?? `${contact.country_code} ${contact.phone}`.trim(),
      fromCountry: full.fromCountry,
      fromZip: full.fromZip,
      toCountry: full.toCountry,
      toZip: full.toZip,
      isResidence: full.isResidence,
      packageTypeLabel: formatPackageTypes(full.packageType),
      boxes: full.packages
        .filter((p) => p.packageType === "box" || p.packageType === "boxes")
        .map((p) => ({
          quantity: p.quantity,
          weight: decimal2(p.weight),
          weightUnit,
          length: decimal2(p.length),
          width: decimal2(p.width),
          height: decimal2(p.height),
          chargeableWeight: decimal2(p.chargeableWeight),
        })),
      televisions: full.packages
        .filter((p) => p.packageType === "television")
        .map((p) => ({
          brandName: p.brandName,
          tvModel: p.tvModel,
          quantity: p.quantity,
          weight: decimal2(p.weight),
          weightUnit,
          length: decimal2(p.length),
          width: decimal2(p.width),
          height: decimal2(p.height),
        })),
      autos: full.packages
        .filter((p) => p.packageType === "auto")
        .map((p) => ({
          brandName: p.brandName,
          carModel: p.carModel,
          carYear: p.carYear, // string passthrough (R8)
          quantity: p.quantity,
        })),
      totalChargeableWeight: decimal2(full.totalChargeableWeight),
      weightUnit,
      estimatedCost: decimal2(full.estimatedCost),
      currency: full.currency ?? "USD",
      trackingUrl: trackingUrl(token),
    };
    try {
      await sendQuoteConfirmationEmail(emailData);
    } catch {
      /* sendMail already logged it — never fail the quote on a mail outage. */
    }
    try {
      await sendAdminQuoteNotification({
        quoteId: Number(full.id),
        customerName: emailData.customerName,
        customerEmail: emailData.customerEmail,
        mobileNumber: emailData.mobileNumber,
        fromCountry: full.fromCountry,
        fromZip: full.fromZip,
        toCountry: full.toCountry,
        toZip: full.toZip,
        isResidence: full.isResidence,
        packageTypeLabel: emailData.packageTypeLabel,
        estimatedCost: decimal2(full.estimatedCost),
        currency: full.currency ?? "USD",
        adminUrl: `${(process.env.BETTER_AUTH_URL ?? "").replace(/\/+$/, "")}/admin/quotes/${Number(full.id)}`,
      });
    } catch {
      /* admin notification is best-effort too. */
    }
  }

  const payload: Record<string, unknown> = {
    message: "Your quote request has been submitted successfully!",
    quote_id: Number(quoteId),
    show_fedex_rates: showFedexRates,
  };
  if (showFedexRates) {
    payload.summary = {
      package_label: formatPackageTypes(packageTypeCsv),
      weight_lb: round2(totalChargeableWeight),
      route: `${data.from_zip} → ${data.to_zip}`,
      contact: {
        name: contact.name,
        email: contact.email,
        phone: `${contact.country_code ?? ""} ${contact.phone ?? ""}`.trim(),
      },
    };
    payload.rates = rates;
    payload.rates_error = ratesError;
  }

  return Response.json(payload, { status: 201 });
});
