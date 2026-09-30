import { adminRoute } from "@/lib/auth";
import { maskEmail } from "@/lib/mask";
import { db } from "@/lib/db";
import { ensureTrackingToken, trackingUrl } from "@/lib/email-tracking";
import { sendQuoteFollowUpEmail } from "@/lib/mail";
import { decimal2 } from "@/lib/serialize";
import { parseId } from "@/lib/list-query";
import { HttpError, validationError } from "@/lib/validation/errors";
import { QUOTE_DETAIL_INCLUDE } from "../../helpers";
import { EMAIL_NOTE_PREFIX, logQuoteEmail, quoteRecipient } from "@/lib/quote-email";

type Ctx = { params: Promise<{ id: string }> };

// Manual follow-up on a quote that was sent but not answered yet
// (2026-09-30). Staff press "Send follow-up" on a quoted quote; this sends a
// short check-in from sales@ and logs it on the quote's Notes timeline.
// Status stays "quoted".
export const POST = adminRoute<Ctx>(async (_req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const quote =
    id !== null
      ? await db.quote.findUnique({ where: { id }, include: QUOTE_DETAIL_INCLUDE })
      : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  if (quote.status !== "quoted") {
    return validationError({ _: ["Only quotes that were sent and are waiting on the customer can get a follow-up."] });
  }
  const to = quoteRecipient(quote);
  if (!to) {
    return validationError({ _: ["This quote has no contact email to send to."] });
  }

  // "the quote we sent on <date>": the most recent logged quote/options send.
  const lastSend = await db.quoteNote.findFirst({
    where: {
      quoteId: quote.id,
      AND: [{ comment: { startsWith: EMAIL_NOTE_PREFIX } }, { NOT: { comment: { contains: "Follow-up" } } }, { NOT: { comment: { contains: "Automatic confirmation" } } }],
    },
    orderBy: { id: "desc" },
    select: { createdAt: true },
  });

  const token = await ensureTrackingToken(quote.id);
  const contact = quote.contacts[0];
  const price = decimal2(quote.estimatedCost);
  const currency = quote.currency ?? "USD";

  let subject: string;
  try {
    ({ subject } = await sendQuoteFollowUpEmail({
      to,
      contactName: contact?.name ?? quote.name ?? "",
      fromCountry: quote.fromCountry,
      toCountry: quote.toCountry,
      estimatedCost: price,
      currency,
      quotedAt: lastSend?.createdAt ?? null,
      trackingUrl: trackingUrl(token),
    }));
  } catch {
    // sendMail already logged the failure.
    throw new HttpError(502, "The follow-up email could not be sent. Try again.");
  }

  await logQuoteEmail(quote.id, session.user.id, "Follow-up", to, subject);
  console.info(`[audit] quote ${Number(quote.id)} follow-up sent to ${maskEmail(to)} by user ${session.user.id}`);

  return Response.json({ success: true, sentTo: to });
});
