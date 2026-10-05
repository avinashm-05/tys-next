import { z } from "zod";
import { ALLOWED_CURRENCIES } from "@/lib/validation/quote-price";

// The admin "Send quote" composer (2026-10-05). One set of editable fields
// renders three things: the email (sent from sales@), the PDF (same design,
// for WhatsApp) and a WhatsApp text. Pure module, no server imports: the
// dialog renders the live preview with it, and the send route renders the
// email again from the posted FIELDS (never from client HTML).

export const COMPANY = {
  phoneDisplay: "+1 (404) 793-8759",
  phoneTel: "+14047938759",
  whatsappDisplay: "+1 (404) 435-4574",
  whatsappDigits: "14044354574",
  email: "sales@tysgloballogistics.com",
  site: "tysgloballogistics.com",
  siteUrl: "https://www.tysgloballogistics.com",
  office: "6111 Morgan Pl Ct NE, Atlanta, GA 30324",
};

const MAX = { short: 120, line: 300, long: 1500 };

export const composerFieldsSchema = z.object({
  to: z.string().trim().email("Enter a valid email address.").max(254),
  subject: z.string().trim().max(MAX.line),
  greetingName: z.string().trim().max(MAX.short),
  heading: z.string().trim().min(1, "Add a heading.").max(MAX.short),
  intro: z.string().trim().max(MAX.long),
  partnerLine: z.string().trim().max(MAX.long),
  fromLabel: z.string().trim().min(1).max(MAX.short),
  fromSub: z.string().trim().max(MAX.short),
  toLabel: z.string().trim().min(1).max(MAX.short),
  toSub: z.string().trim().max(MAX.short),
  serviceName: z.string().trim().min(1, "Add the service name.").max(MAX.short),
  serviceTagline: z.string().trim().max(MAX.short),
  price: z
    .string()
    .trim()
    .refine((v) => Number(v) > 0 && Number(v) < 1_000_000, "Enter the price."),
  currency: z.enum(ALLOWED_CURRENCIES),
  originalMode: z.enum(["none", "amount", "percent"]),
  originalAmount: z.string().trim().max(20),
  discountPercent: z.string().trim().max(10),
  originalLabel: z.string().trim().max(MAX.short),
  rows: z
    .array(z.object({ label: z.string().trim().max(MAX.short), value: z.string().trim().max(MAX.line) }))
    .max(20),
  tipTitle: z.string().trim().max(MAX.short),
  tipText: z.string().trim().max(MAX.long),
  closing: z.string().trim().max(MAX.long),
  note: z.string().trim().max(MAX.long),
});

export type ComposerFields = z.infer<typeof composerFieldsSchema>;
export type ComposerRow = ComposerFields["rows"][number];

// ── Numbers ──

