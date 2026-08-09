import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateLabel } from "@/lib/fedex/ship";
import { parseId } from "@/lib/list-query";
import { rateLimit } from "@/lib/ratelimit";
import { buildStorageKey, putFile } from "@/lib/storage";
import { HttpError } from "@/lib/validation/errors";
import { serializeDocument } from "../../helpers";

type Ctx = { params: Promise<{ id: string }> };

/** The body is optional — a bare POST with no body is a valid request. */
async function readBody(req: Request): Promise<unknown> {
  return req.json().catch(() => null);
}

function documentIdFromBody(body: unknown): bigint | null {
  const raw = (body as { documentId?: unknown } | null)?.documentId;
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw <= 0) return null;
  return BigInt(raw);
}

/**
 * Generates a FedEx shipping label for this shipment, stores each returned
 * label, and records it as a Documentation row.
 *
 * Rate-limited hard, and deliberately so: unlike every other admin write,
 * a successful call here books real freight with the carrier and bills the
 * account. A double-clicked button must not be able to buy two shipments.
 */
export const POST = adminRoute<Ctx>(async (req, ctx) => {
  const id = parseId((await ctx.params).id);
  if (id === null) throw new HttpError(404, "Shipment not found.");

  const { allowed } = await rateLimit(`shipment-label:${id}`, 3, 60);
  if (!allowed) {
    throw new HttpError(429, "Too many label attempts for this shipment. Wait a minute and retry.");
  }

  const shipment = await db.shipment.findUnique({
    where: { id },
    include: { packages: { orderBy: { id: "asc" } }, invoiceLines: { orderBy: { id: "asc" } } },
  });
  if (!shipment) throw new HttpError(404, "Shipment not found.");

  // The row the operator clicked Generate on, when it's an already-saved
  // Label row with no file. The first label fills that row in rather than
  // creating a second one beside it — otherwise every generation leaves the
  // empty placeholder row behind, which is what the operator was looking at
  // when they clicked. Extra pieces still get their own rows.
  const requestedDocumentId = documentIdFromBody(await readBody(req));
  const targetRow =
    requestedDocumentId === null
      ? null
      : await db.shipmentDocument.findFirst({
          where: {
            id: requestedDocumentId,
            shipmentId: shipment.id,
            documentType: "Label",
            storageKey: null,
          },
          select: { id: true },
        });

  const result = await generateLabel(shipment);
  // Every failure mode is already a specific, actionable sentence (missing
  // service type, empty customs tab, FedEx's own rejection reason), so it
  // goes straight to the operator as a 422 rather than a generic 500.
  if (!result.success) throw new HttpError(422, result.message);

  const documents = [];
  for (const [index, label] of result.labels.entries()) {
    const key = buildStorageKey(`shipments/${id}/labels`, label.extension);
    await putFile(key, label.bytes);

    const suffix = result.labels.length > 1 ? ` (${index + 1} of ${result.labels.length})` : "";
    const data = {
      documentType: "Label",
      documentName: `FedEx label ${label.trackingNumber}${suffix}`,
      status: "active" as const,
      storageKey: key,
      contentType: label.contentType,
      sizeBytes: label.bytes.byteLength,
      trackingNumber: label.trackingNumber,
    };

    documents.push(
      index === 0 && targetRow
        ? await db.shipmentDocument.update({
            where: { id: targetRow.id },
            data: { ...data, updatedAt: new Date() },
          })
        : await db.shipmentDocument.create({
            data: { ...data, shipmentId: shipment.id, createdAt: new Date() },
          }),
    );
  }

  // The shipment's own tracking number is the master one — for a multi-piece
  // shipment the per-piece numbers live on their own document rows.
  await db.shipment.update({
    where: { id: shipment.id },
    data: { trackingNumber: result.masterTrackingNumber, updatedAt: new Date() },
  });

  return Response.json(
    {
      masterTrackingNumber: result.masterTrackingNumber,
      documents: documents.map(serializeDocument),
    },
    { status: 201 },
  );
});
