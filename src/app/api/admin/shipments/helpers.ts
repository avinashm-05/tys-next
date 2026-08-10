import type { Prisma } from "@prisma/client";
import { decimal2 } from "@/lib/serialize";

export const SHIPMENT_DETAIL_INCLUDE = {
  packages: { orderBy: { id: "asc" } },
  invoiceLines: { orderBy: { id: "asc" } },
  documents: { orderBy: { id: "asc" } },
  notes: { orderBy: { id: "desc" }, include: { createdBy: { select: { name: true } } } },
  trackingEvents: {
    orderBy: { occurredAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  },
  user: { select: { email: true, username: true, displayUsername: true } },
} satisfies Prisma.ShipmentInclude;

type ShipmentWithDetail = Prisma.ShipmentGetPayload<{ include: typeof SHIPMENT_DETAIL_INCLUDE }>;

// Explicit ISO-string conversion rather than relying on Response.json()'s
// implicit Date-to-string behavior — this same serializer also feeds
// [id]/edit/page.tsx, which hands its result straight to a Client Component
// as a prop (no JSON round trip), where a raw Date would pass through
// untouched and silently violate the client ShipmentDetail type's `string |
// null` contract for every date-like field.
function isoOrNull(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

function serializeSenderAddress(s: ShipmentWithDetail) {
  return {
    contactName: s.senderContactName,
    companyName: s.senderCompanyName,
    addressLine1: s.senderAddressLine1,
    addressLine2: s.senderAddressLine2,
    addressLine3: s.senderAddressLine3,
    city: s.senderCity,
    state: s.senderState,
    country: s.senderCountry,
    zipCode: s.senderPostalCode,
    phone1: s.senderPhone1,
    phone2: s.senderPhone2,
    email: s.senderEmail,
  };
}

function serializeRecipientAddress(s: ShipmentWithDetail) {
  return {
    contactName: s.recipientContactName,
    companyName: s.recipientCompanyName,
    addressLine1: s.recipientAddressLine1,
    addressLine2: s.recipientAddressLine2,
    addressLine3: s.recipientAddressLine3,
    city: s.recipientCity,
    state: s.recipientState,
    country: s.recipientCountry,
    zipCode: s.recipientPostalCode,
    phone1: s.recipientPhone1,
    phone2: s.recipientPhone2,
    email: s.recipientEmail,
  };
}

function serializePackage(p: ShipmentWithDetail["packages"][number], index: number) {
  return {
    id: Number(p.id),
    number: index + 1,
    quantity: p.quantity,
    weight: decimal2(p.weight),
    weightUnit: p.weightUnit,
    length: decimal2(p.length),
    width: decimal2(p.width),
    height: decimal2(p.height),
    chargeableWeight: decimal2(p.chargeableWeight),
    insuredValue: decimal2(p.insuredValue),
  };
}

function serializeInvoiceLine(l: ShipmentWithDetail["invoiceLines"][number]) {
  return {
    id: Number(l.id),
    packageNumber: l.packageNumber,
    packageContent: l.packageContent,
    quantity: l.quantity,
    valuePerQty: decimal2(l.valuePerQty),
  };
}

export function serializeDocument(d: ShipmentWithDetail["documents"][number]) {
  return {
    id: Number(d.id),
    documentType: d.documentType,
    documentName: d.documentName,
    createdOn: isoOrNull(d.createdAt),
    status: d.status,
    // storageKey is deliberately NOT exposed — the client only needs to know
    // whether a file exists, and the download route resolves the key itself.
    hasFile: Boolean(d.storageKey),
    contentType: d.contentType,
    sizeBytes: d.sizeBytes,
    trackingNumber: d.trackingNumber,
  };
}

function serializeNote(n: ShipmentWithDetail["notes"][number]) {
  return {
    id: Number(n.id),
    comment: n.comment,
    createdAt: isoOrNull(n.createdAt),
    createdByName: n.createdBy?.name ?? null,
  };
}

export function serializeTrackingEvent(e: ShipmentWithDetail["trackingEvents"][number]) {
  return {
    id: Number(e.id),
    source: e.source,
    occurredAt: e.occurredAt.toISOString(),
    status: e.status,
    location: e.location,
    note: e.note,
    createdByName: e.createdBy?.name ?? null,
  };
}

/** Detail shape for GET/PATCH /api/admin/shipments/[id] — everything the
 * 6-tab editor needs in one payload. `username` is derived read-only display:
 * the linked customer account's real handle now that accounts have one,
 * falling back to their email for rows whose account predates the username
 * columns (or a shipment with no linked account at all). */
export function serializeShipmentDetail(s: ShipmentWithDetail) {
  return {
    id: Number(s.id),
    trackingNumber: s.trackingNumber,
    linkedQuoteId: s.linkedQuoteId !== null ? Number(s.linkedQuoteId) : null,
    status: s.status,
    allClear: s.allClear,
    packageType: s.packageType,
    username: s.user?.displayUsername ?? s.user?.username ?? s.user?.email ?? null,
    managedBy: s.managedBy,
    shipmentType: s.shipmentType,
    serviceType: s.serviceType,
    subServiceType: s.subServiceType,

    sender: serializeSenderAddress(s),
    recipient: serializeRecipientAddress(s),

    pickup: {
      pickupProvider: s.pickupProvider,
      pickupDate: isoOrNull(s.pickupDate),
      startTime: s.pickupStartTime,
      endTime: s.pickupEndTime,
      specialInstruction: s.specialInstruction,
    },
    additional: {
      shipDate: isoOrNull(s.shipDate),
      locationType: s.recipientLocationType,
      dutiesTaxesPaidBy: s.dutiesTaxesPaidBy,
    },

    packages: s.packages.map(serializePackage),
    doNotShowOnMyShipment: s.doNotShowOnMyShipment,
    commercialInvoice: s.invoiceLines.map(serializeInvoiceLine),
    paymentIssued: s.paymentIssued,
    documentation: s.documents.map(serializeDocument),
    notes: s.notes.map(serializeNote),
    trackingEvents: s.trackingEvents.map(serializeTrackingEvent),

    createdAt: isoOrNull(s.createdAt),
    updatedAt: isoOrNull(s.updatedAt),
  };
}