const num = (v: string) => {
  const n = Number(String(v).replace(/[,$\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

export function formatMoney(n: number, currency: string): string {
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(whole ? Math.round(n) : n);
}

export type Pricing = {
  price: number;
  /** The crossed-out rate, or null when none is shown. */
  original: number | null;
  savings: number | null;
  /** Whole percent off the original, as shown on the badge. */
  percentOff: number | null;
};

/**
 * "percent" works the original BACKWARDS from the price so the badge is
 * true: 30% off means original = price / 0.7 (1,500 → 2,143), not price
 * plus 30% (1,950, which is only 23% off).
 */
export function pricing(f: ComposerFields): Pricing {
  const price = num(f.price);
  let original: number | null = null;
  if (f.originalMode === "amount") {
    const o = num(f.originalAmount);
    original = o > price ? o : null;
  } else if (f.originalMode === "percent") {
    const p = num(f.discountPercent);
    if (p > 0 && p < 100) {
      const raw = price / (1 - p / 100);
      // Whole-dollar price → whole-dollar original, so it reads like a rate.
      original = Number.isInteger(price) ? Math.round(raw) : Math.round(raw * 100) / 100;
    }
  }
  if (original == null || !(price > 0)) return { price, original: null, savings: null, percentOff: null };
  const savings = Math.round((original - price) * 100) / 100;
  const percentOff =
    f.originalMode === "percent" ? Math.round(num(f.discountPercent)) : Math.round((savings / original) * 100);
  return { price, original, savings, percentOff };
}

export function autoSubject(f: ComposerFields, quoteId: number): string {
  const p = pricing(f);
  const parts = [
    `Quote #${quoteId}`,
    f.serviceName,
    `${f.fromLabel} to ${f.toLabel}`,
    p.price > 0 ? formatMoney(p.price, f.currency) : "",
    p.percentOff ? `${p.percentOff}% Off` : "",
  ];
  return parts.filter(Boolean).join(" | ");
}

export function subjectOf(f: ComposerFields, quoteId: number): string {
  return f.subject || autoSubject(f, quoteId);
}

// ── HTML ──

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
/** Escaped, with typed line breaks kept. */
const multi = (v: string) => esc(v).replace(/\r?\n/g, "<br>");

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const LABEL = "font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5b6472;";
const P = "margin:0 0 18px;font-size:15px;line-height:1.65;color:#1d2534;";

export type RenderOptions = {
  quoteId: number;
  repName: string;
  /** "pdf" swaps email-only wording (reply to this email, footer). */
  variant: "email" | "pdf";
  /** Absolute for email; same-origin for preview/PDF (canvas CORS). */
  logoUrl: string;
  /** Open-tracking pixel, email only. */
  trackingUrl?: string;
  /** Shown in the PDF footer. */
  preparedOn?: string;
};

function whatsappBookingUrl(f: ComposerFields, o: RenderOptions) {
  const p = pricing(f);
  const text = `Hi ${o.repName}, I'd like to book quote #${o.quoteId}, ${f.fromLabel} to ${f.toLabel}${
    p.price > 0 ? ` at ${formatMoney(p.price, f.currency)}` : ""
  }.`;
  return `https://wa.me/${COMPANY.whatsappDigits}?text=${encodeURIComponent(text)}`;
}

export function renderComposerHtml(f: ComposerFields, o: RenderOptions): string {
  const p = pricing(f);
  const pdf = o.variant === "pdf";
  const greeting = f.greetingName ? `Hi ${f.greetingName},` : "Hi there,";
  const closing = pdf
    ? f.closing.replace(/reply to this email or message us on WhatsApp/i, "message us on WhatsApp or email us")
    : f.closing;
  const rows: ComposerRow[] = [{ label: "Quote ID", value: `#${o.quoteId}` }, ...f.rows].filter(
    (r) => r.label && r.value,
  );
  const preheader = [
    f.serviceName,
    `${f.fromLabel} to ${f.toLabel}`,
    p.price > 0 ? `Your price: ${formatMoney(p.price, f.currency)}${p.original ? ` instead of ${formatMoney(p.original, f.currency)}` : ""}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  const badge = p.percentOff
    ? `<span style="display:inline-block;background:#e3f6ec;color:#11763f;font-size:12px;font-weight:700;padding:5px 11px;border-radius:999px;white-space:nowrap;">${
        f.originalMode === "percent" ? `${p.percentOff}% off` : `You save ${p.percentOff}%`
      }</span>`
    : "";

  const originalRow = p.original
    ? `<tr><td style="padding:16px 20px;border-bottom:1px solid #e3ecfb;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:14px;color:#5b6472;">${esc(f.originalLabel || "Standard rate")}</td>
<td style="text-align:right;font-size:16px;font-weight:600;color:#8a93a3;"><s style="text-decoration:line-through;">${esc(formatMoney(p.original, f.currency))}</s></td>
</tr></table></td></tr>`
    : "";

  const priceSub = p.savings
    ? f.originalMode === "percent"
      ? `${p.percentOff}% discount, you save ${formatMoney(p.savings, f.currency)}`
      : `You save ${formatMoney(p.savings, f.currency)}`
    : "";

  const detailRows = rows
    .map((r, i) => {
      const line = i === rows.length - 1 ? "" : "border-bottom:1px solid #eef2f8;";
      return `<tr><td style="padding:10px 0;${line}color:#5b6472;width:42%;vertical-align:top;">${esc(r.label)}</td><td style="padding:10px 0;${line}color:#0b1b3f;font-weight:600;text-align:right;line-height:1.6;">${multi(r.value)}</td></tr>`;
    })
    .join("");

  const tip =
    f.tipText
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td style="background:#f3f7ff;border:1px solid #e3ecfb;border-radius:14px;padding:16px 20px;">
${f.tipTitle ? `<div style="font-size:13px;font-weight:700;color:#0b1b3f;margin:0 0 4px;">${esc(f.tipTitle)}</div>` : ""}
<div style="font-size:14px;line-height:1.6;color:#1d2534;">${multi(f.tipText)}</div></td></tr></table>`
      : "";

  const contactCell = (label: string, value: string, href: string | null, pad = "4px 16px 4px 0") =>
    `<td style="padding:${pad};vertical-align:top;"><div style="${LABEL}">${label}</div>${
      href
        ? `<a href="${esc(href)}" style="font-size:14px;font-weight:600;color:#0b1b3f;text-decoration:none;">${esc(value)}</a>`
        : `<div style="font-size:14px;font-weight:600;color:#0b1b3f;">${esc(value)}</div>`
    }</td>`;

  const footerNote = pdf
    ? `Quote #${o.quoteId}${o.preparedOn ? ` &middot; Prepared on ${esc(o.preparedOn)}` : ""} for your shipment from ${esc(f.fromLabel)} to ${esc(f.toLabel)}.`
    : "You are receiving this because you requested a shipping quote on tysgloballogistics.com.";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(subjectOf(f, o.quoteId))}</title></head>
<body style="margin:0;padding:0;background:#eaf1fc;font-family:${FONT};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eaf1fc;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td style="background:#0364ff;border-radius:20px 20px 0 0;padding:26px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:middle;"><img src="${esc(o.logoUrl)}" alt="TYS Global Logistics" height="32" style="display:block;height:32px;border:0;"></td>
<td style="vertical-align:middle;text-align:right;font-size:12px;font-weight:600;color:#cfe0ff;letter-spacing:.04em;">SHIPPING FROM THE US<br>TO THE WORLD</td>
</tr></table></td></tr>
<tr><td style="background:#ffffff;padding:34px 32px 28px;border-left:1px solid #e3ecfb;border-right:1px solid #e3ecfb;font-family:${FONT};">
<div style="margin:0 0 14px;"><span style="display:inline-block;background:#e6efff;color:#0348c2;font-size:12px;font-weight:700;letter-spacing:.04em;padding:5px 11px;border-radius:999px;">Quote #${o.quoteId}</span></div>
<h1 style="margin:0 0 18px;font-size:26px;line-height:1.25;font-weight:800;letter-spacing:-.02em;color:#0b1b3f;">${esc(f.heading)}</h1>
<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#1d2534;">${esc(greeting)}</p>
${f.intro ? `<p style="${P}">${multi(f.intro)}</p>` : ""}
${f.partnerLine ? `<p style="${P}">${multi(f.partnerLine)}</p>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 16px;"><tr><td style="background:#f3f7ff;border:1px solid #e3ecfb;border-radius:14px;padding:18px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:top;width:44%;"><div style="${LABEL}">From</div><div style="font-size:16px;font-weight:700;color:#0b1b3f;margin-top:2px;">${esc(f.fromLabel)}</div>${f.fromSub ? `<div style="font-size:13px;color:#5b6472;">${esc(f.fromSub)}</div>` : ""}</td>
<td style="vertical-align:middle;text-align:center;width:12%;font-size:22px;font-weight:700;color:#0364ff;">&rarr;</td>
<td style="vertical-align:top;width:44%;text-align:right;"><div style="${LABEL}">To</div><div style="font-size:16px;font-weight:700;color:#0b1b3f;margin-top:2px;">${esc(f.toLabel)}</div>${f.toSub ? `<div style="font-size:13px;color:#5b6472;">${esc(f.toSub)}</div>` : ""}</td>
</tr></table></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;border:1px solid #d6e2f7;border-radius:14px;border-collapse:separate;">
<tr><td style="padding:16px 20px;border-bottom:1px solid #e3ecfb;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:middle;"><div style="font-size:15px;font-weight:700;color:#0b1b3f;">${esc(f.serviceName)}</div>${f.serviceTagline ? `<div style="font-size:13px;color:#5b6472;margin-top:2px;">${esc(f.serviceTagline)}</div>` : ""}</td>
<td style="vertical-align:middle;text-align:right;">${badge}</td>
</tr></table></td></tr>
${originalRow}
<tr><td style="padding:20px;background:#f3f7ff;border-radius:0 0 14px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:bottom;"><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0364ff;">Your TYS price</div>${priceSub ? `<div style="font-size:13px;color:#5b6472;margin-top:4px;">${esc(priceSub)}</div>` : ""}</td>
<td style="vertical-align:bottom;text-align:right;white-space:nowrap;"><span style="font-size:36px;line-height:1;font-weight:800;letter-spacing:-.02em;color:#0b1b3f;">${esc(p.price > 0 ? formatMoney(p.price, f.currency) : "")}</span><span style="font-size:14px;font-weight:600;color:#5b6472;"> ${esc(f.currency)}</span></td>
</tr></table></td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;font-size:14px;">${detailRows}</table>
${tip}
${closing ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#1d2534;">${multi(closing)}</p>` : ""}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr>
<td style="background:#0364ff;border-radius:999px;"><a href="${esc(whatsappBookingUrl(f, o))}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">Book on WhatsApp</a></td>
<td style="width:12px;"></td>
<td style="border:1.5px solid #c9d6ea;border-radius:999px;"><a href="mailto:${COMPANY.email}?subject=${encodeURIComponent(`Quote #${o.quoteId}: Booking`)}" style="display:inline-block;padding:12.5px 24px;font-size:15px;font-weight:700;color:#0b1b3f;text-decoration:none;border-radius:999px;">${pdf ? "Email us" : "Reply by email"}</a></td>
</tr></table>
${f.note ? `<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#5b6472;">${multi(f.note)}</p>` : ""}
<p style="margin:0 0 4px;font-size:15px;line-height:1.65;color:#1d2534;">Best regards,</p>
<p style="margin:0 0 22px;font-size:15px;line-height:1.55;color:#1d2534;"><strong style="color:#0b1b3f;">${esc(o.repName)}</strong><br><span style="color:#5b6472;">Sales, TYS Global Logistics</span></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e3ecfb;"><tr><td style="padding-top:18px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr>${contactCell("Call", COMPANY.phoneDisplay, `tel:${COMPANY.phoneTel}`)}${contactCell("WhatsApp", COMPANY.whatsappDisplay, `https://wa.me/${COMPANY.whatsappDigits}`)}</tr>
<tr>${contactCell("Email", COMPANY.email, `mailto:${COMPANY.email}`, "10px 16px 4px 0")}${contactCell("Website", COMPANY.site, COMPANY.siteUrl, "10px 16px 4px 0")}</tr>
<tr><td colspan="2" style="padding:10px 16px 4px 0;vertical-align:top;"><div style="${LABEL}">Office</div><div style="font-size:14px;font-weight:600;color:#0b1b3f;">${esc(COMPANY.office)}</div></td></tr>
</table></td></tr></table>
</td></tr>
<tr><td style="background:#0b1b3f;border-radius:0 0 20px 20px;padding:22px 32px;font-family:${FONT};">
<div style="font-size:13px;line-height:1.55;color:#c7d3ea;">${footerNote}</div>
<div style="font-size:12px;line-height:1.55;color:#8595b3;margin-top:8px;">&copy; ${new Date().getFullYear()} TYS Global Logistics &middot; <a href="${COMPANY.siteUrl}" style="color:#8595b3;">${COMPANY.site}</a></div>
</td></tr>
</table></td></tr></table>
${o.trackingUrl ? `<img src="${esc(o.trackingUrl)}" width="1" height="1" style="display:none" alt="">` : ""}
</body></html>`;
}

/** Plain-text part of the email (clients that don't render HTML). */
export function renderComposerText(f: ComposerFields, o: Pick<RenderOptions, "quoteId" | "repName">): string {
  const p = pricing(f);
  const lines = [
    f.greetingName ? `Hi ${f.greetingName},` : "Hi there,",
    "",
    f.intro,
    f.partnerLine,
    "",
    `Quote #${o.quoteId}`,
    `From: ${[f.fromLabel, f.fromSub].filter(Boolean).join(", ")}`,
    `To: ${[f.toLabel, f.toSub].filter(Boolean).join(", ")}`,
    `Service: ${f.serviceName}${f.serviceTagline ? ` (${f.serviceTagline})` : ""}`,
    ...f.rows.filter((r) => r.label && r.value).map((r) => `${r.label}: ${r.value.replace(/\n/g, ", ")}`),
    `Your price: ${formatMoney(p.price, f.currency)} ${f.currency}${p.original ? ` (${f.originalLabel || "standard rate"} ${formatMoney(p.original, f.currency)})` : ""}`,
    "",
    f.tipText ? `${f.tipTitle ? `${f.tipTitle}: ` : ""}${f.tipText}` : "",
    f.closing,
    "",
    f.note,
    "",
    "Best regards,",
    o.repName,
    "Sales, TYS Global Logistics",
    `${COMPANY.phoneDisplay} | WhatsApp ${COMPANY.whatsappDisplay} | ${COMPANY.email}`,
    COMPANY.office,
  ];
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim();
}

/** WhatsApp version: same facts, chat tone, no HTML. */
export function renderComposerWhatsApp(
  f: ComposerFields,
  o: Pick<RenderOptions, "quoteId" | "repName"> & { emailSent: boolean },
): string {
  const p = pricing(f);
  const priceLine = `Price: ${formatMoney(p.price, f.currency)} ${f.currency}${
    p.original ? ` (${(f.originalLabel || "standard rate").toLowerCase()} ${formatMoney(p.original, f.currency)})` : ""
  }`;
  const lines = [
    `Hello${f.greetingName ? ` ${f.greetingName}` : ""}, thank you for your quote request with TYS Global Logistics.`,
    "",
    `Here is your quote (Quote #${o.quoteId})${o.emailSent ? ", and we have also sent the same details to your email" : ""}:`,
    `From: ${[f.fromLabel, f.fromSub].filter(Boolean).join(", ")}`,
    `To: ${[f.toLabel, f.toSub].filter(Boolean).join(", ")}`,
    `Service: ${f.serviceName}`,
    ...f.rows.filter((r) => r.label && r.value).map((r) => `${r.label}: ${r.value.replace(/\n/g, ", ")}`),
    priceLine,
    "",
    f.partnerLine,
    f.tipText,
    "",
    `Let me know if you'd like to go ahead and I'll arrange your pickup. You can reply here, email us, or call our sales line at ${COMPANY.phoneDisplay}.`,
    "",
    "Thank you!",
    o.repName,
    "TYS Global Logistics",
  ];
  return lines.filter((l, i, a) => !(l === "" && (a[i - 1] === "" || i === 0))).join("\n").trim();
}

// ── Opening the composer from elsewhere on the quote page ──

/** The FedEx rates card fires this with a picked rate; the composer opens prefilled. */
export const COMPOSE_QUOTE_EVENT = "quote-composer:open";

export type ComposePrefill = {
  serviceName?: string;
  price?: number;
  currency?: string;
  /** Crossed-out rate, e.g. the pre-discount FedEx price. */
  originalAmount?: number;
  deliveryTime?: string;
  /** More checked FedEx services, listed as an extra row. */
  otherOptions?: { serviceName: string; price: number; currency: string }[];
};

export function openQuoteComposer(prefill: ComposePrefill = {}) {
  window.dispatchEvent(new CustomEvent<ComposePrefill>(COMPOSE_QUOTE_EVENT, { detail: prefill }));
}
