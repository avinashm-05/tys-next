import type { Prisma } from "@prisma/client";
import { normalizeCode } from "@/lib/countries";
import { FedExClient, FedExError, type FedExRequester } from "./client";
import { fedexConfig, shipCredentials, shipConfigured } from "./config";

/**
 * FedEx Ship API (ship/v1/shipments) — creates a shipment and returns the
 * printable label(s).
 *
 * This is the one FedEx call in the app with real-world side effects: a
 * successful request against a production project books actual freight and
 * bills the account. Everything here is therefore fail-closed — no implicit
 * credential fallback (see config.ts), and a hard refusal rather than a
 * guess whenever required shipment data is missing.
 */

const LABEL_CONTENT_TYPES: Record<string, string> = {
  PDF: "application/pdf",
  PNG: "image/png",
  ZPLII: "application/octet-stream",
};

export type GeneratedLabel = {
  trackingNumber: string;
  /** Raw label bytes, already base64-decoded. */
  bytes: Buffer;
  contentType: string;
  extension: string;
};

export type ShipResult =
  | { success: true; masterTrackingNumber: string; labels: GeneratedLabel[] }
  | { success: false; message: string };

/** The columns generateLabel needs — a subset of the Shipment row. */
export type ShippableShipment = Prisma.ShipmentGetPayload<{
  include: { packages: true; invoiceLines: true };
}>;

function requiredAddressProblems(s: ShippableShipment): string[] {
  const missing: string[] = [];
  if (!s.serviceType) missing.push("Service Type");
  if (!s.senderContactName || !s.senderAddressLine1 || !s.senderCity || !s.senderPostalCode)
    missing.push("a complete sender address");
  if (
    !s.recipientContactName ||
    !s.recipientAddressLine1 ||
    !s.recipientCity ||
    !s.recipientPostalCode
  )
    missing.push("a complete recipient address");
  if (!s.senderPhone1) missing.push("Sender Phone 1");
  if (!s.recipientPhone1) missing.push("Recipient Phone 1");
  if (s.packages.length === 0) missing.push("at least one package");
  return missing;
}

/**
 * FedEx rejects a street array containing empty strings, so lines 2/3 are
 * only included when actually filled in.
 */
function streetLines(l1: string, l2: string | null, l3: string | null): string[] {
  return [l1, l2, l3].filter((l): l is string => Boolean(l && l.trim()));
}

function buildPackageLineItems(s: ShippableShipment) {
  return s.packages.flatMap((p) => {
    const weight = Number(p.weight ?? 0);
    // A quantity of N on one row means N identical pieces, and FedEx wants
    // one line item per physical piece — it has no per-line quantity field.
    const copies = Math.max(1, p.quantity);
    const item: Record<string, unknown> = {
      weight: {
        units: (p.weightUnit ?? "lb").toUpperCase() === "KG" ? "KG" : "LB",
        value: weight > 0 ? weight : 1,
      },
    };
    const [l, w, h] = [Number(p.length ?? 0), Number(p.width ?? 0), Number(p.height ?? 0)];
    // Dimensions are optional to FedEx but must be complete when present —
    // a partial set (length only) is rejected, so send all three or none.
    if (l > 0 && w > 0 && h > 0) {
      item.dimensions = { length: Math.ceil(l), width: Math.ceil(w), height: Math.ceil(h), units: "IN" };
    }
    return Array.from({ length: copies }, () => item);
  });
}

/**
 * Customs for international labels, built from the Commercial Invoice tab's
 * lines. FedEx will not produce an international label without this, so a
 * shipment crossing a border with an empty invoice tab is refused up front
 * (with a message naming the tab) rather than failing deep inside FedEx.
 */
function buildCustomsClearanceDetail(s: ShippableShipment, accountNumber: string) {
  const commodities = s.invoiceLines.map((l) => ({
    description: l.packageContent,
    quantity: l.quantity,
    quantityUnits: "PCS",
    unitPrice: { amount: Number(l.valuePerQty), currency: "USD" },
    customsValue: { amount: Number(l.valuePerQty) * l.quantity, currency: "USD" },
    weight: { units: "LB", value: 1 },
  }));
  const total = commodities.reduce((sum, c) => sum + c.customsValue.amount, 0);
  return {
    dutiesPayment: {
      paymentType: "SENDER",
      payor: { responsibleParty: { accountNumber: { value: accountNumber } } },
    },
    commodities,
    totalCustomsValue: { amount: total, currency: "USD" },
  };
}

type ShipResponse = {
  output?: {
    transactionShipments?: Array<{
      masterTrackingNumber?: string;
      pieceResponses?: Array<{
        trackingNumber?: string;
        packageDocuments?: Array<{ encodedLabel?: string; contentType?: string; url?: string }>;
      }>;
    }>;
  };
};

