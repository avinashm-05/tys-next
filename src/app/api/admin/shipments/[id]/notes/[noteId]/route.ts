import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { HttpError } from "@/lib/validation/errors";

type Ctx = { params: Promise<{ id: string; noteId: string }> };

export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const { id, noteId } = await ctx.params;
  const shipmentId = parseId(id);
  const nid = parseId(noteId);
  const row =
    shipmentId !== null && nid !== null
      ? await db.shipmentNote.findFirst({ where: { id: nid, shipmentId } })
      : null;
  if (!row) throw new HttpError(404, "Note not found.");
  await db.shipmentNote.delete({ where: { id: row.id } });
  return Response.json({ success: true });
});
