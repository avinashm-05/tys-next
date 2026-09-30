import { db } from "@/lib/db";
import { sendShipmentBookedEmails } from "@/lib/mail";
import { countryName } from "@/lib/countries";
import { customerRoute } from "@/lib/auth";
import { HttpError } from "@/lib/validation/errors";
import { emptyStringsToNull } from "@/lib/validation/common";
import { shipmentStoreInput, type ShipmentStoreInput } from "@/lib/validation/shipment-store";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";

// Self-serve "Schedule Shipment" booking (C-portal) — the customer
// counterpart to POST /api/quotes. Validate → create the shipment + package
// rows IN ONE TRANSACTION, scoped to the session's userId (never a
// client-supplied id, same posture as PATCH /api/account/profile).

type Party = ShipmentStoreInput["sender"];

function senderColumns(party: Party) {
  return {
    senderContactName: party.contact_name,
    senderCompanyName: party.company_name ?? null,
    senderAddressLine1: party.address_line_1,
    senderAddressLine2: party.address_line_2 ?? null,
    senderAddressLine3: party.address_line_3 ?? null,
    senderCity: party.city,
    senderState: party.state,
    senderCountry: party.country,
    senderPostalCode: party.postal_code,
    senderPhone1: party.phone_1,
    senderPhone2: party.phone_2 ?? null,
    senderEmail: party.email || null,
  };
}

function recipientColumns(party: Party) {
  return {
    recipientContactName: party.contact_name,
    recipientCompanyName: party.company_name ?? null,
    recipientAddressLine1: party.address_line_1,
    recipientAddressLine2: party.address_line_2 ?? null,
    recipientAddressLine3: party.address_line_3 ?? null,
    recipientCity: party.city,
    recipientState: party.state,
    recipientCountry: party.country,
    recipientPostalCode: party.postal_code,
    recipientPhone1: party.phone_1,
    recipientPhone2: party.phone_2 ?? null,
    recipientEmail: party.email || null,
  };
}

export const POST = customerRoute(async (req, _ctx, session) => {
  const data = shipmentStoreInput.parse(emptyStringsToNull(await req.json()));

  if (data.linked_quote_id) {
    const quote = await db.quote.findUnique({ where: { id: BigInt(data.linked_quote_id) } });
    if (!quote || quote.email?.toLowerCase() !== session.user.email.toLowerCase()) {
      throw new HttpError(403, "This quote does not belong to your account.");
    }
  }

  const now = new Date();
  const shipmentId = await db.$transaction(async (tx) => {
    const shipment = await tx.shipment.create({
      data: {
        userId: BigInt(session.user.id),
        linkedQuoteId: data.linked_quote_id ? BigInt(data.linked_quote_id) : null,
        shipmentType: data.shipment_type,
        fromCountry: data.from_country,
        toCountry: data.to_country,
        status: "new_request",
        ...senderColumns(data.sender),
        ...recipientColumns(data.recipient),
        recipientLocationType: data.recipient.location_type,
        packageType: data.package_type,
        pickupProvider: data.pickup_needed ? "TYS pickup requested" : "Customer drop-off",
        pickupDate: data.pickup_needed && data.pickup_date ? new Date(`${data.pickup_date}T00:00:00Z`) : null,
        specialInstruction: data.special_instruction ?? null,
        createdAt: now,
        updatedAt: now,
      },
    });

    for (const line of data.packages) {
      const chargeable =
        line.chargeable_weight ??
        calculateChargeableWeight(
          line.weight,
          { length: line.length, width: line.width, height: line.height },
          "lb",
        );
      await tx.shipmentPackageLine.create({
        data: {
          shipmentId: shipment.id,
          quantity: line.quantity,
          weight: line.weight,
          weightUnit: "lb",
          length: line.length,
          width: line.width,
          height: line.height,
          chargeableWeight: chargeable,
          insuredValue: line.insured_value ?? null,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    return shipment.id;
  });

  // Customer confirmation + staff alert (fire-and-forget: a mail outage
  // must never fail the booking; sendShipmentBookedEmails never throws).
  const place = (city: string, country: string) => [city, countryName(country)].filter(Boolean).join(", ");
  const pkgCount = data.packages.reduce((n, l) => n + l.quantity, 0);
  const weight = Math.round(data.packages.reduce((w, l) => w + l.weight * l.quantity, 0) * 100) / 100;
  void sendShipmentBookedEmails({
    shipmentId: Number(shipmentId),
    customerName: session.user.name,
    customerEmail: session.user.email,
    fromPlace: place(data.sender.city, data.sender.country),
    toPlace: place(data.recipient.city, data.recipient.country),
    shipmentType: { air: "Air", ground: "Ground", ocean: "Ocean" }[data.shipment_type],
    packageTypeLabel: { package: "Boxes / packages", document: "Documents", pallet: "Pallet / freight" }[data.package_type],
    packages: pkgCount,
    totalWeightLb: weight,
    pickup:
      data.pickup_needed && data.pickup_date
        ? `TYS pickup on ${new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${data.pickup_date}T00:00:00Z`))}`
        : "Customer drops it off",
    instructions: data.special_instruction ?? null,
    adminUrl: `${(process.env.BETTER_AUTH_URL ?? "").replace(/\/+$/, "")}/admin/shipments/${Number(shipmentId)}/edit`,
  });

  return Response.json({ id: Number(shipmentId) }, { status: 201 });
});