/** Pulls the human-readable reason out of FedEx's error envelope. */
function fedexMessage(e: FedExError): string {
  const rows = (e.errorBody as { errors?: Array<{ message?: string; code?: string }> }).errors ?? [];
  const detail = rows
    .map((r) => r.message || r.code)
    .filter(Boolean)
    .join(" ");
  return detail || `FedEx rejected the label request (HTTP ${e.httpStatus}).`;
}

export async function generateLabel(
  shipment: ShippableShipment,
  client?: FedExRequester,
): Promise<ShipResult> {
  if (!shipConfigured()) {
    return {
      success: false,
      message:
        "FedEx label generation isn't configured yet — FEDEX_SHIP_CLIENT_ID, FEDEX_SHIP_CLIENT_SECRET and an account number are required.",
    };
  }

  const missing = requiredAddressProblems(shipment);
  if (missing.length > 0) {
    return { success: false, message: `Can't generate a label without ${missing.join(", ")}.` };
  }

  const cfg = fedexConfig();
  const accountNumber = cfg.shipAccountNumber.trim();
  const originCountry = normalizeCode(shipment.senderCountry);
  const destCountry = normalizeCode(shipment.recipientCountry);
  const isInternational = originCountry !== destCountry;

  if (isInternational && shipment.invoiceLines.length === 0) {
    return {
      success: false,
      message:
        "An international label needs customs details — add at least one line on the Commercial Inv. tab first.",
    };
  }

  const imageType = cfg.shipLabelImageType.toUpperCase();
  const payload: Record<string, unknown> = {
    labelResponseOptions: "LABEL",
    accountNumber: { value: accountNumber },
    requestedShipment: {
      shipper: {
        contact: {
          personName: shipment.senderContactName,
          companyName: shipment.senderCompanyName || undefined,
          phoneNumber: shipment.senderPhone1,
          emailAddress: shipment.senderEmail || undefined,
        },
        address: {
          streetLines: streetLines(
            shipment.senderAddressLine1,
            shipment.senderAddressLine2,
            shipment.senderAddressLine3,
          ),
          city: shipment.senderCity,
          stateOrProvinceCode: shipment.senderState || undefined,
          postalCode: shipment.senderPostalCode,
          countryCode: originCountry,
        },
      },
      recipients: [
        {
          contact: {
            personName: shipment.recipientContactName,
            companyName: shipment.recipientCompanyName || undefined,
            phoneNumber: shipment.recipientPhone1,
            emailAddress: shipment.recipientEmail || undefined,
          },
          address: {
            streetLines: streetLines(
              shipment.recipientAddressLine1,
              shipment.recipientAddressLine2,
              shipment.recipientAddressLine3,
            ),
            city: shipment.recipientCity,
            stateOrProvinceCode: shipment.recipientState || undefined,
            postalCode: shipment.recipientPostalCode,
            countryCode: destCountry,
            residential: shipment.recipientLocationType === "residential",
          },
        },
      ],
      shipDatestamp: new Date().toISOString().slice(0, 10),
      serviceType: shipment.serviceType,
      packagingType: "YOUR_PACKAGING",
      pickupType: cfg.pickupType,
      // SENDER-pay must name the payor account explicitly and it has to match
      // accountNumber above — same production requirement the Rate call hit.
      shippingChargesPayment: {
        paymentType: "SENDER",
        payor: { responsibleParty: { accountNumber: { value: accountNumber } } },
      },
      labelSpecification: {
        imageType,
        labelStockType: cfg.shipLabelStockType,
      },
      requestedPackageLineItems: buildPackageLineItems(shipment),
      ...(isInternational
        ? { customsClearanceDetail: buildCustomsClearanceDetail(shipment, accountNumber) }
        : {}),
    },
  };

  let body: ShipResponse;
  try {
    const requester = client ?? new FedExClient(shipCredentials());
    body = (await requester.request("POST", cfg.shipEndpoint, payload)) as ShipResponse;
  } catch (e) {
    if (e instanceof FedExError) return { success: false, message: fedexMessage(e) };
    return { success: false, message: "Couldn't reach FedEx to generate the label." };
  }

  const txn = body.output?.transactionShipments?.[0];
  const pieces = txn?.pieceResponses ?? [];
  const contentType = LABEL_CONTENT_TYPES[imageType] ?? "application/octet-stream";
  const extension = imageType === "ZPLII" ? "zpl" : imageType.toLowerCase();

  const labels: GeneratedLabel[] = [];
  for (const piece of pieces) {
    for (const doc of piece.packageDocuments ?? []) {
      if (!doc.encodedLabel) continue;
      labels.push({
        trackingNumber: piece.trackingNumber ?? txn?.masterTrackingNumber ?? "",
        bytes: Buffer.from(doc.encodedLabel, "base64"),
        contentType: doc.contentType ?? contentType,
        extension,
      });
    }
  }

  if (labels.length === 0) {
    return {
      success: false,
      message: "FedEx accepted the shipment but returned no label document.",
    };
  }

  return {
    success: true,
    masterTrackingNumber: txn?.masterTrackingNumber ?? labels[0].trackingNumber,
    labels,
  };
}
