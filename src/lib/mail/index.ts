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

const FROM_NAME = process.env.MAIL_FROM_NAME ?? "TYS Global Logistics";
const FROM = `"${FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS ?? "noreply@tysgloballogistics.com"}>`;
// The person actually behind sales@ — shown as the display name and email
// sign-off so a sales-sent quote reads as a real person, not a company
// mailbox. Swap via env if the rep changes; no code edit needed.
export const SALES_REP_NAME = process.env.MAIL_SALES_REP_NAME ?? "Krutik";
// Anything that invites a reply (or is a human-facing quote/sales
// conversation) sends from this monitored address instead of no-reply —
// SMTP still authenticates as MAIL_FROM_ADDRESS (noreply), only the visible
// From header differs; the domain's SPF/DKIM/DMARC cover the whole domain,
// not one mailbox, so this works the same way the site already publishes
// sales@ as its support contact address.
export const SALES_FROM = `"${SALES_REP_NAME} — TYS Global Logistics" <${process.env.MAIL_SALES_ADDRESS ?? "sales@tysgloballogistics.com"}>`;

const SITE_URL = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(/\/+$/, "");
const LOGO_URL = `${SITE_URL}/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png`;

/**
 * Shared HTML shell for the quote-related emails — brand blue (#0364ff,
 * matches --pub-blue in globals.css), the real logo, rounded cards, matching
 * the actual site instead of a generic red template. Table-free but sticks
 * to widely-supported properties (solid backgrounds, border-radius, inline
 * `<style>` in `<head>`) — the same approach the previous template used, and
 * proven to render fine in the clients that matter here (Gmail, Apple Mail,
 * Outlook web); no attempt at bulletproof Outlook-desktop table markup.
 */
