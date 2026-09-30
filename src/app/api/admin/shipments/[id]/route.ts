import { adminRoute } from "@/lib/auth";
import { maskEmail } from "@/lib/mask";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { countryName } from "@/lib/countries";
import { sendShipmentStatusEmail, shipmentStatusLabel } from "@/lib/mail";
import { emptyStringsToNull } from "@/lib/validation/common";
import { adminShipmentDetailInput } from "@/lib/validation/admin-shipment-detail";
import { HttpError } from "@/lib/validation/errors";
import { SHIPMENT_DETAIL_INCLUDE, serializeShipmentDetail } from "../helpers";

type Ctx = { params: Promise<{ id: string }> };

function toDateOrNull(v: string | null | undefined): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Detail read + the admin editor's Save/Save & Exit — real backing for what
// was previously mock-data.ts's getMockShipment (see shipment-edit-client.tsx).
export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const id = parseId((await ctx.params).id);
  const row =
    id !== null
      ? await db.shipment.findUnique({ where: { id }, include: SHIPMENT_DETAIL_INCLUDE })
      : null;
  if (!row) throw new HttpError(404, "Shipment not found.");
  return Response.json(serializeShipmentDetail(row));
});

// Saves every tab except Accounts (no billing backend) and the
// automated-carrier half of Tracking (no FedEx wiring here — see
// tracking-events/route.ts for the manual half, which does persist).
// Packages/invoice lines/documents are reconciled by id: negative ids are
// client-generated temp ids for a row added this session (create), positive
// ids are real rows (update), and any existing row not present in the
// submitted list was removed in the editor (delete) — same convention as
// admin-quote-detail's packages.
export const PATCH = adminRoute<Ctx>(async (req, ctx, session) => {
  const id = parseId((await ctx.params).id);
  const existing =
    id !== null
      ? await db.shipment.findUnique({
          where: { id },
          include: { packages: true, invoiceLines: true, documents: true },
        })
      : null;
  if (!existing) throw new HttpError(404, "Shipment not found.");

  const data = adminShipmentDetailInput.parse(emptyStringsToNull(await req.json()));
  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.shipment.update({
      where: { id: existing.id },
      data: {
        status: data.status,
        allClear: data.allClear,
        packageType: data.packageType,
        managedBy: data.managedBy ?? null,
        shipmentType: data.shipmentType,
        serviceType: data.serviceType ?? null,
        subServiceType: data.subServiceType ?? null,

        senderContactName: data.sender.contactName ?? "",
        senderCompanyName: data.sender.companyName ?? null,
        senderAddressLine1: data.sender.addressLine1 ?? "",
        senderAddressLine2: data.sender.addressLine2 ?? null,
        senderAddressLine3: data.sender.addressLine3 ?? null,
        senderCity: data.sender.city ?? "",
        senderState: data.sender.state ?? "",
        senderCountry: data.sender.country ?? "",
        senderPostalCode: data.sender.zipCode ?? "",
        senderPhone1: data.sender.phone1 ?? "",
        senderPhone2: data.sender.phone2 ?? null,
        senderEmail: data.sender.email ?? null,

        recipientContactName: data.recipient.contactName ?? "",
        recipientCompanyName: data.recipient.companyName ?? null,
        recipientAddressLine1: data.recipient.addressLine1 ?? "",
        recipientAddressLine2: data.recipient.addressLine2 ?? null,
        recipientAddressLine3: data.recipient.addressLine3 ?? null,
        recipientCity: data.recipient.city ?? "",
        recipientState: data.recipient.state ?? "",
        recipientCountry: data.recipient.country ?? "",
        recipientPostalCode: data.recipient.zipCode ?? "",
        recipientPhone1: data.recipient.phone1 ?? "",
        recipientPhone2: data.recipient.phone2 ?? null,
        recipientEmail: data.recipient.email ?? null,
        recipientLocationType: data.additional.locationType,

        pickupProvider: data.pickup.pickupProvider ?? null,
        pickupDate: toDateOrNull(data.pickup.pickupDate),
        pickupStartTime: data.pickup.startTime ?? null,
        pickupEndTime: data.pickup.endTime ?? null,
        specialInstruction: data.pickup.specialInstruction ?? null,

        shipDate: toDateOrNull(data.additional.shipDate),
        dutiesTaxesPaidBy: data.additional.dutiesTaxesPaidBy ?? null,

        doNotShowOnMyShipment: data.doNotShowOnMyShipment,

        updatedAt: now,
      },
    });

    // Packages
    const keepPackageIds = new Set(data.packages.filter((p) => p.id > 0).map((p) => BigInt(p.id)));
    const packagesToDelete = existing.packages.filter((p) => !keepPackageIds.has(p.id));
    if (packagesToDelete.length > 0) {
      await tx.shipmentPackageLine.deleteMany({ where: { id: { in: packagesToDelete.map((p) => p.id) } } });
    }
    for (const p of data.packages) {
      const rowData = {
        quantity: p.quantity,
        weight: p.weight ?? null,
        weightUnit: p.weightUnit ?? null,
        length: p.length ?? null,
        width: p.width ?? null,
        height: p.height ?? null,
        chargeableWeight: p.chargeableWeight ?? null,
        insuredValue: p.insuredValue ?? null,
        updatedAt: now,
      };
      if (p.id > 0) {
        await tx.shipmentPackageLine.update({ where: { id: BigInt(p.id) }, data: rowData });
      } else {
        await tx.shipmentPackageLine.create({ data: { ...rowData, shipmentId: existing.id, createdAt: now } });
      }
    }

    // Commercial invoice lines
    const keepInvoiceIds = new Set(
      data.commercialInvoice.filter((l) => l.id > 0).map((l) => BigInt(l.id)),
    );
    const invoiceToDelete = existing.invoiceLines.filter((l) => !keepInvoiceIds.has(l.id));
    if (invoiceToDelete.length > 0) {
      await tx.shipmentInvoiceLine.deleteMany({ where: { id: { in: invoiceToDelete.map((l) => l.id) } } });
    }
    for (const l of data.commercialInvoice) {
      const rowData = {
        packageNumber: l.packageNumber,
        packageContent: l.packageContent ?? "",
        quantity: l.quantity,
        valuePerQty: l.valuePerQty,
        updatedAt: now,
      };
      if (l.id > 0) {
        await tx.shipmentInvoiceLine.update({ where: { id: BigInt(l.id) }, data: rowData });
      } else {
        await tx.shipmentInvoiceLine.create({ data: { ...rowData, shipmentId: existing.id, createdAt: now } });
      }
    }

    // Documentation rows (metadata only — see ShipmentDocument's schema comment)
    const keepDocIds = new Set(data.documentation.filter((d) => d.id > 0).map((d) => BigInt(d.id)));
    const docsToDelete = existing.documents.filter((d) => !keepDocIds.has(d.id));
    if (docsToDelete.length > 0) {
      await tx.shipmentDocument.deleteMany({ where: { id: { in: docsToDelete.map((d) => d.id) } } });
    }
    for (const d of data.documentation) {
      const rowData = {
        documentType: d.documentType,
        documentName: d.documentName ?? null,
        status: d.status,
        updatedAt: now,
      };
      if (d.id > 0) {
        await tx.shipmentDocument.update({ where: { id: BigInt(d.id) }, data: rowData });
      } else {
        await tx.shipmentDocument.create({ data: { ...rowData, shipmentId: existing.id, createdAt: now } });
      }
    }
  });

  console.info(`[audit] shipment ${Number(existing.id)} detail edited by user ${session.user.id}`);

  // Optional status email to the recipient. Runs after the save commits, and
  // a mail failure never fails the save: it's reported back so the editor
  // can say "saved, but the email didn't go out".
  let recipientEmail: { sentTo: string } | { error: string } | null = null;
  const to = data.recipient.email?.trim();
  if (data.notifyRecipient && data.status !== existing.status) {
    if (!to) {
      recipientEmail = { error: "No recipient email on this shipment." };
    } else {
      const place = (city: string | null | undefined, country: string | null | undefined) =>
        [city, countryName(country)].filter(Boolean).join(", ");
      try {
        const { subject } = await sendShipmentStatusEmail({
          to,
          recipientName: data.recipient.contactName ?? "",
          senderName: data.sender.contactName ?? "",
          fromPlace: place(data.sender.city, data.sender.country) || countryName(existing.fromCountry),
          toPlace: place(data.recipient.city, data.recipient.country) || countryName(existing.toCountry),
          trackingNumber: existing.trackingNumber,
          status: data.status,
        });
        recipientEmail = { sentTo: to };
        await db.shipmentNote
          .create({
            data: {
              shipmentId: existing.id,
              comment: `Email sent: status update (${shipmentStatusLabel(data.status)}) to ${to}. Subject: "${subject}"`,
              createdById: BigInt(session.user.id),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
          .catch((err) => console.error("[mail] couldn't log shipment email", err instanceof Error ? err.message : err));
        console.info(`[audit] shipment ${Number(existing.id)} status email (${data.status}) sent to ${maskEmail(to)} by user ${session.user.id}`);
      } catch {
        // sendMail already logged the failure.
        recipientEmail = { error: "The status email could not be sent." };
      }
    }
  }

  const row = await db.shipment.findUnique({ where: { id: existing.id }, include: SHIPMENT_DETAIL_INCLUDE });
  return Response.json({ ...serializeShipmentDetail(row!), recipientEmail });
});
