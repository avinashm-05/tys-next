import { z } from "zod";
import { maskEmail } from "@/lib/mask";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureTrackingToken, trackingUrl } from "@/lib/email-tracking";
import { sendQuoteOptionsEmail, type QuoteOptionsEmailData } from "@/lib/mail";
import { parseId } from "@/lib/list-query";
import { HttpError, validationError } from "@/lib/validation/errors";
import { QUOTE_DETAIL_INCLUDE } from "../../helpers";
import { buildQuoteEmailBase, logQuoteEmail, quoteRecipient } from "@/lib/quote-email";

type Ctx = { params: Promise<{ id: string }> };

const sendOptionsInput = z.object({
  rates: z
    .array(
      z.object({
        service_name: z.string().min(1),
        total_charge: z.number(),
        currency: z.string().min(1),
      }),
    )
    .min(1, "Select at least one rate to send."),
});

// Emails the customer a short list of rate options to pick from — nothing is
// locked on the quote here. The customer replies with which one they want,
// and support locks THAT one afterward through the normal "Use this rate" +
// Send quote flow. Moves pending → quoted either way, since the customer now
// has something to respond to.
export const POST = adminRoute<Ctx>(async (req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const quote =
    id !== null
      ? await db.quote.findUnique({ where: { id }, include: QUOTE_DETAIL_INCLUDE })
      : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  const data = sendOptionsInput.parse(await req.json());

  const to = quoteRecipient(quote);
  if (!to) {
    return validationError({ _: ["This quote has no contact email to send to."] });
  }

  const token = await ensureTrackingToken(quote.id); // R25: explicit, reused if present

  const emailData: QuoteOptionsEmailData = {
    ...buildQuoteEmailBase(quote, to, trackingUrl(token)),
    options: data.rates.map((r) => ({
      serviceName: r.service_name,
      amount: r.total_charge.toFixed(2),
      currency: r.currency,
    })),
  };

  let subject: string;
  try {
    ({ subject } = await sendQuoteOptionsEmail(emailData));
  } catch {
    // sendMail already logged the failure.
    throw new HttpError(502, "The options email could not be sent. Try again.");
  }

  await db.quote.update({
    where: { id: quote.id },
    data: { status: "quoted", updatedAt: new Date() },
  });
  await logQuoteEmail(
    quote.id,
    session.user.id,
    `${data.rates.length} rate option${data.rates.length === 1 ? "" : "s"} (${emailData.options.map((o) => `${o.serviceName} ${o.currency} ${o.amount}`).join("; ")})`,
    to,
    subject,
  );
  console.info(
    `[audit] quote ${Number(quote.id)} sent ${data.rates.length} rate option(s) to ${maskEmail(to)} (status → quoted) by user ${session.user.id}`,
  );

  return Response.json({ success: true, sentTo: to, count: data.rates.length });
});
