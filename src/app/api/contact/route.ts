import { publicApiRoute } from "@/lib/public-route";
import { emptyStringsToNull } from "@/lib/validation/common";
import { contactSupportSchema } from "@/lib/validation/contact-support";
import { sendMail, SALES_FROM } from "@/lib/mail";

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

// Public port of the Contact Support form (04_Contact_us Figma set). Same
// same-origin + rate-limit guardrails as POST /api/quotes. No DB row — this
// is a best-effort notification to staff, not a stored record.
export const POST = publicApiRoute({ name: "contact.store", limit: 5 }, async (req) => {
  const data = contactSupportSchema.parse(emptyStringsToNull(await req.json()));

  const recipients = (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (recipients.length > 0) {
    const text = [
      `New contact support message from ${data.name} (${data.email})`,
      `Phone: ${data.country_code} ${data.phone}`,
      "",
      data.message,
    ].join("\n");
    const html = `
      <p><strong>New contact support message</strong></p>
      <p>${esc(data.name)} &lt;${esc(data.email)}&gt;<br>Phone: ${esc(data.country_code)} ${esc(data.phone)}</p>
      <p>${esc(data.message).replace(/\n/g, "<br>")}</p>
    `;
    try {
      await sendMail({
        to: recipients.join(","),
        subject: `Contact Support — ${data.name}`,
        text,
        html,
        from: SALES_FROM,
      });
    } catch {
      /* best-effort — never fail the request on a mail outage. */
    }
  }

  return Response.json({ message: "Your message has been sent." }, { status: 201 });
});
