import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { publicApiRoute } from "@/lib/public-route";
import { emptyStringsToNull } from "@/lib/validation/common";
import { quoteLeadInput } from "@/lib/validation/quote-lead";

// Saves (or updates) a partial quote lead from the /quotes wizard, so the
// team can see people who gave their details in step 1 but never submitted
// (listed at /admin/leads). Same same-origin + per-IP rate-limit posture as
// the other public writes, on its own bucket. Sends no email, on purpose:
// most people finish within a minute or two, and a mail per step would be
// noise. The full quote still sends the usual notifications.
export const POST = publicApiRoute({ name: "quote-leads.store", limit: 20 }, async (req) => {
  const data = quoteLeadInput.parse(emptyStringsToNull(await req.json()));
  const { contact } = data;
  const now = new Date();
  const fields = {
    name: contact.name.trim(),
    email: contact.email.trim(),
    countryCode: contact.country_code,
    phone: contact.phone.trim(),
    ...(data.from_country ? { fromCountry: data.from_country } : {}),
    ...(data.to_country ? { toCountry: data.to_country } : {}),
    updatedAt: now,
  };

  // Update the visitor's own lead when they already have one (and it hasn't
  // turned into a quote yet); otherwise start a new one.
  if (data.token) {
    const updated = await db.quoteLead.updateMany({
      where: { token: data.token, convertedAt: null },
      data: fields,
    });
    if (updated.count > 0) return Response.json({ token: data.token });
  }

  const token = randomBytes(24).toString("base64url");
  await db.quoteLead.create({ data: { ...fields, token, createdAt: now } });
  return Response.json({ token }, { status: 201 });
});
