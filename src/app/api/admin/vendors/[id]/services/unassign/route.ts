import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { HttpError, validationError } from "@/lib/validation/errors";
import {
  assignServiceInput,
  SERVICE_NOT_FOUND_MESSAGE,
} from "@/lib/validation/vendor-service";
import { findVendorOr404, throttleOr429 } from "../../../helpers";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = adminRoute<Ctx>(async (req, ctx, session) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  await throttleOr429(`vendor-services:unassign:${session.user.id}`, 30);
  const { serviceId } = assignServiceInput.parse(await req.json());

  // Unassign only requires existence — no active check (04-validation).
  const service = await db.service.findUnique({
    where: { id: BigInt(serviceId) },
    select: { id: true },
  });
  if (!service) return validationError({ serviceId: [SERVICE_NOT_FOUND_MESSAGE] });

  const existing = await db.vendorService.findUnique({
    where: { vendorId_serviceId: { vendorId, serviceId: service.id } },
    select: { id: true },
  });
  if (!existing) throw new HttpError(409, "This service is not assigned to the vendor.");

  await db.vendorService.delete({ where: { id: existing.id } });
  return Response.json({ success: true, message: "Service unassigned." });
});
