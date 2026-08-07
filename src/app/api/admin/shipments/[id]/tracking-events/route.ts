import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { shipmentTrackingEventInput } from "@/lib/validation/admin-shipment-detail";
import { HttpError } from "@/lib/validation/errors";
import { serializeTrackingEvent } from "../../helpers";

type Ctx = { params: Promise<{ id: string }> };

// Manual tracking half only — see the ShipmentTrackingEvent schema comment.
// No carrier/FedEx call happens here; source is always "manual".
export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const id = parseId((await ctx.params).id);
  if (id === null) throw new HttpError(404, "Shipment not found.");
  const events = await db.shipmentTrackingEvent.findMany({
    where: { shipmentId: id },
    orderBy: { occurredAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });
  return Response.json(events.map(serializeTrackingEvent));
});

export const POST = adminRoute<Ctx>(async (req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const shipment = id !== null ? await db.shipment.findUnique({ where: { id }, select: { id: true } }) : null;
  if (!shipment) throw new HttpError(404, "Shipment not found.");

  const data = shipmentTrackingEventInput.parse(await req.json());
  const occurredAt = new Date(data.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) throw new HttpError(422, "Invalid date/time.");

  const event = await db.shipmentTrackingEvent.create({
    data: {
      shipmentId: shipment.id,
      source: "manual",
      occurredAt,
      status: data.status,
      location: data.location ?? null,
      note: data.note ?? null,
      createdById: BigInt(session.user.id),
      createdAt: new Date(),
    },
    include: { createdBy: { select: { name: true } } },
  });
  return Response.json(serializeTrackingEvent(event), { status: 201 });
});
