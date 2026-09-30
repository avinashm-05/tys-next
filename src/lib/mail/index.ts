import nodemailer, { type Transporter } from "nodemailer";
import { countryName } from "@/lib/countries";

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
let salesTransporter: Transporter | null = null;

// sales@ is a genuinely separate mailbox on Hostinger, not an alias — an SMTP
// session authenticated as noreply@ gets a hard 553 "Sender address rejected:
// not owned by user" if it tries to claim a From of sales@ (confirmed live,
// 2026-08-06; the earlier assumption below this function used to be that
// domain-wide SPF/DKIM covered it, which is wrong for Hostinger's own relay).
// Every send that uses SALES_FROM must authenticate with sales@'s own
// credentials — this second transporter does that; falls back to the default
// (noreply@) transporter if SALES_SMTP_PASSWORD isn't configured, so a missing
// credential degrades to "wrong From header, message still sends" rather than
// silently swallowing sales-attributed mail again.
function getTransporter(useSales = false): Transporter {
  if (useSales) {
    if (salesTransporter) return salesTransporter;
    if (process.env.NODE_ENV === "production" && process.env.SALES_SMTP_PASSWORD) {
      salesTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: {
          user: process.env.SALES_SMTP_USERNAME ?? process.env.MAIL_SALES_ADDRESS ?? "sales@tysgloballogistics.com",
          pass: process.env.SALES_SMTP_PASSWORD,
        },
      });
      return salesTransporter;
    }
    return getTransporter(false);
  }
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
// conversation) sends from this monitored address instead of no-reply.
// Requires authenticating as sales@ itself (see getTransporter's useSales
// param) — every call site using this as `from` must also pass
// `useSalesAuth: true` to sendMail, or Hostinger's relay rejects it outright.
export const SALES_FROM = `"${SALES_REP_NAME} at TYS Global Logistics" <${process.env.MAIL_SALES_ADDRESS ?? "sales@tysgloballogistics.com"}>`;


const SITE_URL = (process.env.APP_URL ?? "https://www.tysgloballogistics.com").replace(/\/+$/, "");
const LOGO_URL = `${SITE_URL}/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png`;

// Same support channels published site-wide (site-header.tsx, thank-you/page.tsx).
const SUPPORT_PHONE_DISPLAY = "+1 (404) 793-8759";
const SUPPORT_PHONE_TEL = "+14047938759";
const SUPPORT_EMAIL = "sales@tysgloballogistics.com";
const WHATSAPP_DISPLAY = "+1 (404) 435-4574";
const WHATSAPP_URL = "https://wa.me/14044354574";

// ── Email design system (2026-09-30 "better UI" pass) ──
// Every email, customer or internal, now goes through one shell. Styles are
// INLINE and the layout is tables: Gmail's app (for non-Google accounts) and
// Outlook drop <head> styles and flex/grid, so class-based CSS silently fell
// apart there. Colors match the site (--pub-blue #0364ff, navy ink).
const C = {
  blue: "#0364ff",
  navy: "#0b1b3f",
  ink: "#1d2534",
  muted: "#5b6472",
  line: "#e3ecfb",
  tint: "#f3f7ff",
  bg: "#eaf1fc",
  white: "#ffffff",
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

type Tone = "blue" | "green" | "amber" | "red" | "grey";
const TONES: Record<Tone, { bg: string; fg: string }> = {
  blue: { bg: "#e6efff", fg: "#0348c2" },
  green: { bg: "#e3f6ec", fg: "#11763f" },
  amber: { bg: "#fff3dc", fg: "#9a5b00" },
  red: { bg: "#fde8e8", fg: "#b42318" },
  grey: { bg: "#eef1f5", fg: "#4a5361" },
};

/** Small rounded status/label chip. */
function chip(text: string, tone: Tone = "blue"): string {
  const t = TONES[tone];
  return `<span style="display:inline-block;background:${t.bg};color:${t.fg};font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:5px 11px;border-radius:999px;">${esc(text)}</span>`;
}

function p(html: string, extra = ""): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${C.ink};${extra}">${html}</p>`;
}

/** Pill button, plus the raw link underneath for clients that block buttons. */
function ctaButton(href: string, label: string, opts: { showLink?: boolean } = {}): string {
  const button = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;"><tr><td style="border-radius:999px;background:${C.blue};"><a href="${esc(href)}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:15px;font-weight:700;color:${C.white};text-decoration:none;border-radius:999px;">${esc(label)} &rarr;</a></td></tr></table>`;
  const link = opts.showLink
    ? `<p style="margin:0 0 16px;font-size:12px;line-height:1.5;color:${C.muted};word-break:break-all;">Button not working? Paste this link into your browser:<br><a href="${esc(href)}" style="color:${C.blue};">${esc(href)}</a></p>`
    : "";
  return button + link;
}

