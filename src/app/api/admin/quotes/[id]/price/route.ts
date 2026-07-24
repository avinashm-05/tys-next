import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { isUnitedStates } from "@/lib/countries";
import { parseId } from "@/lib/list-query";
import {
  getFedexMarkupInternationalPercentage,
  getFedexMarkupPercentage,
} from "@/lib/settings";
import { emptyStringsToNull } from "@/lib/validation/common";
import { HttpError } from "@/lib/validation/errors";
import { lockPriceInput } from "@/lib/validation/quote-price";

type Ctx = { params: Promise<{ id: string }> };

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// Lock in the quoted price (estimatedCost + currency). Domestic picks send the
// server-computed marked-up total; manual entries send a base rate and the
// server applies the markup for the quote's ROUTE — domestic (US↔US) vs
// international — keyed the same way the rate endpoint routes (fail-open, R22).
export const PATCH = adminRoute<Ctx>(async (req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const quote =
    id !== null
      ? await db.quote.findUnique({
          where: { id },
          select: { id: true, fromCountry: true, toCountry: true },
        })
      : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  const data = lockPriceInput.parse(emptyStringsToNull(await req.json()));

  let final: number;
  if (data.source === "service") {
    final = round2(data.amount);
  } else {
    // A domestic quote whose auto-rating failed and is priced manually must
    // get the DOMESTIC markup, not the international one — they differ.
    const domestic = isUnitedStates(quote.fromCountry) && isUnitedStates(quote.toCountry);
    const markup = domestic
      ? await getFedexMarkupPercentage()
      : await getFedexMarkupInternationalPercentage();
    final = round2(data.baseRate * (1 + markup / 100));
  }
  const estimatedCost = final.toFixed(2); // DECIMAL(10,2), string contract (R3)

  await db.quote.update({
    where: { id: quote.id },
    data: { estimatedCost, currency: data.currency, updatedAt: new Date() },
  });
  console.info(
    `[audit] quote ${Number(quote.id)} price locked ${estimatedCost} ${data.currency} (${data.source}) by user ${session.user.id}`,
  );

  return Response.json({ estimatedCost, currency: data.currency });
});
