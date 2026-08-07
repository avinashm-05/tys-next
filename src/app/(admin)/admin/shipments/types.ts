// Real shapes for the admin Shipment detail editor — matches the JSON
// serializeShipmentDetail() (src/app/api/admin/shipments/helpers.ts) sends
// back from GET/PATCH /api/admin/shipments/[id]. Supersedes mock-data.ts's
// ShipmentDetail/Address/etc, which backed a client-side-only mock before
// the real Shipment*/ tables existed (see that file's header comment).

export type ShipmentType = "air" | "ground" | "ocean";

export type ShipmentStatus =
  | "new_request"
  | "ready_for_pickup"
  | "in_transit"
  | "delivered"
  | "on_hold"
  | "cancelled";

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  new_request: "New Request",
  ready_for_pickup: "Ready for Pickup",
  in_transit: "In Transit",
  delivered: "Delivered",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const SHIPMENT_STATUS_TONE: Record<
  ShipmentStatus,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  new_request: "info",
  ready_for_pickup: "info",
  in_transit: "warning",
  delivered: "success",
  on_hold: "warning",
  cancelled: "danger",
};

export type Address = {
  contactName: string;
  companyName: string | null;
  addressLine1: string;
  addressLine2: string | null;
  addressLine3: string | null;
  country: string;
  zipCode: string;
  city: string;
  state: string;
  phone1: string;
  phone2: string | null;
  email: string | null;
};

export type ShipmentPackage = {
  id: number;
  number: number; // display index only (1,2,3…) — not stored
  quantity: number;
  weight: string | null;
  weightUnit: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
  chargeableWeight: string | null;
  insuredValue: string | null;
};

export type CommercialInvoiceLine = {
  id: number;
  packageNumber: number;
  packageContent: string | null;
  quantity: number;
  valuePerQty: string | null;
};

export type DocumentationRow = {
  id: number;
  documentType: string;
  documentName: string | null;
  createdOn: string | null; // ISO — Response.json() serializes Date to string
  status: "active" | "inactive";
};

export type NoteRow = {
  id: number;
  createdAt: string | null; // ISO
  comment: string;
  createdByName: string | null;
};

export type TrackingEvent = {
  id: number;
  source: "manual" | "carrier";
  occurredAt: string; // ISO
  status: string;
  location: string | null;
  note: string | null;
  createdByName: string | null;
};

export type ShipmentDetail = {
  id: number;
  trackingNumber: string | null;
  linkedQuoteId: number | null;
  status: ShipmentStatus;
  allClear: "ready" | "not_ready";
  packageType: "package" | "document" | "pallet";
  username: string | null;
  managedBy: string | null;
  shipmentType: ShipmentType;
  serviceType: string | null;
  subServiceType: string | null;

  sender: Address;
  recipient: Address;
  pickup: {
    pickupProvider: string | null;
    pickupDate: string | null; // ISO
    startTime: string | null;
    endTime: string | null;
    specialInstruction: string | null;
  };
  additional: {
    shipDate: string | null; // ISO
    locationType: "residential" | "commercial";
    dutiesTaxesPaidBy: string | null;
  };

  packages: ShipmentPackage[];
  doNotShowOnMyShipment: boolean;
  commercialInvoice: CommercialInvoiceLine[];
  paymentIssued: boolean;
  documentation: DocumentationRow[];
  notes: NoteRow[];
  trackingEvents: TrackingEvent[];

  createdAt: string | null; // ISO
  updatedAt: string | null; // ISO
};

/** A brand-new, unsaved-in-the-editor shipment shape isn't needed anymore —
 * `/admin/shipments/new` now creates the real row server-side and redirects
 * straight into `/admin/shipments/[id]/edit`, so the editor only ever
 * receives a real, already-persisted ShipmentDetail. */
