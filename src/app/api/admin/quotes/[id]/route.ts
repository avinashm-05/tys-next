import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { HttpError } from "@/lib/validation/errors";
import { QUOTE_DETAIL_INCLUDE, serializeQuoteDetail } from "../helpers";

type Ctx = { params: Promise<{ id: string }> };

// Read-only detail (admin only views quotes; create/edit is the wizard, B2).
export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const id = parseId((await ctx.params).id);
  const row =
    id !== null
      ? await db.quote.findUnique({ where: { id }, include: QUOTE_DETAIL_INCLUDE })
      : null;
  if (!row) throw new HttpError(404, "Quote not found.");
  return Response.json(serializeQuoteDetail(row));
});
