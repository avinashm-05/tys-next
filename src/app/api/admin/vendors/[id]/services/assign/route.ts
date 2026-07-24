import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { HttpError, validationError } from "@/lib/validation/errors";
import {
  assignServiceInput,
  SERVICE_NOT_ACTIVE_MESSAGE,
} from "@/lib/validation/vendor-service";
import { findVendorOr404, throttleOr429 } from "../../../helpers";

type Ctx = { params: Promise<{ id: string }> };

export const POST = adminRoute<Ctx>(async (req, ctx, session) => {
  const vendorId = await findVendorOr404((await ctx.params).id);
  await throttleOr429(`vendor-services:assign:${session.user.id}`, 30);
  const { serviceId } = assignServiceInput.parse(await req.json());

  // Assign requires the service to exist AND be active (04-validation).
  const service = await db.service.findUnique({
    where: { id: BigInt(serviceId) },
    select: { id: true, status: true },
  });
  if (!service || service.status !== "active") {
    return validationError({ serviceId: [SERVICE_NOT_ACTIVE_MESSAGE] });
  }

  const existing = await db.vendorService.findUnique({
    where: { vendorId_serviceId: { vendorId, serviceId: service.id } },
    select: { id: true },
  });
  if (existing) throw new HttpError(409, "This service is already assigned to the vendor.");

  const now = new Date();
  await db.vendorService.create({
    data: {
      vendorId,
      serviceId: service.id,
      assignedAt: now,
      assignedBy: BigInt(session.user.id),
      createdAt: now,
      updatedAt: now,
    },
  });
  return Response.json({ success: true, message: "Service assigned." }, { status: 201 });
});
