import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { HttpError } from "@/lib/validation/errors";

type Ctx = { params: Promise<{ id: string; noteId: string }> };

export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const { id, noteId } = await ctx.params;
  const quoteId = parseId(id);
  const nid = parseId(noteId);
  const row =
    quoteId !== null && nid !== null
      ? await db.quoteNote.findFirst({ where: { id: nid, quoteId } })
      : null;
  if (!row) throw new HttpError(404, "Note not found.");
  await db.quoteNote.delete({ where: { id: row.id } });
  return Response.json({ success: true });
});