function emailShell(opts: { title: string; bodyHtml: string; footerNote: string; trackingUrl?: string }): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(opts.title)}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;color:#1d2534;background:#f5f9ff;margin:0;padding:24px 12px}
.wrap{max-width:600px;margin:0 auto}
.header{background-color:#0364ff;padding:28px 24px;text-align:center;border-radius:20px 20px 0 0}
.header img{height:34px}
.content{background-color:#ffffff;padding:32px;border:1px solid #e6f0ff;border-top:none}
.section{margin-bottom:24px}
.section-title{font-weight:700;color:#0364ff;margin-bottom:10px;font-size:13px;text-transform:uppercase;letter-spacing:.03em}
.detail-row{margin-bottom:8px;font-size:14px}
.label{font-weight:600;display:inline-block;width:150px;color:#5b6472}
.package-item{background-color:#f5f9ff;padding:16px;margin-bottom:10px;border-radius:12px;border-left:3px solid #0364ff}
.footer{background:#0364ff;color:#e6f0ff;text-align:center;padding:20px 24px;border-radius:0 0 20px 20px;font-size:13px}
.footer p{margin:4px 0}
</style>
</head><body>
<div class="wrap">
<div class="header"><img src="${esc(LOGO_URL)}" alt="TYS Global Logistics" /></div>
<div class="content">
${opts.bodyHtml}
</div>
<div class="footer"><p>${esc(opts.footerNote)}</p><p>&copy; ${new Date().getUTCFullYear()} TYS Global Logistics. All rights reserved.</p></div>
</div>
${opts.trackingUrl ? `<img src="${esc(opts.trackingUrl)}" width="1" height="1" style="display:none" alt="" />` : ""}
</body></html>`;
}

export async function sendMail(opts: { to: string; subject: string; text: string; html: string; from?: string }) {
  try {
    const { from, ...rest } = opts;
    const info = await getTransporter().sendMail({ from: from ?? FROM, ...rest });
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

type PackageSectionsData = Pick<
  QuoteEmailData,
  "boxes" | "televisions" | "autos" | "totalChargeableWeight" | "weightUnit"
>;

function packageSections(d: PackageSectionsData): string {
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

// Same support channels published site-wide (site-header.tsx, quote-request-form.tsx).
const SUPPORT_PHONE_DISPLAY = "+1 (404) 793-8759";
const SUPPORT_EMAIL = "sales@tysgloballogistics.com";
const contactLine =
  `<p>Need help or have a question? Call us at <strong>${esc(SUPPORT_PHONE_DISPLAY)}</strong> ` +
  `or email <a href="mailto:${esc(SUPPORT_EMAIL)}" style="color:#0364ff;">${esc(SUPPORT_EMAIL)}</a>.</p>`;
const contactLineText = `Need help? Call ${SUPPORT_PHONE_DISPLAY} or email ${SUPPORT_EMAIL}.`;

export function renderQuoteConfirmation(
  d: QuoteEmailData,
  opts: { fromSales?: boolean } = {},
): { subject: string; html: string; text: string } {
  const footerNote = opts.fromSales
    ? "Have a question about this quote? Just reply to this email, or call us."
    : "This is an automated message. Please do not reply to this email.";
  const signOff = opts.fromSales
    ? `<p>Best regards,<br><strong>${esc(SALES_REP_NAME)}</strong><br>TYS Global Logistics</p>`
    : `<p>Best regards,<br><strong>TYS Global Logistics</strong></p>`;
  const customerBlock =
    detail("Name", d.customerName || d.contactName) +
    detail("Email", d.customerEmail) +
    detail("Mobile Number", d.mobileNumber);
  // Price only appears once a human (sales) is sending it — the automatic
  // no-reply acknowledgment never reveals a price, even if the shipment was
  // auto-rated (US-domestic quotes get a real estimatedCost immediately;
  // showing it here would make the "sales will follow up" line below
  // pointless and skip the human part of the conversation entirely).
  const costBlock =
    d.estimatedCost && opts.fromSales
      ? `<div class="section"><div class="section-title">Estimated Cost</div><div class="detail-row"><span class="label">Amount:</span><span style="font-size:18px;font-weight:bold;color:#0364ff;">${esc(d.currency || "USD")} ${esc(d.estimatedCost)}</span></div></div>`
      : "";

  // The automatic no-reply send is deliberately bare — one line confirming
  // receipt, no shipping/contact/package recap, no price. The full detailed
  // quote — shipping breakdown, price — only goes out once Krutik sends it
  // by hand. The phone/email contact line stays even here though: a
  // customer with an urgent question shouldn't have to wait on Krutik's
  // follow-up just to find a way to reach us.
  const bodyHtml = opts.fromSales
    ? `
<p>Dear ${esc(d.contactName)},</p>
<p>Here's your shipping quote — take a look and let us know if you have any questions.</p>
<div class="section"><div class="section-title">Contact Information</div>${customerBlock}</div>
<div class="section"><div class="section-title">Shipping Details</div>
${detail("From", `${d.fromCountry} (${d.fromZip})`)}
${detail("To", `${d.toCountry} (${d.toZip})`)}
${detail("Delivery Type", d.isResidence ? "Residential" : "Commercial")}
${detail("Selected Packages", d.packageTypeLabel || "N/A")}
</div>
${packageSections(d)}
${costBlock}
${contactLine}
${signOff}`
    : `
<p>Dear ${esc(d.contactName)},</p>
<p>Thank you for requesting a shipping quote. Our team will connect with you shortly.</p>
${contactLine}
${signOff}`;

  const html = emailShell({
    title: "Shipping Quote Confirmation",
    bodyHtml,
    footerNote,
    trackingUrl: d.trackingUrl,
  });

  const textSignOff = opts.fromSales ? `Best regards,\n${SALES_REP_NAME}\nTYS Global Logistics` : "TYS Global Logistics";
  const text = opts.fromSales
    ? `Shipping Quote Confirmation\n\nDear ${d.contactName},\n\n` +
      `From: ${d.fromCountry} (${d.fromZip})\nTo: ${d.toCountry} (${d.toZip})\n` +
      `Packages: ${d.packageTypeLabel || "N/A"}\n` +
      (d.estimatedCost ? `Estimated Cost: ${d.currency || "USD"} ${d.estimatedCost}\n` : "") +
      `\n${contactLineText}\n\n${textSignOff}\n\n${footerNote}`
    : `Shipping Quote Confirmation\n\nDear ${d.contactName},\n\n` +
      `Thank you for requesting a shipping quote. Our team will connect with you shortly.\n\n` +
      `${contactLineText}\n\n${textSignOff}\n\n${footerNote}`;

  return { subject: "Shipping Quote Confirmation", html, text };
}

/**
 * Renders + sends the quote confirmation. Throws on SMTP failure (caller decides).
 *
 * `fromSales`: the automatic confirmation fired the moment a customer submits
 * the public quote form stays no-reply (nothing to reply to yet — it's just
 * an acknowledgment). When admin staff manually re-sends a priced quote
 * (POST /api/admin/quotes/[id]/send), it's a real conversation the customer
 * may reply to, so that call passes fromSales: true.
 */
export async function sendQuoteConfirmationEmail(d: QuoteEmailData, opts: { fromSales?: boolean } = {}) {
  const { subject, html, text } = renderQuoteConfirmation(d, opts);
  return sendMail({ to: d.to, subject, text, html, from: opts.fromSales ? SALES_FROM : undefined });
}

// ── Multi-option quote email — support picks a few FedEx services (rather
// than locking one), the customer replies with which they want, and support
// locks that one afterward through the normal price-lock + send flow. Same
// shipping-details layout as the single-price confirmation; a comparison
// table replaces the single "Estimated Cost" line, and nothing is locked on
// the quote itself yet. ──
export type QuoteEmailOption = { serviceName: string; amount: string; currency: string };

export type QuoteOptionsEmailData = Omit<QuoteEmailData, "estimatedCost" | "currency"> & {
  options: QuoteEmailOption[];
};

function optionsBlock(options: QuoteEmailOption[]): string {
  const rows = options
    .map(
      (o) =>
        `<tr><td style="padding:10px 12px;border-bottom:1px solid #e6f0ff;">${esc(o.serviceName)}</td>` +
        `<td style="padding:10px 12px;border-bottom:1px solid #e6f0ff;text-align:right;font-weight:bold;color:#0364ff;">${esc(o.currency)} ${esc(o.amount)}</td></tr>`,
    )
    .join("");
  return (
    `<div class="section"><div class="section-title">Choose a Shipping Option</div>` +
    `<table style="width:100%;border-collapse:collapse;background:#fff;">${rows}</table>` +
    `<p style="margin-top:15px;">Reply to this email or call us to let us know which option you&rsquo;d like — we&rsquo;ll confirm your booking right away.</p></div>`
  );
}

export function renderQuoteOptions(d: QuoteOptionsEmailData): { subject: string; html: string; text: string } {
  const customerBlock =
    detail("Name", d.customerName || d.contactName) +
    detail("Email", d.customerEmail) +
    detail("Mobile Number", d.mobileNumber);

  const bodyHtml = `
<p>Dear ${esc(d.contactName)},</p>
<p>Here are a few shipping options for your shipment — take a look and let us know which one works best for you.</p>
<div class="section"><div class="section-title">Contact Information</div>${customerBlock}</div>
<div class="section"><div class="section-title">Shipping Details</div>
${detail("From", `${d.fromCountry} (${d.fromZip})`)}
${detail("To", `${d.toCountry} (${d.toZip})`)}
${detail("Delivery Type", d.isResidence ? "Residential" : "Commercial")}
${detail("Selected Packages", d.packageTypeLabel || "N/A")}
</div>
${packageSections(d)}
${optionsBlock(d.options)}
${contactLine}
<p>Best regards,<br><strong>${esc(SALES_REP_NAME)}</strong><br>TYS Global Logistics</p>`;

  const html = emailShell({
    title: "Shipping Quote Options",
    bodyHtml,
    footerNote: "Have a question about these options? Just reply to this email, or call us.",
    trackingUrl: d.trackingUrl,
  });

  const text =
    `Your Shipping Options\n\nDear ${d.contactName},\n\n` +
    `From: ${d.fromCountry} (${d.fromZip})\nTo: ${d.toCountry} (${d.toZip})\n` +
    `Packages: ${d.packageTypeLabel || "N/A"}\n\n` +
    `Options:\n` +
    d.options.map((o) => `- ${o.serviceName}: ${o.currency} ${o.amount}`).join("\n") +
    `\n\nReply or call us to let us know which one you'd like.\n\n${contactLineText}\n\nBest regards,\n${SALES_REP_NAME}\nTYS Global Logistics`;

  return { subject: "Your Shipping Options — TYS Global Logistics", html, text };
}

/**
 * Renders + sends the multi-option email. Throws on SMTP failure (caller
 * decides). Always sales@ — the body explicitly invites a reply ("let us
 * know which one you'd like"), so it can't come from no-reply.
 */
export async function sendQuoteOptionsEmail(d: QuoteOptionsEmailData) {
  const { subject, html, text } = renderQuoteOptions(d);
  return sendMail({ to: d.to, subject, text, html, from: SALES_FROM });
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
  /** e.g. "Morning (8am – 12pm) (America/New_York)" — the single-page quote form's callback window. */
  callbackWindow?: string;
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
        ${d.callbackWindow ? detail("Call back", d.callbackWindow) : ""}
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
    `Estimated Cost: ${d.estimatedCost ? `${d.currency || "USD"} ${d.estimatedCost}` : "Not auto-rated"}\n` +
    (d.callbackWindow ? `Call back: ${d.callbackWindow}\n` : "") +
    `\nOpen in admin: ${d.adminUrl}`;

  return sendMail({ to: recipients.join(", "), subject, text, html, from: SALES_FROM });
}

// ── Admin new-callback-request notification (the /quick-quote lead form) ──
export type AdminCallbackNotification = {
  requestId: number;
  name: string;
  email: string;
  mobileNumber: string;
  timeSlotLabel: string;
  timezone: string;
  packageTypeLabel: string;
};

/**
 * Notify staff that a customer wants a callback instead of filling out the
 * full quote wizard. Same recipients/no-op/throw posture as
 * sendAdminQuoteNotification — no route/pricing info to show since none was
 * collected; that's the whole point of this lighter-weight lead type.
 */
export async function sendAdminCallbackNotification(d: AdminCallbackNotification) {
  const recipients = (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) return null;

  const subject = `New callback request #${d.requestId} — ${d.name}`;
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1d2534;">
      <div style="background: #16294e; padding: 20px 24px;">
        <span style="color:#fff;font-size:18px;font-weight:bold;">New Callback Request #${esc(d.requestId)}</span>
      </div>
      <div style="padding: 24px; border: 1px solid #dde2ea; border-top: 0;">
        ${detail("Name", d.name)}
        ${detail("Email", d.email)}
        ${detail("Mobile", d.mobileNumber)}
        ${detail("Best time to call", `${d.timeSlotLabel} (${d.timezone})`)}
        ${detail("Packages", d.packageTypeLabel || "N/A")}
        <p style="margin-top:20px;color:#5b6472;">No route or pricing details yet — call the customer to get those.</p>
      </div>
    </div>`;
  const text =
    `New callback request #${d.requestId}\n\n` +
    `Name: ${d.name} <${d.email}> ${d.mobileNumber}\n` +
    `Best time to call: ${d.timeSlotLabel} (${d.timezone})\n` +
    `Packages: ${d.packageTypeLabel || "N/A"}\n`;

  return sendMail({ to: recipients.join(", "), subject, text, html, from: SALES_FROM });
}
