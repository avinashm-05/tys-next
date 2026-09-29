import { db } from "@/lib/db";
import { publicApiRoute } from "@/lib/public-route";
import { quoteLeadConvertInput } from "@/lib/validation/quote-lead";

// Marks a partial lead as finished once the same visitor submits the full
// quote, so /admin/leads doesn't show people who already went through. Only
// the browser holding the lead's random token can do this, and only once.
export const POST = publicApiRoute({ name: "quote-leads.convert", limit: 20 }, async (req) => {
  const data = quoteLeadConvertInput.parse(await req.json());
  const now = new Date();
  await db.quoteLead.updateMany({
    where: { token: data.token, convertedAt: null },
    data: { quoteId: BigInt(data.quote_id), convertedAt: now, updatedAt: now },
  });
  return Response.json({ ok: true });
});
