// UI-lock phase: there's no Shipment table yet (see plan — a Quote converts
// into a Shipment once accepted, but that model doesn't exist in Prisma
// yet). This module stands in for that future API: deterministic (seeded,
// not Math.random) so server render and client hydration produce identical
// rows, shaped exactly like the fields the real schema will need so wiring
// a real backend later is a fetch swap, not a UI rewrite.

export type ShipmentType = "air" | "ocean";

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

export const SHIPMENT_STATUS_TONE: Record<ShipmentStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  new_request: "info",
  ready_for_pickup: "info",
  in_transit: "warning",
  delivered: "success",
  on_hold: "warning",
  cancelled: "danger",
};

export type Address = {
  contactName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  country: string;
  zipCode: string;
  city: string;
  state: string;
  companyName: string;
  phone1: string;
  phone2: string;
  email: string;
};

export type ShipmentPackage = {
  number: number;
  weight: string;
  dimL: string;
  dimW: string;
  dimH: string;
  chargeLbs: string;
  insurance: string;
};

export type CommercialInvoiceLine = {
  packageNumber: number;
  packageContent: string;
  quantity: number;
  valuePerQty: string;
};

export type DocumentationRow = {
  id: number;
  documentType: string;
  documentName: string;
  createdOn: string;
  status: "active" | "inactive";
};

export type NoteRow = {
  id: number;
  date: string;
  comment: string;
};

export type ShipmentRow = {
  id: number;
  trackingNumber: string;
  date: string; // ISO
  managedBy: string;
  senderName: string;
  senderState: string;
  senderCountry: string;
  receiverName: string;
  receiverState: string;
  receiverCountry: string;
  shipmentType: ShipmentType;
  status: ShipmentStatus;
  linkedQuoteId: number | null;
};

export type ShipmentDetail = ShipmentRow & {
  allClear: "ready" | "not_ready";
  packageType: "package" | "document" | "pallet";
  username: string;
  serviceType: string;
  subServiceType: string;
  sender: Address;
  recipient: Address;
  pickup: {
    pickupProvider: string;
    pickupDate: string;
    startTime: string;
    endTime: string;
    specialInstruction: string;
  };
  additional: {
    shipDate: string;
    locationType: "residential" | "commercial";
    dutiesTaxesPaidBy: string;
  };
  packages: ShipmentPackage[];
  doNotShowOnMyShipment: boolean;
  commercialInvoice: CommercialInvoiceLine[];
  paymentIssued: boolean;
  hasTracking: boolean;
  hasManualTracking: boolean;
  documentation: DocumentationRow[];
  notes: NoteRow[];
};

