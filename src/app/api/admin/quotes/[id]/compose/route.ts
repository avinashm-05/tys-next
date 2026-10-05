import { adminRoute } from "@/lib/auth";
import { maskEmail } from "@/lib/mask";
import { db } from "@/lib/db";
import { ensureTrackingToken, trackingUrl } from "@/lib/email-tracking";
import { SALES_FROM, SALES_REP_NAME, sendMail } from "@/lib/mail";
import { parseId } from "@/lib/list-query";
import { HttpError, validationError } from "@/lib/validation/errors";
import { logQuoteEmail } from "@/lib/quote-email";
import {
  composerFieldsSchema,
  formatMoney,
  pricing,
  renderComposerHtml,
  renderComposerText,
  subjectOf,
} from "@/lib/quote-composer";

type Ctx = { params: Promise<{ id: string }> };

const SITE_URL = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(/\/+$/, "");

// The one "Send quote" (2026-10-05): the composer posts its editable FIELDS,
// never HTML; the email is rendered here from those fields with the same
// template the preview used. Sends from sales@ as the sales rep, locks the
// price on the quote, moves it to "quoted" and logs the send on the Notes
// timeline.
export const POST = adminRoute<Ctx>(async (req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const quote = id !== null ? await db.quote.findUnique({ where: { id }, select: { id: true } }) : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  const body = (await req.json().catch(() => null)) as { fields?: unknown } | null;
  const parsed = composerFieldsSchema.safeParse(body?.fields);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      (errors[key] ??= []).push(issue.message);
    }
    return validationError(errors);
  }
  const fields = parsed.data;
  const quoteId = Number(quote.id);
  const { price } = pricing(fields);

  const token = await ensureTrackingToken(quote.id);
  const subject = subjectOf(fields, quoteId);
  const html = renderComposerHtml(fields, {
    quoteId,
    repName: SALES_REP_NAME,
    variant: "email",
    logoUrl: `${SITE_URL}/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png`,
    trackingUrl: trackingUrl(token),
  });
  const text = renderComposerText(fields, { quoteId, repName: SALES_REP_NAME });

  try {
    await sendMail({ to: fields.to, subject, html, text, from: SALES_FROM, useSalesAuth: true });
  } catch {
    // sendMail already logged the failure.
    throw new HttpError(502, "The quote email could not be sent. Try again.");
  }

  await db.quote.update({
    where: { id: quote.id },
    data: { estimatedCost: price, currency: fields.currency, status: "quoted", updatedAt: new Date() },
  });
  await logQuoteEmail(quote.id, session.user.id, `Quote (${formatMoney(price, fields.currency)} ${fields.currency})`, fields.to, subject);
  console.info(`[audit] quote ${quoteId} composed and sent to ${maskEmail(fields.to)} by user ${session.user.id}`);

  return Response.json({ success: true, sentTo: fields.to });
});
