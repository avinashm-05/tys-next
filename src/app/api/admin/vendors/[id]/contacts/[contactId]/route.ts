import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { HttpError, validationError } from "@/lib/validation/errors";
import {
  UNIQUE_CONTACT_EMAIL_MESSAGE,
  vendorContactInput,
} from "@/lib/validation/vendor-contact";
import { AUDIT_INCLUDE, findVendorOr404 } from "../../../helpers";

type Ctx = { params: Promise<{ id: string; contactId: string }> };

/**
 * Parent-scoped lookup: the contact must belong to THIS vendor (a contact of
 * vendor A 404s under vendor B), and the soft-delete extension makes trashed
 * contacts 404 here automatically (R13).
 */
async function findContactOr404(ctx: Ctx) {
  const { id, contactId } = await ctx.params;
  const vendorId = await findVendorOr404(id);
  const cid = parseId(contactId);
  const row =
    cid !== null
      ? await db.vendorContact.findFirst({
          where: { id: cid, vendorId },
          include: AUDIT_INCLUDE,
        })
      : null;
  if (!row) throw new HttpError(404, "Contact not found.");
  return row;
}

export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  return Response.json(await findContactOr404(ctx));
});

export const PUT = adminRoute<Ctx>(async (req, ctx, session) => {
  const row = await findContactOr404(ctx);
  const data = vendorContactInput.parse(emptyStringsToNull(await req.json()));

  const clash = await db.vendorContact.findFirst({
    where: { vendorId: row.vendorId, email: data.email, id: { not: row.id } },
    select: { id: true },
  });
  if (clash) return validationError({ email: [UNIQUE_CONTACT_EMAIL_MESSAGE] });

  const updated = await db.vendorContact.update({
    where: { id: row.id },
    data: {
      name: data.name,
      title: data.title ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      email: data.email,
      workPhone: data.work_phone ?? null,
      cellPhone: data.cell_phone ?? null,
      status: data.status,
      updatedById: BigInt(session.user.id),
      updatedAt: new Date(),
    },
    include: AUDIT_INCLUDE,
  });
  return Response.json(updated);
});

// SOFT delete — the db.ts extension turns this into an update setting
// deletedAt; the row stays for the audit trail but 404s everywhere.
export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findContactOr404(ctx);
  await db.vendorContact.delete({ where: { id: row.id } });
  return Response.json({ success: true });
});