/** A titled block of label/value rows. */
function section(title: string, rows: Array<[string, unknown]>, opts: { note?: string } = {}): string {
  const body = rows
    .map(
      ([label, value], i) =>
        `<tr><td style="padding:10px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-size:13px;color:${C.muted};width:42%;vertical-align:top;">${esc(label)}</td>` +
        `<td style="padding:10px 0;${i ? `border-top:1px solid ${C.line};` : ""}font-size:14px;color:${C.ink};font-weight:600;vertical-align:top;">${na(value)}</td></tr>`,
    )
    .join("");
  return (
    `<div style="margin:0 0 20px;">` +
    `<div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.blue};margin:0 0 6px;">${esc(title)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${body}</table>` +
    (opts.note ? `<div style="font-size:13px;color:${C.muted};margin-top:8px;">${opts.note}</div>` : "") +
    `</div>`
  );
}

/** Tinted card for a highlight (price, route, tracking number). */
function callout(inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr><td style="background:${C.tint};border:1px solid ${C.line};border-radius:14px;padding:18px 20px;">${inner}</td></tr></table>`;
}

/** From → To strip used by the quote and shipment emails. */
function routeCallout(from: string, to: string, caption?: string): string {
  return callout(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
      `<td style="vertical-align:top;width:44%;"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};">From</div><div style="font-size:16px;font-weight:700;color:${C.navy};margin-top:2px;">${esc(from)}</div></td>` +
      `<td style="vertical-align:middle;text-align:center;width:12%;font-size:20px;color:${C.blue};">&#9992;</td>` +
      `<td style="vertical-align:top;width:44%;text-align:right;"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};">To</div><div style="font-size:16px;font-weight:700;color:${C.navy};margin-top:2px;">${esc(to)}</div></td>` +
      `</tr></table>` +
      (caption ? `<div style="font-size:13px;color:${C.muted};margin-top:10px;">${caption}</div>` : ""),
  );
}

function contactStrip(): string {
  const cell = (label: string, value: string, href: string) =>
    `<td style="padding:4px 8px;vertical-align:top;"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};">${label}</div><a href="${esc(href)}" style="font-size:14px;font-weight:600;color:${C.navy};text-decoration:none;">${esc(value)}</a></td>`;
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;border-top:1px solid ${C.line};"><tr><td style="padding-top:18px;">` +
    `<div style="font-size:14px;font-weight:700;color:${C.navy};margin:0 0 8px 8px;">Questions? A real person picks up.</div>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
    cell("Call", SUPPORT_PHONE_DISPLAY, `tel:${SUPPORT_PHONE_TEL}`) +
    cell("WhatsApp", WHATSAPP_DISPLAY, WHATSAPP_URL) +
    cell("Email", SUPPORT_EMAIL, `mailto:${SUPPORT_EMAIL}`) +
    `</tr></table></td></tr></table>`
  );
}
const contactLineText = `Questions? Call ${SUPPORT_PHONE_DISPLAY}, WhatsApp ${WHATSAPP_DISPLAY}, or email ${SUPPORT_EMAIL}.`;

function signOff(fromSales: boolean): string {
  return fromSales
    ? p(`Best regards,<br><strong>${esc(SALES_REP_NAME)}</strong><br><span style="color:${C.muted};">TYS Global Logistics</span>`, "margin-top:8px;")
    : p(`Best regards,<br><strong>The TYS Global Logistics team</strong>`, "margin-top:8px;");
}

/**
 * The one HTML shell for every email. Blue header with the real logo, a
 * white card with an optional eyebrow chip + headline, the body, an optional
 * contact strip, and a quiet footer. `preheader` is the grey preview line
 * inbox lists show next to the subject.
 */
function emailShell(opts: {
  title: string;
  preheader?: string;
  eyebrow?: string;
  eyebrowTone?: Tone;
  heading?: string;
  bodyHtml: string;
  footerNote: string;
  showContact?: boolean;
  trackingUrl?: string;
}): string {
  const head =
    (opts.eyebrow ? `<div style="margin:0 0 14px;">${chip(opts.eyebrow, opts.eyebrowTone)}</div>` : "") +
    (opts.heading
      ? `<h1 style="margin:0 0 18px;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:800;letter-spacing:-.02em;color:${C.navy};">${esc(opts.heading)}</h1>`
      : "");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT};-webkit-text-size-adjust:100%;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(opts.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td style="background:${C.blue};border-radius:20px 20px 0 0;padding:26px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:middle;"><img src="${esc(LOGO_URL)}" alt="TYS Global Logistics" height="32" style="display:block;height:32px;border:0;" /></td>
<td style="vertical-align:middle;text-align:right;font-size:12px;font-weight:600;color:#cfe0ff;letter-spacing:.04em;">SHIPPING FROM THE US<br>TO THE WORLD</td>
</tr></table>
</td></tr>
<tr><td style="background:${C.white};padding:34px 32px 28px;border-left:1px solid ${C.line};border-right:1px solid ${C.line};font-family:${FONT};">
${head}${opts.bodyHtml}${opts.showContact === false ? "" : contactStrip()}
</td></tr>
<tr><td style="background:${C.navy};border-radius:0 0 20px 20px;padding:22px 32px;font-family:${FONT};">
<div style="font-size:13px;line-height:1.55;color:#c7d3ea;">${esc(opts.footerNote)}</div>
<div style="font-size:12px;line-height:1.55;color:#8595b3;margin-top:8px;">&copy; ${new Date().getUTCFullYear()} TYS Global Logistics &middot; <a href="${esc(SITE_URL)}" style="color:#8595b3;">tysgloballogistics.com</a></div>
</td></tr>
</table>
</td></tr></table>
${opts.trackingUrl ? `<img src="${esc(opts.trackingUrl)}" width="1" height="1" style="display:none" alt="" />` : ""}
</body></html>`;
}

