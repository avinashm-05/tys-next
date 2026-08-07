import { z } from "zod";
import { weightUnit } from "@/lib/validation/common";

// Server-side shapes for the admin Shipment detail editor (GET/PATCH
// /api/admin/shipments/[id] + its Notes/Tracking sub-resources). Mirrors
// admin-quote-detail.ts's permissiveness: staff can leave fields blank
// mid-edit, this isn't the customer-facing wizard's strict validation.

export const adminAddressInput = z.object({
  contactName: z.string().max(255).nullish(),
  companyName: z.string().max(255).nullish(),
  addressLine1: z.string().max(255).nullish(),
  addressLine2: z.string().max(255).nullish(),
  addressLine3: z.string().max(255).nullish(),
  city: z.string().max(100).nullish(),
  state: z.string().max(100).nullish(),
  country: z.string().max(100).nullish(),
  zipCode: z.string().max(20).nullish(),
  phone1: z.string().max(30).nullish(),
  phone2: z.string().max(30).nullish(),
  email: z.string().max(255).nullish(),
});

export const adminShipmentPackageRowInput = z.object({
  // Negative ids are client-generated temp ids for a row added this session
  // (create); positive ids are real ShipmentPackageLine rows (update); any
  // existing row not present in the submitted list was removed (delete) —
  // same reconciliation convention as admin-quote-detail.ts's packages.
  id: z.coerce.number(),
  quantity: z.coerce.number().int().min(1).default(1),
  weight: z.coerce.number().min(0).nullish(),
  weightUnit: weightUnit.nullish(),
  length: z.coerce.number().min(0).nullish(),
  width: z.coerce.number().min(0).nullish(),
  height: z.coerce.number().min(0).nullish(),
  chargeableWeight: z.coerce.number().min(0).nullish(),
  insuredValue: z.coerce.number().min(0).nullish(),
});

export const adminShipmentInvoiceLineInput = z.object({
  id: z.coerce.number(),
  packageNumber: z.coerce.number().int().min(1).default(1),
  packageContent: z.string().max(255).nullish(),
  quantity: z.coerce.number().int().min(1).default(1),
  valuePerQty: z.coerce.number().min(0).default(0),
});

export const adminShipmentDocumentInput = z.object({
  id: z.coerce.number(),
  documentType: z.string().min(1).max(100),
  documentName: z.string().max(255).nullish(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const adminShipmentDetailInput = z.object({
  status: z.enum(["new_request", "ready_for_pickup", "in_transit", "delivered", "on_hold", "cancelled"]),
  allClear: z.enum(["ready", "not_ready"]),
  packageType: z.enum(["package", "document", "pallet"]),
  managedBy: z.string().max(255).nullish(),
  shipmentType: z.enum(["air", "ground", "ocean"]),
  serviceType: z.string().max(100).nullish(),
  subServiceType: z.string().max(100).nullish(),

  sender: adminAddressInput,
  recipient: adminAddressInput,

  pickup: z.object({
    pickupProvider: z.string().max(100).nullish(),
    pickupDate: z.string().max(20).nullish(),
    startTime: z.string().max(10).nullish(),
    endTime: z.string().max(10).nullish(),
    specialInstruction: z.string().max(29).nullish(),
  }),
  additional: z.object({
    shipDate: z.string().max(20).nullish(),
    locationType: z.enum(["residential", "commercial"]),
    dutiesTaxesPaidBy: z.string().max(100).nullish(),
  }),

  packages: z.array(adminShipmentPackageRowInput),
  doNotShowOnMyShipment: z.boolean().default(false),
  commercialInvoice: z.array(adminShipmentInvoiceLineInput),
  documentation: z.array(adminShipmentDocumentInput),
});
export type AdminShipmentDetailInput = z.infer<typeof adminShipmentDetailInput>;

export const shipmentNoteInput = z.object({
  comment: z.string({ error: () => "Please write a comment." }).min(1, "Please write a comment.").max(5000),
});

export const shipmentTrackingEventInput = z.object({
  occurredAt: z.string().min(1, "Please pick a date/time."),
  status: z.string({ error: () => "Please enter a status." }).min(1, "Please enter a status.").max(100),
  location: z.string().max(255).nullish(),
  note: z.string().max(2000).nullish(),
});
