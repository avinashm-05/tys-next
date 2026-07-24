import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { bulkServiceInput } from "@/lib/validation/vendor-service";
import { findVendorOr404, throttleOr429 } from "../../../helpers";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Laravel's bulkAssign (03-logic): ≤50 deduped ids, ONE transaction, per-item
 * try/catch accumulating assigned/skipped/failed — partial success COMMITS
 * (best-effort, not all-or-nothing), composite message.
 */
export const POST = adminRoute<Ctx>(async (req, ctx, session) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  await throttleOr429(`vendor-services:bulk:${session.user.id}`, 10);
  // Dedupe like Laravel's prepareForValidation (array_unique).
  const ids = [...new Set(bulkServiceInput.parse(await req.json()).serviceIds)];
  const userId = BigInt(session.user.id);

  const assigned: number[] = [];
  const skipped: number[] = [];
  const failed: number[] = [];

  await db.$transaction(async (tx) => {
    for (const id of ids) {
      try {
        const service = await tx.service.findUnique({
          where: { id: BigInt(id) },
          select: { id: true, status: true },
        });
        if (!service || service.status !== "active") {
          failed.push(id);
          continue;
        }
        const existing = await tx.vendorService.findUnique({
          where: { vendorId_serviceId: { vendorId, serviceId: service.id } },
          select: { id: true },
        });
        if (existing) {
          skipped.push(id);
          continue;
        }
        const now = new Date();
        await tx.vendorService.create({
          data: {
            vendorId,
            serviceId: service.id,
            assignedAt: now,
            assignedBy: userId,
            createdAt: now,
            updatedAt: now,
          },
        });
        assigned.push(id);
      } catch {
        failed.push(id);
      }
    }
  });

  return Response.json({
    assigned,
    skipped,
    failed,
    message: `${assigned.length} assigned, ${skipped.length} skipped, ${failed.length} failed.`,
  });
});
