import nodemailer, { type Transporter } from "nodemailer";

/**
 * Mailer. Password-reset (A1) + quote-confirmation (A4.3). Production sends
 * through the SMTP_* env vars; everywhere else uses Nodemailer's jsonTransport
 * and logs the message to the console, so dev works without real SMTP.
 */

/** Blade auto-escapes; template literals don't — escape all interpolated text. */
function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  transporter =
    process.env.NODE_ENV === "production"
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          // 465 = implicit TLS; 587 = STARTTLS (secure: false + upgrade).
          secure: Number(process.env.SMTP_PORT ?? 587) === 465,
          auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
          },
        })
      : nodemailer.createTransport({ jsonTransport: true });
  return transporter;
}

const FROM = `"${process.env.MAIL_FROM_NAME ?? "TYS Global Logistics"}" <${
  process.env.MAIL_FROM_ADDRESS ?? "noreply@tysgloballogistics.com"
}>`;

export async function sendMail(opts: { to: string; subject: string; text: string; html: string }) {
  try {
    const info = await getTransporter().sendMail({ from: FROM, ...opts });
    if (process.env.NODE_ENV !== "production") {
      console.log("[mail:dev]", info.message);
    }
    return info;
  } catch (error) {
    // Logged in ALL environments — this is the only trace of a swallowed
    // reset-email failure (see sendPasswordResetEmail).
    console.error("[mail] send failed", { to: opts.to, error });
    throw error;
  }
}

/**
 * The reset link expires in 60 minutes (resetPasswordTokenExpiresIn, auth.ts).
 *
 * Send failures are swallowed ON PURPOSE (anti-enumeration): the
 * request-password-reset endpoint then always succeeds and the UI always
 * shows the neutral "check your email" screen, so account existence can't be
 * inferred from a mail outage. Tradeoff: a legitimate user whose email fails
 * to send gets no on-screen error — the failure lives in the server log
 * (sendMail above) and live SMTP is proven by scripts/test-email.ts. The
 * right call for an admin-only tool with no public registration.
 */
export async function sendPasswordResetEmail(to: string, url: string) {
  await sendMail({
    to,
    subject: "Reset your TYS Global Logistics password",
    text: `Reset your password by opening this link:\n\n${url}\n\nThe link expires in 60 minutes. If you didn't request a password reset, ignore this email.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1d2534;">
        <div style="background: #16294e; padding: 20px 24px;">
          <span style="color: #ffffff; font-size: 18px; font-weight: bold;">TYS Global Logistics</span>
        </div>
        <div style="padding: 24px; border: 1px solid #dde2ea; border-top: 0;">
          <p>A password reset was requested for this email address.</p>
          <p style="margin: 24px 0;">
            <a href="${url}" style="background: #f26a21; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Set new password</a>
          </p>
          <p>The link expires in 60 minutes. If you didn't request a password reset, ignore this email.</p>
          <p style="color: #6b7280; font-size: 12px; word-break: break-all;">Or copy this link: ${url}</p>
        </div>
      </div>`,
  }).catch(() => {
    // Swallowed — see the function comment. sendMail already logged it.
  });
}

/** C1: customer email verification — the link must be clicked before the portal shows quotes. */
export async function sendVerificationEmail(to: string, url: string) {
  await sendMail({
    to,
    subject: "Verify your email — TYS Global Logistics",
    text: `Welcome to TYS Global Logistics!\n\nVerify your email address by opening this link:\n\n${url}\n\nIf you didn't create an account, ignore this email.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1d2534;">
        <div style="background: #16294e; padding: 20px 24px;">
          <span style="color: #ffffff; font-size: 18px; font-weight: bold;">TYS Global Logistics</span>
        </div>
        <div style="padding: 24px; border: 1px solid #dde2ea; border-top: 0;">
          <p>Welcome! Confirm this email address to activate your account.</p>
          <p style="margin: 24px 0;">
            <a href="${url}" style="background: #f26a21; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify email</a>
          </p>
          <p>If you didn't create an account, ignore this email.</p>
          <p style="color: #6b7280; font-size: 12px; word-break: break-all;">Or copy this link: ${url}</p>
        </div>
      </div>`,
  });
}

// ── Quote confirmation email (port of emails/quote-confirmation.blade.php) ──
export type QuoteEmailBox = {
  quantity: string | number | null;
  weight: string | null;
  weightUnit: string;
  length: string | null;
  width: string | null;
  height: string | null;
  chargeableWeight: string | null;
};
export type QuoteEmailTv = {
  brandName: string | null;
  tvModel: string | null;
  quantity: string | number | null;
  weight: string | null;
  weightUnit: string;
  length: string | null;
  width: string | null;
  height: string | null;
};
export type QuoteEmailAuto = {
  brandName: string | null;
  carModel: string | null;
  carYear: string | null;
  quantity: string | number | null;
};
export type QuoteEmailData = {
  to: string;
  contactName: string;
  customerName: string;
  customerEmail: string;
  mobileNumber: string;
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  isResidence: boolean;
  packageTypeLabel: string;
  boxes: QuoteEmailBox[];
  televisions: QuoteEmailTv[];
  autos: QuoteEmailAuto[];
  totalChargeableWeight: string | null;
  weightUnit: string;
  estimatedCost: string | null;
  currency: string;
  trackingUrl: string;
};