const na = (v: unknown) => (v == null || v === "" ? "N/A" : esc(v));

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
  /** True for anything sent with `from: SALES_FROM` — authenticates as
   *  sales@ itself instead of noreply@ (see getTransporter). */
  useSalesAuth?: boolean;
}) {
  try {
    const { from, useSalesAuth, ...rest } = opts;
    const info = await getTransporter(useSalesAuth).sendMail({ from: from ?? FROM, ...rest });
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

// ── Account emails ──

export function renderPasswordReset(url: string) {
  const html = emailShell({
    title: "Reset your password",
    preheader: "Use this link within 60 minutes to set a new password.",
    eyebrow: "Account security",
    heading: "Reset your password",
    bodyHtml:
      p("We got a request to reset the password for this email address. Tap the button below to choose a new one.") +
      ctaButton(url, "Set a new password", { showLink: true }) +
      p(`The link expires in <strong>60 minutes</strong>. If you didn't ask for this, you can ignore this email and your password stays the same.`, `font-size:14px;color:${C.muted};`),
    footerNote: "You're receiving this because a password reset was requested on tysgloballogistics.com.",
    showContact: false,
  });
  const text = `Reset your password\n\nOpen this link to set a new password:\n${url}\n\nThe link expires in 60 minutes. If you didn't request this, ignore this email.`;
  return { subject: "Reset your TYS Global Logistics password", html, text };
}

/**
 * The reset link expires in 60 minutes (resetPasswordTokenExpiresIn, auth.ts).
 *
 * Send failures are swallowed ON PURPOSE (anti-enumeration): the
 * request-password-reset endpoint then always succeeds and the UI always
 * shows the neutral "check your email" screen, so account existence can't be
 * inferred from a mail outage. The failure lives in the server log (sendMail
 * above) and live SMTP is proven by scripts/test-email.ts.
 */
export async function sendPasswordResetEmail(to: string, url: string) {
  const { subject, html, text } = renderPasswordReset(url);
  await sendMail({ to, subject, text, html }).catch(() => {
    // Swallowed, see the function comment. sendMail already logged it.
  });
}

export function renderVerification(url: string) {
  const html = emailShell({
    title: "Verify your email",
    preheader: "One tap to confirm your email and open your TYS account.",
    eyebrow: "Welcome",
    heading: "Confirm your email address",
    bodyHtml:
      p("Thanks for creating a TYS Global Logistics account. Confirm this email address and you're all set to see your quotes and shipments in one place.") +
      ctaButton(url, "Verify my email", { showLink: true }) +
      p("If you didn't create an account, you can ignore this email.", `font-size:14px;color:${C.muted};`),
    footerNote: "You're receiving this because an account was created on tysgloballogistics.com with this email.",
    showContact: false,
  });
  const text = `Welcome to TYS Global Logistics!\n\nVerify your email address by opening this link:\n${url}\n\nIf you didn't create an account, ignore this email.`;
  return { subject: "Verify your email for TYS Global Logistics", html, text };
}

/** C1: customer email verification. The link must be clicked before the portal shows quotes. */
export async function sendVerificationEmail(to: string, url: string) {
  const { subject, html, text } = renderVerification(url);
  await sendMail({ to, subject, text, html });
}

// ── Quote emails ──
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

type PackageSectionsData = Pick<
  QuoteEmailData,
  "boxes" | "televisions" | "autos" | "totalChargeableWeight" | "weightUnit"
>;

function packageSections(d: PackageSectionsData): string {
  if (d.boxes.length === 0 && d.televisions.length === 0 && d.autos.length === 0) return "";
  const u = d.weightUnit.toUpperCase();
  const dims = (l: unknown, w: unknown, h: unknown) =>
    l == null && w == null && h == null ? null : `${l ?? "?"} x ${w ?? "?"} x ${h ?? "?"}`;
  const withUnit = (v: string | null) => (v == null ? null : `${v} ${u}`);
  const rows: Array<[string, unknown]> = [];
  d.boxes.forEach((b, i) => {
    rows.push([`Box ${i + 1}`, [`Qty ${b.quantity ?? 1}`, withUnit(b.weight), dims(b.length, b.width, b.height)].filter(Boolean).join(" · ")]);
  });
  d.televisions.forEach((t, i) => {
    rows.push([
      `TV ${i + 1}`,
      [[t.brandName, t.tvModel].filter(Boolean).join(" "), `Qty ${t.quantity ?? 1}`, withUnit(t.weight), dims(t.length, t.width, t.height)].filter(Boolean).join(" · "),
    ]);
  });
  d.autos.forEach((a, i) => {
    rows.push([`Vehicle ${i + 1}`, [a.brandName, a.carModel, a.carYear, `Qty ${a.quantity ?? 1}`].filter(Boolean).join(" · ")]);
  });
  if (d.totalChargeableWeight) rows.push(["Chargeable weight", `${d.totalChargeableWeight} ${u}`]);
  return section("Your packages", rows);
}

function priceCallout(label: string, amount: string, currency: string, caption: string): string {
  return callout(
    `<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.muted};">${esc(label)}</div>` +
      `<div style="font-size:32px;font-weight:800;letter-spacing:-.02em;color:${C.blue};margin:4px 0 6px;">${esc(currency || "USD")} ${esc(amount)}</div>` +
      `<div style="font-size:13px;color:${C.muted};">${caption}</div>`,
  );
}

export function renderQuoteConfirmation(
  d: QuoteEmailData,
  opts: { fromSales?: boolean } = {},
): { subject: string; html: string; text: string } {
  const route = routeCallout(`${countryName(d.fromCountry)} ${d.fromZip}`.trim(), `${countryName(d.toCountry)} ${d.toZip}`.trim());

  // Price only appears once a human (sales) is sending it. The automatic
  // no-reply acknowledgment never reveals a price, even if the shipment was
  // auto-rated: the full quote only goes out once Krutik sends it by hand.
  if (!opts.fromSales) {
    const html = emailShell({
      title: "We got your quote request",
      preheader: `Your ${countryName(d.fromCountry)} to ${countryName(d.toCountry)} request is in. We'll be in touch shortly.`,
      eyebrow: "Request received",
      heading: "Thanks, we've got your request",
      bodyHtml:
        p(`Hi ${esc(d.contactName)},`) +
        p("Thanks for asking us for a shipping quote. A member of our team is checking the best carrier and price for you now, and will get back to you shortly.") +
        route +
        signOff(false),
      footerNote: "This is an automated message. For anything urgent, call or WhatsApp us.",
      trackingUrl: d.trackingUrl,
    });
    const text =
      `Hi ${d.contactName},\n\nThanks for requesting a shipping quote (${countryName(d.fromCountry)} to ${countryName(d.toCountry)}). ` +
      `Our team will get back to you shortly.\n\n${contactLineText}\n\nTYS Global Logistics`;
    return { subject: "We got your shipping quote request", html, text };
  }

  const html = emailShell({
    title: "Your shipping quote",
    preheader: d.estimatedCost
      ? `${d.currency || "USD"} ${d.estimatedCost} to ship from ${countryName(d.fromCountry)} to ${countryName(d.toCountry)}.`
      : `Your quote to ship from ${countryName(d.fromCountry)} to ${countryName(d.toCountry)}.`,
    eyebrow: "Your quote",
    heading: `Your quote to ship to ${countryName(d.toCountry)}`,
    bodyHtml:
      p(`Hi ${esc(d.contactName)},`) +
      p("Here's your shipping quote. Have a look, and reply to this email when you're ready to book or if anything needs changing.") +
      (d.estimatedCost
        ? priceCallout("Estimated total", d.estimatedCost, d.currency, "Based on the packages and route below.")
        : "") +
      route +
      section("Shipment details", [
        ["Delivery type", d.isResidence ? "Residential" : "Commercial"],
        ["Shipping", d.packageTypeLabel || "N/A"],
        ["Name", d.customerName || d.contactName],
        ["Email", d.customerEmail],
        ["Phone", d.mobileNumber],
      ]) +
      packageSections(d) +
      signOff(true),
    footerNote: "Have a question about this quote? Just reply to this email and it comes straight to us.",
    trackingUrl: d.trackingUrl,
  });

  const text =
    `Your shipping quote\n\nHi ${d.contactName},\n\n` +
    `From: ${countryName(d.fromCountry)} (${d.fromZip})\nTo: ${countryName(d.toCountry)} (${d.toZip})\n` +
    `Shipping: ${d.packageTypeLabel || "N/A"}\n` +
    (d.estimatedCost ? `Estimated total: ${d.currency || "USD"} ${d.estimatedCost}\n` : "") +
    `\nReply to this email when you're ready to book.\n\n${contactLineText}\n\nBest regards,\n${SALES_REP_NAME}\nTYS Global Logistics`;

  return { subject: `Your shipping quote: ${countryName(d.fromCountry)} to ${countryName(d.toCountry)}`, html, text };
}

/**
 * Renders + sends the quote confirmation. Throws on SMTP failure (caller decides).
 *
 * `fromSales`: the automatic confirmation fired the moment a customer submits
 * the public quote form stays no-reply. When admin staff send a priced quote
 * (POST /api/admin/quotes/[id]/send), it's a real conversation the customer
 * may reply to, so that call passes fromSales: true.
 */
export async function sendQuoteConfirmationEmail(d: QuoteEmailData, opts: { fromSales?: boolean } = {}) {
  const { subject, html, text } = renderQuoteConfirmation(d, opts);
  await sendMail({
    to: d.to,
    subject,
    text,
    html,
    from: opts.fromSales ? SALES_FROM : undefined,
    useSalesAuth: opts.fromSales,
  });
  return { subject };
}

// ── Multi-option quote email. Support picks a few FedEx services, the
// customer replies with which they want, and support locks that one
// afterward through the normal price-lock + send flow. ──
export type QuoteEmailOption = { serviceName: string; amount: string; currency: string };

export type QuoteOptionsEmailData = Omit<QuoteEmailData, "estimatedCost" | "currency"> & {
  options: QuoteEmailOption[];
};

function optionsBlock(options: QuoteEmailOption[]): string {
  const rows = options
    .map(
      (o, i) =>
        `<tr><td style="padding:14px 16px;${i ? `border-top:1px solid ${C.line};` : ""}font-size:14px;color:${C.ink};">` +
        `<span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:999px;background:${C.blue};color:${C.white};font-size:12px;font-weight:700;margin-right:10px;">${i + 1}</span>${esc(o.serviceName)}</td>` +
        `<td style="padding:14px 16px;${i ? `border-top:1px solid ${C.line};` : ""}text-align:right;font-size:16px;font-weight:800;color:${C.blue};white-space:nowrap;">${esc(o.currency)} ${esc(o.amount)}</td></tr>`,
    )
    .join("");
  return (
    `<div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.blue};margin:0 0 8px;">Pick an option</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.line};border-radius:14px;border-collapse:separate;margin:0 0 12px;background:${C.white};">${rows}</table>` +
    p(`Reply with the option number you'd like, and we'll confirm your booking.`, `font-size:14px;color:${C.muted};margin-bottom:22px;`)
  );
}

export function renderQuoteOptions(d: QuoteOptionsEmailData): { subject: string; html: string; text: string } {
  const html = emailShell({
    title: "Your shipping options",
    preheader: `${d.options.length} ways to ship from ${countryName(d.fromCountry)} to ${countryName(d.toCountry)}. Reply with your pick.`,
    eyebrow: "Your options",
    heading: `${d.options.length === 1 ? "Your option" : `${d.options.length} ways`} to ship to ${countryName(d.toCountry)}`,
    bodyHtml:
      p(`Hi ${esc(d.contactName)},`) +
      p("Here are the best options we found for your shipment. Faster services cost a little more.") +
      optionsBlock(d.options) +
      routeCallout(`${countryName(d.fromCountry)} ${d.fromZip}`.trim(), `${countryName(d.toCountry)} ${d.toZip}`.trim()) +
      section("Shipment details", [
        ["Delivery type", d.isResidence ? "Residential" : "Commercial"],
        ["Shipping", d.packageTypeLabel || "N/A"],
        ["Name", d.customerName || d.contactName],
        ["Phone", d.mobileNumber],
      ]) +
      packageSections(d) +
      signOff(true),
    footerNote: "Have a question about these options? Just reply to this email and it comes straight to us.",
    trackingUrl: d.trackingUrl,
  });

  const text =
    `Your shipping options\n\nHi ${d.contactName},\n\n` +
    `From: ${countryName(d.fromCountry)} (${d.fromZip})\nTo: ${countryName(d.toCountry)} (${d.toZip})\n\n` +
    d.options.map((o, i) => `${i + 1}. ${o.serviceName}: ${o.currency} ${o.amount}`).join("\n") +
    `\n\nReply with the option number you'd like.\n\n${contactLineText}\n\nBest regards,\n${SALES_REP_NAME}\nTYS Global Logistics`;

  return { subject: `Your shipping options: ${countryName(d.fromCountry)} to ${countryName(d.toCountry)}`, html, text };
}

/**
 * Renders + sends the multi-option email. Throws on SMTP failure. Always
 * sales@: the body invites a reply, so it can't come from no-reply.
 */
export async function sendQuoteOptionsEmail(d: QuoteOptionsEmailData) {
  const { subject, html, text } = renderQuoteOptions(d);
  await sendMail({ to: d.to, subject, text, html, from: SALES_FROM, useSalesAuth: true });
  return { subject };
}

// ── Follow-up on a sent quote (2026-09-30). Manual: staff press "Send
// follow-up" on a quote that's been quoted but not accepted yet. ──
export type QuoteFollowUpData = {
  to: string;
  contactName: string;
  fromCountry: string;
  toCountry: string;
  estimatedCost: string | null;
  currency: string;
  quotedAt: Date | null;
  trackingUrl: string;
};

export function renderQuoteFollowUp(d: QuoteFollowUpData) {
  const when = d.quotedAt
    ? d.quotedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" })
    : null;
  const html = emailShell({
    title: "Checking in on your quote",
    preheader: `Still planning to ship to ${countryName(d.toCountry)}? We're here when you're ready.`,
    eyebrow: "Quick check-in",
    heading: `Still shipping to ${countryName(d.toCountry)}?`,
    bodyHtml:
      p(`Hi ${esc(d.contactName)},`) +
      p(
        `I wanted to check in on the quote we sent${when ? ` on ${esc(when)}` : ""} for your shipment from ${esc(countryName(d.fromCountry))} to ${esc(countryName(d.toCountry))}. ` +
          `Do you have any questions, or anything you'd like us to change?`,
      ) +
      (d.estimatedCost
        ? priceCallout("Your quoted price", d.estimatedCost, d.currency, "Carrier rates change often, so let us know soon if you'd like to lock this in.")
        : "") +
      p("When you're ready, just reply to this email and we'll get it booked. If your plans changed, a quick reply helps too, and we won't keep following up.") +
      signOff(true),
    footerNote: "Reply to this email any time. It comes straight to our team.",
    trackingUrl: d.trackingUrl,
  });
  const text =
    `Hi ${d.contactName},\n\nI wanted to check in on the quote we sent${when ? ` on ${when}` : ""} for your shipment from ${countryName(d.fromCountry)} to ${countryName(d.toCountry)}.` +
    (d.estimatedCost ? ` Your quoted price is ${d.currency || "USD"} ${d.estimatedCost}.` : "") +
    `\n\nWhen you're ready, just reply and we'll get it booked. If your plans changed, a quick reply helps too.\n\n${contactLineText}\n\nBest regards,\n${SALES_REP_NAME}\nTYS Global Logistics`;
  return { subject: `Your ${countryName(d.toCountry)} shipping quote`, html, text };
}

/** Throws on SMTP failure. Always sales@ (invites a reply). */
export async function sendQuoteFollowUpEmail(d: QuoteFollowUpData) {
  const { subject, html, text } = renderQuoteFollowUp(d);
  await sendMail({ to: d.to, subject, text, html, from: SALES_FROM, useSalesAuth: true });
  return { subject };
}

// ── Shipment status update to the RECIPIENT (2026-09-30). Only sent when
// staff tick "Email the recipient" while saving a status change. ──
export type ShipmentStatusKey = "new_request" | "ready_for_pickup" | "in_transit" | "delivered" | "on_hold" | "cancelled";

const SHIPMENT_STATUS_COPY: Record<ShipmentStatusKey, { label: string; tone: Tone; heading: string; line: string }> = {
  new_request: { label: "Booked", tone: "blue", heading: "A shipment is on its way to being booked", line: "has been booked with us. We'll let you know as it moves." },
  ready_for_pickup: { label: "Ready for pickup", tone: "blue", heading: "Your shipment is ready for pickup", line: "is packed and ready for the carrier to collect in the US." },
  in_transit: { label: "In transit", tone: "blue", heading: "Your shipment is on its way", line: "is in transit and heading your way." },
  delivered: { label: "Delivered", tone: "green", heading: "Your shipment has been delivered", line: "has been delivered. We hope everything arrived safely." },
  on_hold: { label: "On hold", tone: "amber", heading: "Your shipment is on hold", line: "is on hold for the moment. Our team is working on it and will reach out if anything is needed from you." },
  cancelled: { label: "Cancelled", tone: "red", heading: "Your shipment was cancelled", line: "has been cancelled. If this is unexpected, please get in touch." },
};

export function shipmentStatusLabel(s: ShipmentStatusKey) {
  return SHIPMENT_STATUS_COPY[s].label;
}

export type ShipmentStatusEmailData = {
  to: string;
  recipientName: string;
  senderName: string;
  fromPlace: string;
  toPlace: string;
  trackingNumber: string | null;
  status: ShipmentStatusKey;
};

export function renderShipmentStatus(d: ShipmentStatusEmailData) {
  const s = SHIPMENT_STATUS_COPY[d.status];
  const who = d.senderName ? `The shipment ${esc(d.senderName)} sent you` : "Your shipment";
  const html = emailShell({
    title: s.heading,
    preheader: `${s.label}: shipment from ${d.fromPlace} to ${d.toPlace}.`,
    eyebrow: s.label,
    eyebrowTone: s.tone,
    heading: s.heading,
    bodyHtml:
      p(`Hi ${esc(d.recipientName)},`) +
      p(`${who} from ${esc(d.fromPlace)} ${s.line}`) +
      routeCallout(d.fromPlace, d.toPlace, d.trackingNumber ? `Tracking number: <strong style="color:${C.navy};">${esc(d.trackingNumber)}</strong>` : undefined) +
      p("Questions about delivery? Reply to this email or reach us below, and we'll check with the carrier for you.") +
      signOff(true),
    footerNote: "You're receiving this because you're the recipient of a shipment sent with TYS Global Logistics.",
  });
  const text =
    `Hi ${d.recipientName},\n\n${d.senderName ? `The shipment ${d.senderName} sent you` : "Your shipment"} from ${d.fromPlace} ${s.line}\n` +
    (d.trackingNumber ? `\nTracking number: ${d.trackingNumber}\n` : "") +
    `\n${contactLineText}\n\nBest regards,\n${SALES_REP_NAME}\nTYS Global Logistics`;
  return { subject: `${s.label}: your shipment from ${d.fromPlace}`, html, text };
}

/** Throws on SMTP failure. Sent from sales@ so the recipient can reply. */
export async function sendShipmentStatusEmail(d: ShipmentStatusEmailData) {
  const { subject, html, text } = renderShipmentStatus(d);
  await sendMail({ to: d.to, subject, text, html, from: SALES_FROM, useSalesAuth: true });
  return { subject };
}

// ── Internal staff emails ──

function adminRecipients(): string[] {
  const recipients = (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    // Say so. An empty ADMIN_NOTIFICATION_EMAILS made this a silent no-op,
    // indistinguishable from the SMTP server rejecting the message.
    console.warn("[mail] ADMIN_NOTIFICATION_EMAILS is empty, admin notification skipped.");
  }
  return recipients;
}

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
  /** e.g. "Morning (8am to 12pm) (America/New_York)", the quote form's callback window. */
  callbackWindow?: string;
  adminUrl: string;
};

export function renderAdminQuoteNotification(d: AdminQuoteNotification) {
  const cost = d.estimatedCost ? `${d.currency || "USD"} ${d.estimatedCost}` : "Not auto-rated (staff to price)";
  const html = emailShell({
    title: `New quote request #${d.quoteId}`,
    preheader: `${d.customerName}: ${countryName(d.fromCountry)} to ${countryName(d.toCountry)}, ${d.packageTypeLabel || "packages"}.`,
    eyebrow: `New quote #${d.quoteId}`,
    heading: `${d.customerName || "New customer"} wants to ship to ${countryName(d.toCountry)}`,
    bodyHtml:
      routeCallout(`${countryName(d.fromCountry)} ${d.fromZip}`.trim(), `${countryName(d.toCountry)} ${d.toZip}`.trim()) +
      section("Customer", [
        ["Name", d.customerName],
        ["Email", d.customerEmail],
        ["Phone", d.mobileNumber],
        ...(d.callbackWindow ? ([["Call back", d.callbackWindow]] as Array<[string, unknown]>) : []),
      ]) +
      section("Shipment", [
        ["Shipping", d.packageTypeLabel || "N/A"],
        ["Delivery type", d.isResidence ? "Residential" : "Commercial"],
        ["Estimated cost", cost],
      ]) +
      ctaButton(d.adminUrl, "Open in admin"),
    footerNote: "Internal notification for the TYS team.",
    showContact: false,
  });
  const text =
    `New quote request #${d.quoteId}\n\n` +
    `Customer: ${d.customerName} <${d.customerEmail}> ${d.mobileNumber}\n` +
    `From: ${countryName(d.fromCountry)} (${d.fromZip})\nTo: ${countryName(d.toCountry)} (${d.toZip})\n` +
    `Delivery: ${d.isResidence ? "Residential" : "Commercial"}\n` +
    `Shipping: ${d.packageTypeLabel || "N/A"}\n` +
    `Estimated cost: ${cost}\n` +
    (d.callbackWindow ? `Call back: ${d.callbackWindow}\n` : "") +
    `\nOpen in admin: ${d.adminUrl}`;
  return { subject: `New quote #${d.quoteId}: ${countryName(d.fromCountry)} to ${countryName(d.toCountry)}`, html, text };
}

/**
 * Notify staff that a new quote arrived (ADMIN_NOTIFICATION_EMAILS; no-op
 * when empty). Throws on SMTP failure; the store flow swallows it so a mail
 * outage never fails quote creation. Sends from no-reply: the noreply@ SMTP
 * login can't send as sales@ (553, confirmed 2026-08-05), and nobody replies
 * to an internal alert.
 */
export async function sendAdminQuoteNotification(d: AdminQuoteNotification) {
  const recipients = adminRecipients();
  if (recipients.length === 0) return null;
  const { subject, html, text } = renderAdminQuoteNotification(d);
  return sendMail({ to: recipients.join(", "), subject, text, html });
}

export type AdminCallbackNotification = {
  requestId: number;
  name: string;
  email: string;
  mobileNumber: string;
  timeSlotLabel: string;
  timezone: string;
  packageTypeLabel: string;
};

export function renderAdminCallbackNotification(d: AdminCallbackNotification) {
  const html = emailShell({
    title: `New callback request #${d.requestId}`,
    preheader: `${d.name} wants a call back: ${d.timeSlotLabel}.`,
    eyebrow: `Callback #${d.requestId}`,
    heading: `${d.name} wants a call back`,
    bodyHtml:
      section("Customer", [
        ["Name", d.name],
        ["Email", d.email],
        ["Phone", d.mobileNumber],
        ["Best time to call", `${d.timeSlotLabel} (${d.timezone})`],
        ["Shipping", d.packageTypeLabel || "N/A"],
      ]) +
      p("No route or pricing details yet. Call the customer to get those.", `font-size:14px;color:${C.muted};`),
    footerNote: "Internal notification for the TYS team.",
    showContact: false,
  });
  const text =
    `New callback request #${d.requestId}\n\n` +
    `Name: ${d.name} <${d.email}> ${d.mobileNumber}\n` +
    `Best time to call: ${d.timeSlotLabel} (${d.timezone})\n` +
    `Shipping: ${d.packageTypeLabel || "N/A"}\n`;
  return { subject: `New callback request #${d.requestId}: ${d.name}`, html, text };
}

/** Same recipients/no-op/throw posture as sendAdminQuoteNotification. */
export async function sendAdminCallbackNotification(d: AdminCallbackNotification) {
  const recipients = adminRecipients();
  if (recipients.length === 0) return null;
  const { subject, html, text } = renderAdminCallbackNotification(d);
  return sendMail({ to: recipients.join(", "), subject, text, html });
}

export type AdminSecurityAlert = { account: string; ip: string; failures: number; lockMinutes: number };

export function renderAdminSecurityAlert(d: AdminSecurityAlert) {
  const html = emailShell({
    title: "Admin sign-in locked",
    preheader: `${d.account} was locked after ${d.failures} failed sign-ins.`,
    eyebrow: "Security alert",
    eyebrowTone: "red",
    heading: "An admin account was locked",
    bodyHtml:
      p(`The admin account <strong>${esc(d.account)}</strong> had ${d.failures} failed sign-in attempts and is locked for ${d.lockMinutes} minutes.`) +
      section("Details", [
        ["Account", d.account],
        ["Last attempt from IP", d.ip],
        ["Locked for", `${d.lockMinutes} minutes`],
      ]) +
      p("If this wasn't you or a colleague, change that account's password once the lock ends.", `font-size:14px;color:${C.muted};`),
    footerNote: "Internal security notification for the TYS team.",
    showContact: false,
  });
  const text = [
    `The admin account "${d.account}" had ${d.failures} failed sign-in attempts and is locked for ${d.lockMinutes} minutes.`,
    `Last attempt from IP: ${d.ip}`,
    "",
    "If this wasn't you or a colleague, change that account's password once the lock ends.",
  ].join("\n");
  return { subject: `Security alert: admin sign-in locked (${d.account})`, html, text };
}

/**
 * Security alert to staff: an admin account was locked after repeated failed
 * sign-ins (2026-09-30 hardening). Never includes the attempted password.
 */
export async function sendAdminSecurityAlert(d: AdminSecurityAlert) {
  const recipients = adminRecipients();
  if (recipients.length === 0) return null;
  const { subject, html, text } = renderAdminSecurityAlert(d);
  return sendMail({ to: recipients.join(","), subject, text, html });
}
