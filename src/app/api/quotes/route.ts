import { db } from "@/lib/db";
import { publicApiRoute } from "@/lib/public-route";
import { emptyStringsToNull } from "@/lib/validation/common";
import { TIME_SLOTS, quoteStoreInput } from "@/lib/validation/quote-store";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
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
// → send emails inline (failure-safe). Honors R1 (CSV backend names), R3
// (decimals as strings), R8 (car_year string).
//
// No FedEx auto-rating here (deliberate, as of the /quotes consolidation):
// the public form now collects a callback window instead of package
// dimensions, so there's nothing to rate yet — every quote is created with a
// NULL estimatedCost, and staff pull live rates on demand from the admin
// quote detail page's "Get live rates" panel (POST
// /api/admin/quotes/[id]/fedex-rates) once they've talked to the customer
// and filled in the real package details.

const TIME_SLOT_LABELS: Record<string, string> = Object.fromEntries(
  TIME_SLOTS.map((s) => [s.value, `${s.label} (${s.hint})`]),
);

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
  const { quoteId } = await db.$transaction(async (tx) => {
    const quote = await tx.quote.create({
      data: {
        fromCountry: data.from_country,
        // Not collected by the single-page public form (just the countries) —
        // staff capture the exact zips on the callback and add them via the
        // admin editor. Still honored when a caller does supply them.
        fromZip: data.from_zip ?? "",
        toCountry: data.to_country,
        toZip: data.to_zip ?? "",
        isResidence: data.is_residence ?? false,
        packageType: packageTypeCsv,
        name: contact.name,
        email: contact.email,
        mobileNumber: `${contact.country_code ?? ""} ${contact.phone ?? ""}`.trim(),
        boxData: clean(boxDetails),
        televisionData: clean(televisionDetails),
        autoData: clean(autoDetails),
        preferredTimeSlot: data.time_slot,
        timezone: data.timezone,
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
        // The public wizard stopped asking for a callback slot (2026-08-15)
        // and now only infers the timezone, so show whichever we actually
        // have. Both are optional; the email omits the row when it's empty.
        callbackWindow: data.time_slot
          ? `${TIME_SLOT_LABELS[data.time_slot] ?? data.time_slot}${data.timezone ? ` (${data.timezone})` : ""}`
          : data.timezone || undefined,
        adminUrl: `${(process.env.BETTER_AUTH_URL ?? "").replace(/\/+$/, "")}/admin/quotes/${Number(full.id)}`,
      });
    } catch {
      /* admin notification is best-effort too. */
    }
  }

  return Response.json(
    { message: "Your quote request has been submitted successfully!", quote_id: Number(quoteId) },
    { status: 201 },
  );
});