const na = (v: unknown) => (v == null || v === "" ? "N/A" : esc(v));
const detail = (label: string, value: unknown) =>
  `<div class="detail-row"><span class="label">${label}:</span><span>${na(value)}</span></div>`;

function packageSections(d: QuoteEmailData): string {
  if (d.boxes.length === 0 && d.televisions.length === 0 && d.autos.length === 0) return "";
  const u = esc(d.weightUnit.toUpperCase());
  let html = '<div class="section"><div class="section-title">Package Information</div>';

  if (d.boxes.length) {
    html += '<div class="detail-row"><strong>BOX DETAILS</strong></div>';
    d.boxes.forEach((p, i) => {
      html +=
        `<div class="package-item"><strong>Box Package #${i + 1}</strong>` +
        detail("Quantity", p.quantity) +
        `<div class="detail-row"><span class="label">Weight:</span><span>${na(p.weight)} ${u}</span></div>` +
        `<div class="detail-row"><span class="label">Box Size:</span><span>${na(p.length)} x ${na(p.width)} x ${na(p.height)}</span></div>` +
        `<div class="detail-row"><span class="label">Chargeable:</span><span>${na(p.chargeableWeight)} ${u}</span></div>` +
        `</div>`;
    });
  }
  if (d.televisions.length) {
    html += '<div class="detail-row"><strong>TELEVISION DETAILS</strong></div>';
    d.televisions.forEach((p, i) => {
      html +=
        `<div class="package-item"><strong>Television Package #${i + 1}</strong>` +
        detail("Brand", p.brandName) +
        detail("Model", p.tvModel) +
        detail("Quantity", p.quantity) +
        `<div class="detail-row"><span class="label">Weight:</span><span>${na(p.weight)} ${u}</span></div>` +
        `<div class="detail-row"><span class="label">TV Size:</span><span>${na(p.length)} x ${na(p.width)} x ${na(p.height)}</span></div>` +
        `</div>`;
    });
  }
  if (d.autos.length) {
    html += '<div class="detail-row"><strong>AUTO DETAILS</strong></div>';
    d.autos.forEach((p, i) => {
      html +=
        `<div class="package-item"><strong>Auto Package #${i + 1}</strong>` +
        detail("Vehicle Type", p.brandName) +
        detail("Car Model", p.carModel) +
        detail("Car Year", p.carYear) +
        detail("Quantity", p.quantity ?? 1) +
        `</div>`;
    });
  }
  if (d.totalChargeableWeight) {
    html += `<div class="detail-row" style="margin-top: 15px;"><span class="label">Total Chargeable Weight:</span><span><strong>${esc(d.totalChargeableWeight)} ${u}</strong></span></div>`;
  }
  return html + "</div>";
}

