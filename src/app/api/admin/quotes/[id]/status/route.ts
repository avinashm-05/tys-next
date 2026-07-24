import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { HttpError } from "@/lib/validation/errors";
import { updateQuoteStatusInput } from "@/lib/validation/quote";

type Ctx = { params: Promise<{ id: string }> };

// PATCH status only (Admin\QuoteController@updateStatus). Zod message verbatim.
export const PATCH = adminRoute<Ctx>(async (req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const existing =
    id !== null
      ? await db.quote.findUnique({ where: { id }, select: { id: true, status: true } })
      : null;
  if (!existing) throw new HttpError(404, "Quote not found.");

  const { status } = updateQuoteStatusInput.parse(emptyStringsToNull(await req.json()));

  await db.quote.update({ where: { id: existing.id }, data: { status, updatedAt: new Date() } });
  // Lightweight audit line (matches the project's console-tag approach).
  console.info(
    `[audit] quote ${Number(existing.id)} status ${existing.status} -> ${status} by user ${session.user.id}`,
  );
  return Response.json({ success: true, status });
});
