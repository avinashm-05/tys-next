import { db } from "@/lib/db";
import { publicApiRoute } from "@/lib/public-route";
import { quoteLeadConvertInput } from "@/lib/validation/quote-lead";

// Marks a partial lead as finished once the same visitor submits the full
// quote, so /admin/leads doesn't show people who already went through. Only
// the browser holding the lead's random token can do this, and only once.
//
// The quote link is only recorded when that quote was created in the last
// hour with the SAME email as the lead (privacy audit 2026-09-30): quote ids
// are sequential, so trusting the client's quote_id let anyone point their
// own lead at another customer's quote in the admin list.
const LINK_WINDOW_MS = 60 * 60 * 1000;

export const POST = publicApiRoute({ name: "quote-leads.convert", limit: 20 }, async (req) => {
  const data = quoteLeadConvertInput.parse(await req.json());
  const lead = await db.quoteLead.findFirst({
    where: { token: data.token, convertedAt: null },
    select: { id: true, email: true },
  });
  if (!lead) return Response.json({ ok: true });

  const quote = await db.quote.findUnique({
    where: { id: BigInt(data.quote_id) },
    select: { id: true, email: true, createdAt: true, contacts: { select: { email: true }, take: 1, orderBy: { id: "asc" } } },
  });
  const leadEmail = lead.email.trim().toLowerCase();
  const quoteEmails = [quote?.email, quote?.contacts[0]?.email].filter(Boolean).map((e) => e!.trim().toLowerCase());
  const matches =
    !!quote &&
    quoteEmails.includes(leadEmail) &&
    !!quote.createdAt &&
    Date.now() - quote.createdAt.getTime() < LINK_WINDOW_MS;

  const now = new Date();
  await db.quoteLead.updateMany({
    where: { id: lead.id, convertedAt: null },
    data: { quoteId: matches ? quote!.id : null, convertedAt: now, updatedAt: now },
  });
  return Response.json({ ok: true });
});
