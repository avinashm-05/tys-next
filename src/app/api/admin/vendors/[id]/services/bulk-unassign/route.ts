import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { bulkServiceInput } from "@/lib/validation/vendor-service";
import { findVendorOr404, throttleOr429 } from "../../../helpers";

type Ctx = { params: Promise<{ id: string }> };

/** Mirror of bulk-assign: best-effort in one transaction (03-logic). */
export const DELETE = adminRoute<Ctx>(async (req, ctx, session) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  await throttleOr429(`vendor-services:bulk:${session.user.id}`, 10);
  const ids = [...new Set(bulkServiceInput.parse(await req.json()).serviceIds)];

  const unassigned: number[] = [];
  const skipped: number[] = [];
  const failed: number[] = [];

  await db.$transaction(async (tx) => {
    for (const id of ids) {
      try {
        const existing = await tx.vendorService.findFirst({
          where: { vendorId, serviceId: BigInt(id) },
          select: { id: true },
        });
        if (!existing) {
          skipped.push(id); // not assigned (or no such service) — nothing to do
          continue;
        }
        await tx.vendorService.delete({ where: { id: existing.id } });
        unassigned.push(id);
      } catch {
        failed.push(id);
      }
    }
  });

  return Response.json({
    unassigned,
    skipped,
    failed,
    message: `${unassigned.length} unassigned, ${skipped.length} skipped, ${failed.length} failed.`,
  });
});