// mulberry32 — tiny seeded PRNG so mock rows are stable across server render
// and client hydration (Math.random() here would mismatch the two).
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MANAGED_BY = ["A. Fernandes", "R. Okafor", "M. Suzuki", "L. Novak", "S. Bianchi"];
const SENDER_NAMES = ["Carlos Mendez", "Priya Nair", "Owen Baxter", "Julia Kowalski", "Devon Ellis"];
const RECEIVER_NAMES = ["Amara Chen", "Felix Torres", "Ingrid Larsen", "Noah Bergström", "Riya Kapoor"];
const PLACES: { city: string; state: string; country: string }[] = [
  { city: "Brampton", state: "Ontario", country: "Canada" },
  { city: "Little Rock", state: "Arkansas", country: "United States" },
  { city: "Columbus", state: "Ohio", country: "United States" },
  { city: "San Jose", state: "California", country: "United States" },
  { city: "Gurugram", state: "Haryana", country: "India" },
  { city: "Hyderabad", state: "Telangana", country: "India" },
  { city: "Bengaluru", state: "Karnataka", country: "India" },
  { city: "Austin", state: "Texas", country: "United States" },
  { city: "Karachi", state: "Sindh", country: "Pakistan" },
];
const SERVICE_TYPES = ["Standard", "Express", "Economy"];
const SUB_SERVICE_TYPES = ["Door to Door", "Door to Port", "Port to Port"];
const CONTENT = ["Documents", "Electronics", "Apparel", "Auto Parts", "Household Goods"];

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function trackingNumber(rng: () => number): string {
  let n = "";
  for (let i = 0; i < 12; i++) n += Math.floor(rng() * 10).toString();
  return n;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function buildDetail(id: number): ShipmentDetail {
  const rng = mulberry32(id * 2654435761);
  const from = pick(rng, PLACES);
  let to = pick(rng, PLACES);
  while (to === from) to = pick(rng, PLACES);
  const shipmentType: ShipmentType = rng() > 0.5 ? "air" : "ocean";
  const statuses = Object.keys(SHIPMENT_STATUS_LABELS) as ShipmentStatus[];
  const status = pick(rng, statuses);
  const senderName = pick(rng, SENDER_NAMES);
  const receiverName = pick(rng, RECEIVER_NAMES);
  const packageCount = 1 + Math.floor(rng() * 3);

  const sender: Address = {
    contactName: senderName,
    addressLine1: `${10 + Math.floor(rng() * 900)} Harbor Rd`,
    addressLine2: "",
    addressLine3: "",
    country: from.country,
    zipCode: `${10000 + Math.floor(rng() * 89999)}`,
    city: from.city,
    state: from.state,
    companyName: "",
    phone1: `+1${2000000000 + Math.floor(rng() * 799999999)}`,
    phone2: "",
    email: `${senderName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
  };
  const recipient: Address = {
    contactName: receiverName,
    addressLine1: `${10 + Math.floor(rng() * 900)} Fifth Ave`,
    addressLine2: "",
    addressLine3: "",
    country: to.country,
    zipCode: `${10000 + Math.floor(rng() * 89999)}`,
    city: to.city,
    state: to.state,
    companyName: "",
    phone1: `+1${2000000000 + Math.floor(rng() * 799999999)}`,
    phone2: "",
    email: `${receiverName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
  };

  const packages: ShipmentPackage[] = Array.from({ length: packageCount }, (_, i) => ({
    number: i + 1,
    weight: (1 + Math.floor(rng() * 40)).toFixed(1),
    dimL: (8 + Math.floor(rng() * 20)).toString(),
    dimW: (6 + Math.floor(rng() * 16)).toString(),
    dimH: (2 + Math.floor(rng() * 10)).toString(),
    chargeLbs: (1 + Math.floor(rng() * 40)).toFixed(2),
    insurance: "0.00",
  }));

  const commercialInvoice: CommercialInvoiceLine[] = packages.map((p) => ({
    packageNumber: p.number,
    packageContent: pick(rng, CONTENT),
    quantity: 1,
    valuePerQty: (10 + Math.floor(rng() * 190)).toFixed(2),
  }));

  return {
    id,
    trackingNumber: trackingNumber(rng),
    date: isoDaysAgo(Math.floor(rng() * 30)),
    managedBy: pick(rng, MANAGED_BY),
    senderName,
    senderState: from.state,
    senderCountry: from.country,
    receiverName,
    receiverState: to.state,
    receiverCountry: to.country,
    shipmentType,
    status,
    linkedQuoteId: rng() > 0.4 ? 1 + Math.floor(rng() * 20) : null,
    allClear: rng() > 0.5 ? "ready" : "not_ready",
    packageType: "package",
    username: senderName.toLowerCase().replace(/\s+/g, ""),
    serviceType: pick(rng, SERVICE_TYPES),
    subServiceType: pick(rng, SUB_SERVICE_TYPES),
    sender,
    recipient,
    pickup: {
      pickupProvider: "",
      pickupDate: "",
      startTime: "",
      endTime: "",
      specialInstruction: "",
    },
    additional: {
      shipDate: isoDaysAgo(Math.max(0, Math.floor(rng() * 30) - 5)),
      locationType: rng() > 0.5 ? "residential" : "commercial",
      dutiesTaxesPaidBy: "",
    },
    packages,
    doNotShowOnMyShipment: false,
    commercialInvoice,
    paymentIssued: rng() > 0.6,
    hasTracking: shipmentType === "air" ? rng() > 0.3 : false,
    hasManualTracking: rng() > 0.7,
    documentation: [
      {
        id: id * 10 + 1,
        documentType: "Commercial Invoice",
        documentName: "",
        createdOn: isoDaysAgo(Math.floor(rng() * 10)),
        status: "active",
      },
      {
        id: id * 10 + 2,
        documentType: "Invoice",
        documentName: "",
        createdOn: isoDaysAgo(Math.floor(rng() * 10)),
        status: "active",
      },
    ],
    notes: [],
  };
}

const MOCK_SHIPMENTS: ShipmentDetail[] = Array.from({ length: 24 }, (_, i) => buildDetail(i + 1));

export function listMockShipments(): ShipmentRow[] {
  return MOCK_SHIPMENTS.map(
    ({
      id,
      trackingNumber: tn,
      date,
      managedBy,
      senderName,
      senderState,
      senderCountry,
      receiverName,
      receiverState,
      receiverCountry,
      shipmentType,
      status,
      linkedQuoteId,
    }) => ({
      id,
      trackingNumber: tn,
      date,
      managedBy,
      senderName,
      senderState,
      senderCountry,
      receiverName,
      receiverState,
      receiverCountry,
      shipmentType,
      status,
      linkedQuoteId,
    }),
  );
}

export function getMockShipment(id: number): ShipmentDetail | null {
  return MOCK_SHIPMENTS.find((s) => s.id === id) ?? null;
}

export function blankShipment(): ShipmentDetail {
  const blankAddress: Address = {
    contactName: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    country: "",
    zipCode: "",
    city: "",
    state: "",
    companyName: "",
    phone1: "",
    phone2: "",
    email: "",
  };
  return {
    id: 0,
    trackingNumber: "NEW",
    date: new Date().toISOString(),
    managedBy: "",
    senderName: "",
    senderState: "",
    senderCountry: "",
    receiverName: "",
    receiverState: "",
    receiverCountry: "",
    shipmentType: "air",
    status: "new_request",
    linkedQuoteId: null,
    allClear: "not_ready",
    packageType: "package",
    username: "",
    serviceType: "",
    subServiceType: "",
    sender: { ...blankAddress },
    recipient: { ...blankAddress },
    pickup: { pickupProvider: "", pickupDate: "", startTime: "", endTime: "", specialInstruction: "" },
    additional: { shipDate: "", locationType: "residential", dutiesTaxesPaidBy: "" },
    packages: [{ number: 1, weight: "", dimL: "", dimW: "", dimH: "", chargeLbs: "0.00", insurance: "0.00" }],
    doNotShowOnMyShipment: false,
    commercialInvoice: [],
    paymentIssued: false,
    hasTracking: false,
    hasManualTracking: false,
    documentation: [],
    notes: [],
  };
}

/** Seeds a blank shipment from an accepted Quote's route + contact (the
 * "Convert to Shipment" action on the Quotes list) — everything else still
 * starts empty for the admin to fill in. */
export function blankShipmentFromQuote(quote: {
  id: number;
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}): ShipmentDetail {
  const shipment = blankShipment();
  shipment.linkedQuoteId = quote.id;
  shipment.sender = {
    ...shipment.sender,
    contactName: quote.contactName ?? "",
    email: quote.contactEmail ?? "",
    phone1: quote.contactPhone ?? "",
    country: quote.fromCountry,
    zipCode: quote.fromZip,
  };
  shipment.recipient = {
    ...shipment.recipient,
    country: quote.toCountry,
    zipCode: quote.toZip,
  };
  shipment.senderCountry = quote.fromCountry;
  shipment.receiverCountry = quote.toCountry;
  shipment.notes = [
    {
      id: Date.now(),
      date: new Date().toISOString(),
      comment: `Converted from Quote #${quote.id}.`,
    },
  ];
  return shipment;
}
