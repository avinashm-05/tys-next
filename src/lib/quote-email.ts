import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { QuoteEmailData } from "@/lib/mail";
import { formatPackageTypes } from "@/lib/package-type";
import { decimal2 } from "@/lib/serialize";
import type { QUOTE_DETAIL_INCLUDE } from "@/app/api/admin/quotes/helpers";

type QuoteDetailRow = Prisma.QuoteGetPayload<{ include: typeof QUOTE_DETAIL_INCLUDE }>;

/** Prefix every automatic email log note starts with (also how follow-up finds the last quote send). */
export const EMAIL_NOTE_PREFIX = "Email sent:";

/** First contact's email, falling back to the denormalized quote email. */
export function quoteRecipient(quote: QuoteDetailRow): string | null {
  return quote.contacts[0]?.email ?? quote.email ?? null;
}

/**
 * Everything the quote emails share (contact, route, packages), built once
 * from a QUOTE_DETAIL_INCLUDE row. Previously copy-pasted in /send and
 * /send-options.
 */
export function buildQuoteEmailBase(
  quote: QuoteDetailRow,
  to: string,
  trackingUrl: string,
): Omit<QuoteEmailData, "estimatedCost" | "currency"> {
  const contact = quote.contacts[0];
  const weightUnit = quote.packages[0]?.weightUnit ?? "";
  return {
    to,
    contactName: contact?.name ?? quote.name ?? "",
    customerName: quote.name ?? contact?.name ?? "",
    customerEmail: quote.email ?? contact?.email ?? "",
    mobileNumber:
      quote.mobileNumber ?? [contact?.countryCode, contact?.phone].filter(Boolean).join(" "),
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
    trackingUrl,
  };
}

/**
 * Records a customer email on the quote's Notes timeline (2026-09-30: "log
 * every email on the quote"), so staff see what went out, when, and who
 * sent it. Never throws: the email already went out, and a failed log line
 * must not turn that into an error for the sender.
 */
/** `userId` is null for automatic sends (the public form's confirmation). */
export async function logQuoteEmail(quoteId: bigint, userId: string | null, what: string, to: string, subject: string) {
  const now = new Date();
  try {
    await db.quoteNote.create({
      data: {
        quoteId,
        comment: `${EMAIL_NOTE_PREFIX} ${what} to ${to}. Subject: "${subject}"`,
        createdById: userId ? BigInt(userId) : null,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (err) {
    console.error("[mail] couldn't log email on quote", Number(quoteId), err instanceof Error ? err.message : err);
  }
}
