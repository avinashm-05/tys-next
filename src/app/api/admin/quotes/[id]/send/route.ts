import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureTrackingToken, trackingUrl } from "@/lib/email-tracking";
import { sendQuoteConfirmationEmail, type QuoteEmailData } from "@/lib/mail";
import { formatPackageTypes } from "@/lib/package-type";
import { decimal2 } from "@/lib/serialize";
import { parseId } from "@/lib/list-query";
import { HttpError, validationError } from "@/lib/validation/errors";
import { QUOTE_DETAIL_INCLUDE } from "../../helpers";

type Ctx = { params: Promise<{ id: string }> };

// Send the quote-confirmation email to the customer. Guards that a price is
// locked (R26 — can't send an unpriced quote), ensures the tracking token row
// exists (R25), sends inline via Nodemailer, sets pending → quoted, audits.
// (No admin-notification email / auto-send-on-create — that's B2.)
export const POST = adminRoute<Ctx>(async (_req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const quote =
    id !== null
      ? await db.quote.findUnique({ where: { id }, include: QUOTE_DETAIL_INCLUDE })
      : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  if (quote.estimatedCost == null) {
    return validationError({ _: ["Set a price before sending the quote."] });
  }

  const contact = quote.contacts[0];
  const to = contact?.email ?? quote.email;
  if (!to) {
    return validationError({ _: ["This quote has no contact email to send to."] });
  }

  const token = await ensureTrackingToken(quote.id); // R25: explicit, reused if present
  const weightUnit = quote.packages[0]?.weightUnit ?? "";

  const data: QuoteEmailData = {
    to,
    contactName: contact?.name ?? quote.name ?? "",
    customerName: quote.name ?? contact?.name ?? "",
    customerEmail: quote.email ?? contact?.email ?? "",
    mobileNumber:
      quote.mobileNumber ??
      [contact?.countryCode, contact?.phone].filter(Boolean).join(" "),
    fromCountry: quote.fromCountry,
    fromZip: quote.fromZip,
    toCountry: quote.toCountry,
    toZip: quote.toZip,
    isResidence: quote.isResidence,
    packageTypeLabel: formatPackageTypes(quote.packageType),
    boxes: quote.packages
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
    televisions: quote.packages
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
    autos: quote.packages
      .filter((p) => p.packageType === "auto")
      .map((p) => ({
        brandName: p.brandName,
        carModel: p.carModel,
        carYear: p.carYear, // string passthrough (R8)
        quantity: p.quantity,
      })),
    totalChargeableWeight: decimal2(quote.totalChargeableWeight),
    weightUnit,
    estimatedCost: decimal2(quote.estimatedCost),
    currency: quote.currency ?? "USD",
    trackingUrl: trackingUrl(token),
  };

  try {
    await sendQuoteConfirmationEmail(data, { fromSales: true });
  } catch {
    // sendMail already logged the failure.
    throw new HttpError(502, "The quote email could not be sent. Try again.");
  }

  await db.quote.update({
    where: { id: quote.id },
    data: { status: "quoted", updatedAt: new Date() },
  });
  console.info(
    `[audit] quote ${Number(quote.id)} sent to ${to} (status → quoted) by user ${session.user.id}`,
  );

  return Response.json({ success: true, sentTo: to });
});
