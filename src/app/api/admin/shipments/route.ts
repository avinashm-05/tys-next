import type { Prisma } from "@prisma/client";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";

// Real backing for the admin Shipments list — previously a fully client-side
// filter over listMockShipments() (mock-data.ts). Same server-paginated
// shape as GET /api/admin/quotes.
export const GET = adminRoute(async (req) => {
  const p = parseListParams(req, {
    sortable: ["createdAt", "status", "shipmentType"],
    defaultSort: "createdAt",
  });
  const q = new URL(req.url).searchParams;

  const statusValues = (q.get("status") ?? "").split(",").filter(Boolean);
  const typeValues = (q.get("type") ?? "").split(",").filter(Boolean);

  const where: Prisma.ShipmentWhereInput = {
    ...(statusValues.length ? { status: { in: statusValues as Prisma.EnumShipmentStatusFilter["in"] } } : {}),
    ...(typeValues.length ? { shipmentType: { in: typeValues as Prisma.EnumShipmentTypeFilter["in"] } } : {}),
    ...(p.search
      ? {
          OR: [
            { trackingNumber: { contains: p.search } },
            { senderContactName: { contains: p.search } },
            { recipientContactName: { contains: p.search } },
          ],
        }
      : {}),
  };

  const [rows, total] = await db.$transaction([
    db.shipment.findMany({ where, orderBy: { [p.sort]: p.dir }, skip: p.skip, take: p.take }),
    db.shipment.count({ where }),
  ]);

  const serialized = rows.map((s) => ({
    id: Number(s.id),
    date: s.createdAt?.toISOString() ?? null,
    trackingNumber: s.trackingNumber,
    senderName: s.senderContactName,
    senderCity: s.senderCity,
    senderState: s.senderState,
    senderCountry: s.senderCountry,
    receiverName: s.recipientContactName,
    receiverCity: s.recipientCity,
    receiverState: s.recipientState,
    receiverCountry: s.recipientCountry,
    shipmentType: s.shipmentType,
    status: s.status,
  }));

  return listResponse(serialized, total, p);
});
