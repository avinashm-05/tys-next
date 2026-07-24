import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { HttpError } from "@/lib/validation/errors";
import { vendorCommentInput } from "@/lib/validation/vendor-comment";
import { AUDIT_INCLUDE, findVendorOr404 } from "../../../helpers";

type Ctx = { params: Promise<{ id: string; commentId: string }> };

/** Parent-scoped; soft-deleted comments 404 via the db.ts extension (R13). */
async function findCommentOr404(ctx: Ctx) {
  const { id, commentId } = await ctx.params;
  const vendorId = await findVendorOr404(id);
  const cid = parseId(commentId);
  const row =
    cid !== null
      ? await db.vendorComment.findFirst({
          where: { id: cid, vendorId },
          include: AUDIT_INCLUDE,
        })
      : null;
  if (!row) throw new HttpError(404, "Comment not found.");
  return row;
}

export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  return Response.json(await findCommentOr404(ctx));
});

export const PUT = adminRoute<Ctx>(async (req, ctx, session) => {
  const row = await findCommentOr404(ctx);
  const data = vendorCommentInput.parse(emptyStringsToNull(await req.json()));
  const updated = await db.vendorComment.update({
    where: { id: row.id },
    data: {
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
      updatedById: BigInt(session.user.id),
      updatedAt: new Date(),
    },
    include: AUDIT_INCLUDE,
  });
  return Response.json(updated);
});

// SOFT delete via the extension.
export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findCommentOr404(ctx);
  await db.vendorComment.delete({ where: { id: row.id } });
  return Response.json({ success: true });
});
