import { db } from "@/lib/db";
import { publicApiRoute } from "@/lib/public-route";
import { emptyStringsToNull } from "@/lib/validation/common";
import { CALLBACK_TIME_SLOTS, callbackRequestStoreInput } from "@/lib/validation/callback-request";
import { formatPackageTypes } from "@/lib/package-type";
import { sendAdminCallbackNotification } from "@/lib/mail";

const TIME_SLOT_LABELS: Record<string, string> = Object.fromEntries(
  CALLBACK_TIME_SLOTS.map((s) => [s.value, `${s.label} (${s.hint})`]),
);

// Public store for the /quick-quote "call me back" lead form — a lighter
// counterpart to POST /api/quotes with no route/package-detail collection.
// Same same-origin + rate-limit posture (publicApiRoute), separate bucket
// name so it doesn't share the quotes.store limit.
export const POST = publicApiRoute({ name: "callback-requests.store", limit: 10 }, async (req) => {
  const data = callbackRequestStoreInput.parse(emptyStringsToNull(await req.json()));
  const { contact } = data;

  const now = new Date();
  const created = await db.callbackRequest.create({
    data: {
      name: contact.name,
      email: contact.email,
      countryCode: contact.country_code,
      phone: contact.phone,
      timeSlot: data.time_slot,
      timezone: data.timezone,
      packageType: data.package_type,
      createdAt: now,
      updatedAt: now,
    },
  });

  try {
    await sendAdminCallbackNotification({
      requestId: Number(created.id),
      name: contact.name,
      email: contact.email,
      mobileNumber: `${contact.country_code} ${contact.phone}`.trim(),
      timeSlotLabel: TIME_SLOT_LABELS[data.time_slot] ?? data.time_slot,
      timezone: data.timezone,
      packageTypeLabel: formatPackageTypes(data.package_type),
    });
  } catch {
    /* best-effort — never fail the request because a mail outage happened. */
  }

  return Response.json(
    { message: "We got your request — we'll call you back soon!", request_id: Number(created.id) },
    { status: 201 },
  );
});
