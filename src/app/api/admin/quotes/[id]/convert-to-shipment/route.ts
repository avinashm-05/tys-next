import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { HttpError } from "@/lib/validation/errors";

type Ctx = { params: Promise<{ id: string }> };

// Admin "Convert to Shipment" — persists a real Shipment row seeded from the
// quote's route/contact fields (previously just a client-side navigation
// with an in-memory prefill, see mock-data.ts's blankShipmentFromQuote).
// userId is nullable: a quote's denormalized email may not match any
// registered customer account, in which case the shipment is staff-managed
// and simply won't appear on that customer's /account/shipments.
export const POST = adminRoute<Ctx>(async (req, ctx) => {
  const id = parseId((await ctx.params).id);
  const quote = id !== null ? await db.quote.findUnique({ where: { id } }) : null;
  if (!quote) throw new HttpError(404, "Quote not found.");

  const matchedUser = quote.email
    ? await db.user.findUnique({ where: { email: quote.email }, select: { id: true } })
    : null;

  const now = new Date();
  const shipment = await db.shipment.create({
    data: {
      userId: matchedUser?.id ?? null,
      linkedQuoteId: quote.id,
      shipmentType: "air",
      fromCountry: quote.fromCountry,
      toCountry: quote.toCountry,
      status: "new_request",

      senderContactName: quote.name ?? "",
      senderAddressLine1: "",
      senderCity: "",
      senderState: "",
      senderCountry: quote.fromCountry,
      senderPostalCode: quote.fromZip,
      senderPhone1: quote.mobileNumber ?? "",
      senderEmail: quote.email,

      recipientContactName: "",
      recipientAddressLine1: "",
      recipientCity: "",
      recipientState: "",
      recipientCountry: quote.toCountry,
      recipientPostalCode: quote.toZip,
      recipientPhone1: "",

      createdAt: now,
      updatedAt: now,
    },
  });

  return Response.json({ id: Number(shipment.id) }, { status: 201 });
});
