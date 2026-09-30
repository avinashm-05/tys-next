import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureTrackingToken, trackingUrl } from "@/lib/email-tracking";
import { sendQuoteConfirmationEmail } from "@/lib/mail";
import { decimal2 } from "@/lib/serialize";
import { parseId } from "@/lib/list-query";
import { HttpError, validationError } from "@/lib/validation/errors";
import { QUOTE_DETAIL_INCLUDE } from "../../helpers";
import { buildQuoteEmailBase, logQuoteEmail, quoteRecipient } from "@/lib/quote-email";

type Ctx = { params: Promise<{ id: string }> };

// Send the priced quote email to the customer. Guards that a price is
// locked (R26: can't send an unpriced quote), ensures the tracking token row
// exists (R25), sends inline via Nodemailer, sets pending → quoted, and logs
// the send on the quote's Notes timeline.
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

  const to = quoteRecipient(quote);
  if (!to) {
    return validationError({ _: ["This quote has no contact email to send to."] });
  }

  const token = await ensureTrackingToken(quote.id); // R25: explicit, reused if present
  const price = decimal2(quote.estimatedCost);
  const currency = quote.currency ?? "USD";

  let subject: string;
  try {
    ({ subject } = await sendQuoteConfirmationEmail(
      { ...buildQuoteEmailBase(quote, to, trackingUrl(token)), estimatedCost: price, currency },
      { fromSales: true },
    ));
  } catch {
    // sendMail already logged the failure.
    throw new HttpError(502, "The quote email could not be sent. Try again.");
  }

  await db.quote.update({
    where: { id: quote.id },
    data: { status: "quoted", updatedAt: new Date() },
  });
  await logQuoteEmail(quote.id, session.user.id, `Quote (${currency} ${price})`, to, subject);
  console.info(
    `[audit] quote ${Number(quote.id)} sent to ${to} (status → quoted) by user ${session.user.id}`,
  );

  return Response.json({ success: true, sentTo: to });
});
