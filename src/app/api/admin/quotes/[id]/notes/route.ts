import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { quoteNoteInput } from "@/lib/validation/admin-quote-detail";
import { HttpError } from "@/lib/validation/errors";

type Ctx = { params: Promise<{ id: string }> };

function serializeNote(n: {
  id: bigint;
  comment: string;
  createdAt: Date | null;
  createdBy: { name: string } | null;
}) {
  return {
    id: Number(n.id),
    comment: n.comment,
    createdAt: n.createdAt,
    createdByName: n.createdBy?.name ?? null,
  };
}

export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const id = parseId((await ctx.params).id);
  if (id === null) throw new HttpError(404, "Quote not found.");
  const notes = await db.quoteNote.findMany({
    where: { quoteId: id },
    orderBy: { id: "desc" },
    include: { createdBy: { select: { name: true } } },
  });
  return Response.json(notes.map(serializeNote));
});

export const POST = adminRoute<Ctx>(async (req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const quote = id !== null ? await db.quote.findUnique({ where: { id }, select: { id: true } }) : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  const data = quoteNoteInput.parse(await req.json());
  const now = new Date();
  const note = await db.quoteNote.create({
    data: {
      quoteId: quote.id,
      comment: data.comment,
      createdById: BigInt(session.user.id),
      createdAt: now,
      updatedAt: now,
    },
    include: { createdBy: { select: { name: true } } },
  });
  return Response.json(serializeNote(note), { status: 201 });
});