export function renderQuoteConfirmation(d: QuoteEmailData): { subject: string; html: string; text: string } {
  const customerBlock =
    detail("Name", d.customerName || d.contactName) +
    detail("Email", d.customerEmail) +
    detail("Mobile Number", d.mobileNumber);
  const costBlock = d.estimatedCost
    ? `<div class="section"><div class="section-title">Estimated Cost</div><div class="detail-row"><span class="label">Amount:</span><span style="font-size:18px;font-weight:bold;color:#DC2626;">${esc(d.currency || "USD")} ${esc(d.estimatedCost)}</span></div></div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Shipping Quote Confirmation</title>
<style>body{font-family:'Arial',sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px}.header{background-color:#DC2626;color:#fff;padding:20px;text-align:center;border-radius:5px 5px 0 0}.content{background-color:#f9f9f9;padding:30px;border:1px solid #ddd;border-top:none}.section{margin-bottom:25px}.section-title{font-weight:bold;color:#DC2626;margin-bottom:10px;font-size:16px}.detail-row{margin-bottom:8px}.label{font-weight:bold;display:inline-block;width:150px}.package-item{background-color:#fff;padding:15px;margin-bottom:10px;border-left:3px solid #DC2626}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #ddd;color:#666;font-size:14px}</style>
</head><body>
<div class="header"><h1 style="margin:0;">Shipping Quote Confirmation</h1></div>
<div class="content">
<p>Dear ${esc(d.contactName)},</p>
<p>Thank you for requesting a shipping quote. We have received your request and our team will review it shortly.</p>
<div class="section"><div class="section-title">Customer Details</div>${customerBlock}</div>
<div class="section"><div class="section-title">Shipping Details</div>
${detail("From", `${d.fromCountry} (${d.fromZip})`)}
${detail("To", `${d.toCountry} (${d.toZip})`)}
${detail("Delivery Type", d.isResidence ? "Residential" : "Commercial")}
${detail("Selected Packages", d.packageTypeLabel || "N/A")}
</div>
${packageSections(d)}
${costBlock}
<div class="section"><div class="section-title">Contact Information</div>${customerBlock}</div>
<p>Our team will review your request and get back to you within 24 hours with a detailed quote.</p>
<p>If you have any questions, please don't hesitate to contact us.</p>
<p>Best regards,<br><strong>International Shipping &amp; Moving Company</strong></p>
</div>
<div class="footer"><p>This is an automated message. Please do not reply to this email.</p><p>&copy; ${new Date().getUTCFullYear()} International Shipping &amp; Moving Company. All rights reserved.</p></div>
<img src="${esc(d.trackingUrl)}" width="1" height="1" style="display:none" alt="" />
</body></html>`;

  const text =
    `Shipping Quote Confirmation\n\nDear ${d.contactName},\n\n` +
    `From: ${d.fromCountry} (${d.fromZip})\nTo: ${d.toCountry} (${d.toZip})\n` +
    `Packages: ${d.packageTypeLabel || "N/A"}\n` +
    (d.estimatedCost ? `Estimated Cost: ${d.currency || "USD"} ${d.estimatedCost}\n` : "") +
    `\nOur team will get back to you within 24 hours.`;

  return { subject: "Shipping Quote Confirmation", html, text };
}

/** Renders + sends the quote confirmation. Throws on SMTP failure (caller decides). */
export async function sendQuoteConfirmationEmail(d: QuoteEmailData) {
  const { subject, html, text } = renderQuoteConfirmation(d);
  return sendMail({ to: d.to, subject, text, html });
}

// ── Admin new-quote notification (net-new in B2; the old site had none) ──
export type AdminQuoteNotification = {
  quoteId: number;
  customerName: string;
  customerEmail: string;
  mobileNumber: string;
  fromCountry: string;
  fromZip: string;
  toCountry: string;
  toZip: string;
  isResidence: boolean;
  packageTypeLabel: string;
  estimatedCost: string | null;
  currency: string;
  adminUrl: string;
};

/**
 * Notify staff that a new quote arrived. Recipients come from
 * ADMIN_NOTIFICATION_EMAILS (comma-separated); with none configured this is a
 * no-op. Throws on SMTP failure — the store flow swallows it so a mail outage
 * never fails quote creation.
 */
export async function sendAdminQuoteNotification(d: AdminQuoteNotification) {
  const recipients = (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) return null;

  const cost = d.estimatedCost
    ? `${esc(d.currency || "USD")} ${esc(d.estimatedCost)}`
    : "Not auto-rated (staff to price)";
  const subject = `New quote request #${d.quoteId} — ${d.fromCountry} → ${d.toCountry}`;
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1d2534;">
      <div style="background: #16294e; padding: 20px 24px;">
        <span style="color:#fff;font-size:18px;font-weight:bold;">New Quote Request #${esc(d.quoteId)}</span>
      </div>
      <div style="padding: 24px; border: 1px solid #dde2ea; border-top: 0;">
        ${detail("Customer", d.customerName)}
        ${detail("Email", d.customerEmail)}
        ${detail("Mobile", d.mobileNumber)}
        ${detail("From", `${d.fromCountry} (${d.fromZip})`)}
        ${detail("To", `${d.toCountry} (${d.toZip})`)}
        ${detail("Delivery Type", d.isResidence ? "Residential" : "Commercial")}
        ${detail("Packages", d.packageTypeLabel || "N/A")}
        ${detail("Estimated Cost", cost)}
        <p style="margin-top:20px;">
          <a href="${esc(d.adminUrl)}" style="background:#f26a21;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">Open in admin</a>
        </p>
      </div>
    </div>`;
  const text =
    `New quote request #${d.quoteId}\n\n` +
    `Customer: ${d.customerName} <${d.customerEmail}> ${d.mobileNumber}\n` +
    `From: ${d.fromCountry} (${d.fromZip})\nTo: ${d.toCountry} (${d.toZip})\n` +
    `Delivery: ${d.isResidence ? "Residential" : "Commercial"}\n` +
    `Packages: ${d.packageTypeLabel || "N/A"}\n` +
    `Estimated Cost: ${d.estimatedCost ? `${d.currency || "USD"} ${d.estimatedCost}` : "Not auto-rated"}\n\n` +
    `Open in admin: ${d.adminUrl}`;

  return sendMail({ to: recipients.join(", "), subject, text, html });
}
