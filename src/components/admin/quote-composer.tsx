"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  CopyIcon,
  DownloadSimpleIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { countryName } from "@/lib/countries";
import { formatPackageTypes } from "@/lib/package-type";
import { ALLOWED_CURRENCIES } from "@/lib/validation/quote-price";
import {
  COMPOSE_QUOTE_EVENT,
  autoSubject,
  composerFieldsSchema,
  pricing,
  formatMoney,
  renderComposerHtml,
  renderComposerWhatsApp,
  type ComposePrefill,
  type ComposerFields,
  type ComposerRow,
} from "@/lib/quote-composer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QUOTE_NOTES_REFRESH_EVENT } from "@/components/admin/quote-follow-up-button";
import type { serializeQuoteDetail } from "@/app/api/admin/quotes/helpers";

type QuoteDetail = ReturnType<typeof serializeQuoteDetail>;
type ZipInfo = { city: string | null; state: string | null } | null;

const LOGO_PATH = "/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png";

const FEDEX_PARTNER_LINE =
  "We have worked with FedEx as a business partner for over 5 years, which is why we can offer you rates well below the standard FedEx price.";
const CUSTOMS_TIP =
  "Since these are used personal items, you can declare their actual used value, which is usually low. That helps keep customs duties to a minimum.";
const DEFAULT_CLOSING =
  "If this works for you, just reply to this email or message us on WhatsApp and we will get your shipment booked.";
const DEFAULT_NOTE =
  "This is a general rate based on the details above. Once your shipment date is confirmed, the final price may vary slightly, and we will confirm it with you before pickup.";

/** Detail rows staff add most, one click each. */
const QUICK_ROWS = ["Delivery time", "Estimated volume", "Packing & loading", "Box size", "Weight", "Pickup date"];

// ── Prefill from the quote ──

function firstName(name: string | null | undefined) {
  const t = (name ?? "").trim().split(/\s+/)[0] ?? "";
  return /^x+$/i.test(t) ? "" : t; // "Kavya XX" → "Kavya"
}

const realZip = (z: string) => z.trim() !== "" && !/^0+$/.test(z.trim());
const n = (v: string | null) => (v == null ? 0 : Number(v));
const fmt = (v: number) => String(Math.round(v * 100) / 100);

function place(zip: string, country: string, info: ZipInfo) {
  const isUS = country.trim().toUpperCase() === "US";
  const cname = countryName(country);
  if (info?.city) {
    return isUS
      ? { label: `${info.city}, ${info.state ?? ""}`.replace(/, $/, ""), sub: zip }
      : { label: realZip(zip) ? `${info.city} ${zip}` : info.city, sub: cname };
  }
  return isUS ? { label: zip, sub: "United States" } : { label: cname, sub: realZip(zip) ? zip : "" };
}

function buildDefaults(q: QuoteDetail, fromInfo: ZipInfo, toInfo: ZipInfo): ComposerFields {
  const intl = q.fromCountry.toUpperCase() !== q.toCountry.toUpperCase();
  const from = place(q.fromZip, q.fromCountry, fromInfo);
  const to = place(q.toZip, q.toCountry, toInfo);
  const typeLabel = formatPackageTypes(q.packageType);

  const boxes = q.packages.filter((p) => p.packageType === "box" || p.packageType === "boxes");
  const boxCount = boxes.reduce((s, p) => s + p.quantity, 0);
  const unit = boxes[0]?.weightUnit ?? "lb";
  const rows: ComposerRow[] = [
    { label: "Delivery", value: intl ? "Door to door" : q.isResidence ? "Residential" : "Commercial" },
    { label: "Delivery time", value: "" },
    { label: "Shipment description", value: typeLabel === "—" ? "" : typeLabel },
  ];
  if (boxCount > 0) {
    const sizes = [...new Set(boxes.filter((b) => b.length && b.width && b.height).map((b) => `${fmt(n(b.length))} x ${fmt(n(b.width))} x ${fmt(n(b.height))} in`))];
    const perBox = [...new Set(boxes.map((b) => n(b.weight)).filter((w) => w > 0))];
    const total = boxes.reduce((s, b) => s + n(b.weight) * b.quantity, 0);
    rows.push({ label: "Packages", value: `${boxCount} ${boxCount === 1 ? "box" : "boxes"}` });
    if (sizes.length) rows.push({ label: "Box size", value: sizes.length === 1 && boxCount > 1 ? `${sizes[0]} each` : sizes.join("\n") });
    if (total > 0)
      rows.push({
        label: "Weight",
        value: boxCount > 1 && perBox.length === 1 ? `${fmt(perBox[0])} ${unit} each (${fmt(total)} ${unit} total)` : `${fmt(total)} ${unit}`,
      });
  }
  if (intl) rows.push({ label: `${countryName(q.toCountry)} customs duties`, value: "Not included, paid at delivery" });

  const what = boxCount > 0 ? (boxCount === 1 ? "box" : "boxes") : typeLabel === "—" ? "shipment" : typeLabel.toLowerCase();
  return {
    to: q.contact.email ?? "",
    subject: "",
    greetingName: firstName(q.contact.name),
    heading: `Your shipping quote to ${to.label}`,
    intro: `Thank you for considering TYS Global Logistics. Here is your quote for shipping your ${what} from ${from.label} to ${to.label}.`,
    partnerLine: intl ? FEDEX_PARTNER_LINE : "",
    fromLabel: from.label,
    fromSub: from.sub,
    toLabel: to.label,
    toSub: to.sub,
    serviceName: intl ? "FedEx International Economy®" : `${typeLabel === "—" ? "Freight" : typeLabel} shipping`,
    serviceTagline: intl ? "By air · Door to door" : q.isResidence ? "Residential delivery" : "",
    price: q.estimatedCost ?? "",
    currency: (ALLOWED_CURRENCIES as readonly string[]).includes(q.currency ?? "") ? (q.currency as ComposerFields["currency"]) : "USD",
    originalMode: "none",
    originalAmount: "",
    discountPercent: "",
    originalLabel: intl ? "Standard FedEx rate" : "Standard rate",
    rows,
    tipTitle: "",
    tipText: "",
    closing: DEFAULT_CLOSING,
    note: DEFAULT_NOTE,
  };
}

function applyPrefill(f: ComposerFields, p: ComposePrefill): ComposerFields {
  const next = { ...f, rows: [...f.rows] };
  if (p.serviceName) next.serviceName = p.serviceName;
  if (p.price != null) next.price = String(p.price);
  if (p.currency && (ALLOWED_CURRENCIES as readonly string[]).includes(p.currency)) next.currency = p.currency as ComposerFields["currency"];
  if (p.originalAmount != null && p.price != null && p.originalAmount > p.price) {
    next.originalMode = "amount";
    next.originalAmount = String(p.originalAmount);
  }
  const setRow = (label: string, value: string) => {
    const i = next.rows.findIndex((r) => r.label === label);
    if (i >= 0) next.rows[i] = { label, value };
    else next.rows.push({ label, value });
  };
  if (p.deliveryTime) setRow("Delivery time", p.deliveryTime);
  if (p.otherOptions?.length)
    setRow("Other options", p.otherOptions.map((o) => `${o.serviceName}: ${formatMoney(o.price, o.currency)}`).join("\n"));
  return next;
}

// ── PDF (same design as the email, rendered in the browser) ──

async function downloadPdf(html: string, fileName: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:680px;height:400px;border:0;";
  document.body.appendChild(frame);
  try {
    await new Promise<void>((resolve) => {
      frame.onload = () => resolve();
      frame.srcdoc = html;
    });
    const doc = frame.contentDocument!;
    await Promise.all(
      Array.from(doc.images).map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined))),
    );
    const height = Math.ceil(doc.documentElement.scrollHeight);
    frame.style.height = `${height}px`;
    const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
    const image = await toJpeg(doc.body, { width: 680, height, pixelRatio: 2, quality: 0.92, backgroundColor: "#eaf1fc" });
    const pdf = new jsPDF({ unit: "px", format: [680, height], hotfixes: ["px_scaling"], compress: true });
    pdf.addImage(image, "JPEG", 0, 0, 680, height);
    // Keep the buttons and contact links clickable in the PDF.
    const origin = doc.body.getBoundingClientRect();
    doc.querySelectorAll("a[href]").forEach((a) => {
      const r = a.getBoundingClientRect();
      if (r.width && r.height) pdf.link(r.left - origin.left, r.top - origin.top, r.width, r.height, { url: (a as HTMLAnchorElement).href });
    });
    pdf.save(fileName);
  } finally {
    frame.remove();
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return ok;
  }
}

// ── UI ──

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-border/70 px-5 py-5 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-foreground/80">{label}</span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function QuoteComposer({ quote, repName }: { quote: QuoteDetail; repName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<ComposerFields | null>(null);
  const [zips, setZips] = useState<{ from: ZipInfo; to: ZipInfo }>({ from: null, to: null });
  const [tab, setTab] = useState<"email" | "whatsapp">("email");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [previewHeight, setPreviewHeight] = useState(900);

  // City names for the route card, looked up once per quote.
  useEffect(() => {
    const look = (zip: string, country: string) =>
      fetch(`/api/admin/quotes/zip-lookup?zip=${encodeURIComponent(zip)}&country=${encodeURIComponent(country)}`)
        .then((r) => r.json() as Promise<ZipInfo>)
        .catch(() => null);
    Promise.all([look(quote.fromZip, quote.fromCountry), look(quote.toZip, quote.toCountry)]).then(([from, to]) =>
      setZips({ from, to }),
    );
  }, [quote.fromZip, quote.fromCountry, quote.toZip, quote.toCountry]);

  const defaults = useMemo(() => buildDefaults(quote, zips.from, zips.to), [quote, zips]);

  // The FedEx card hands over a picked rate.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<ComposePrefill>).detail ?? {};
      setFields((f) => applyPrefill(f ?? defaults, detail));
      setSentTo(null);
      setOpen(true);
    };
    window.addEventListener(COMPOSE_QUOTE_EVENT, onOpen);
    return () => window.removeEventListener(COMPOSE_QUOTE_EVENT, onOpen);
  }, [defaults]);

  const f = fields ?? defaults;
  const set = <K extends keyof ComposerFields>(key: K, value: ComposerFields[K]) => {
    setFields({ ...f, [key]: value });
    if (errors[key as string])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
  };
  const setRow = (i: number, row: Partial<ComposerRow>) =>
    set("rows", f.rows.map((r, j) => (j === i ? { ...r, ...row } : r)));

  const quoteId = quote.id;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const previewHtml = useMemo(
    () => renderComposerHtml(f, { quoteId, repName, variant: "email", logoUrl: `${origin}${LOGO_PATH}` }),
    [f, quoteId, repName, origin],
  );
  const whatsapp = useMemo(
    () => renderComposerWhatsApp(f, { quoteId, repName, emailSent: sentTo != null }),
    [f, quoteId, repName, sentTo],
  );
  const p = pricing(f);

  function validate(): boolean {
    const r = composerFieldsSchema.safeParse(f);
    if (r.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of r.error.issues) next[String(issue.path[0])] ??= issue.message;
    setErrors(next);
    toast.error(Object.values(next)[0] ?? "Check the highlighted fields.");
    return false;
  }

  async function send() {
    if (!validate()) return;
    setSending(true);
    try {
      const res = await adminApi<{ sentTo: string }>(`/api/admin/quotes/${quoteId}/compose`, {
        method: "POST",
        body: JSON.stringify({ fields: f }),
      });
      setSentTo(res.sentTo);
      toast.success(`Quote sent to ${res.sentTo}.`);
      window.dispatchEvent(new Event(QUOTE_NOTES_REFRESH_EVENT));
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't send the quote.");
    } finally {
      setSending(false);
    }
  }

  async function pdf() {
    if (!validate()) return;
    setPdfBusy(true);
    try {
      const preparedOn = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/New_York" }).format(new Date());
      const html = renderComposerHtml(f, { quoteId, repName, variant: "pdf", logoUrl: `${origin}${LOGO_PATH}`, preparedOn });
      const to = f.toLabel.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
      await downloadPdf(html, `TYS_Quote_${quoteId}${to ? `_${to}` : ""}.pdf`);
    } catch {
      toast.error("Couldn't create the PDF. Try again.");
    } finally {
      setPdfBusy(false);
    }
  }

  async function copyWhatsApp() {
    if (await copyText(whatsapp)) toast.success("WhatsApp message copied.");
    else toast.error("Couldn't copy. Select the text and copy it manually.");
  }

  const input = (key: keyof ComposerFields, props: React.ComponentProps<typeof Input> = {}) => (
    <Input
      value={String(f[key] ?? "")}
      onChange={(e) => set(key, e.target.value as never)}
      aria-invalid={errors[key] ? true : undefined}
      {...props}
    />
  );
  const area = (key: keyof ComposerFields, rows = 2, props: React.ComponentProps<typeof Textarea> = {}) => (
    <Textarea
      value={String(f[key] ?? "")}
      onChange={(e) => set(key, e.target.value as never)}
      rows={rows}
      className="min-h-0 resize-y"
      {...props}
    />
  );

  return (
    <>
      <Button
        className="bg-tys-blue text-white hover:bg-tys-blue/90"
        onClick={() => {
          setFields((cur) => cur ?? defaults);
          setOpen(true);
        }}
      >
        <PaperPlaneTiltIcon size={16} weight="bold" />
        Send quote
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[92vh] w-[96vw] max-w-[96vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(1280px,96vw)]">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5 pr-12">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">Send quote #{quoteId}</DialogTitle>
              <DialogDescription className="truncate text-xs">
                Edit anything on the left. The preview, PDF and WhatsApp text update as you type.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground"
              onClick={() => {
                setFields(defaults);
                setErrors({});
              }}
            >
              <ArrowCounterClockwiseIcon size={14} /> Reset
            </Button>
          </div>

          {/* Body */}
          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
            {/* Form */}
            <div className="min-h-0 overflow-y-auto border-r">
              <Section title="Recipient">
                <Field label="To" error={errors.to}>{input("to", { type: "email" })}</Field>
                <Field label="Subject" hint={f.subject ? undefined : "Leave empty to use the automatic subject."}>
                  {input("subject", { placeholder: autoSubject(f, quoteId) })}
                </Field>
              </Section>

              <Section title="Price">
                <Field label="Service" error={errors.serviceName}>{input("serviceName")}</Field>
                <Field label="Service line" hint="Shown under the service name, e.g. By air · Door to door · 4 to 5 working days">
                  {input("serviceTagline")}
                </Field>
                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <Field label="Your price" error={errors.price}>{input("price", { inputMode: "decimal", placeholder: "0.00" })}</Field>
                  <Field label="Currency">
                    <Select value={f.currency} onValueChange={(v) => set("currency", v as ComposerFields["currency"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALLOWED_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-foreground/80">Crossed-out original rate</span>
                  <div className="inline-flex self-start rounded-lg border p-0.5">
                    {([
                      ["none", "None"],
                      ["amount", "Type the rate"],
                      ["percent", "From discount %"],
                    ] as const).map(([v, l]) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => set("originalMode", v)}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-medium transition",
                          f.originalMode === v ? "bg-tys-blue text-white" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  {f.originalMode !== "none" && (
                    <div className="grid grid-cols-2 gap-3">
                      {f.originalMode === "amount" ? (
                        <Field label="Original rate">{input("originalAmount", { inputMode: "decimal", placeholder: "e.g. 2151.11" })}</Field>
                      ) : (
                        <Field label="Discount %">{input("discountPercent", { inputMode: "decimal", placeholder: "e.g. 30" })}</Field>
                      )}
                      <Field label="Label">{input("originalLabel")}</Field>
                    </div>
                  )}
                  {p.original != null && p.savings != null && (
                    <p className="text-xs text-muted-foreground">
                      Shows <s>{formatMoney(p.original, f.currency)}</s> → <span className="font-semibold text-foreground">{formatMoney(p.price, f.currency)}</span>, saves {formatMoney(p.savings, f.currency)} ({p.percentOff}% off).
                    </p>
                  )}
                </div>
              </Section>

              <Section title="Route">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="From" error={errors.fromLabel}>{input("fromLabel")}</Field>
                  <Field label="Under it">{input("fromSub")}</Field>
                  <Field label="To" error={errors.toLabel}>{input("toLabel")}</Field>
                  <Field label="Under it">{input("toSub")}</Field>
                </div>
              </Section>

              <Section
                title="Details"
                aside={
                  <button type="button" onClick={() => set("rows", [...f.rows, { label: "", value: "" }])} className="flex items-center gap-1 text-xs font-medium text-tys-blue hover:underline">
                    <PlusIcon size={12} weight="bold" /> Add row
                  </button>
                }
              >
                <p className="-mt-1 text-xs text-muted-foreground">Quote ID is added automatically. Empty rows are left out.</p>
                <div className="flex flex-col gap-2">
                  {f.rows.map((r, i) => (
                    <div key={i} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] items-start gap-2">
                      <Input value={r.label} placeholder="Label" onChange={(e) => setRow(i, { label: e.target.value })} />
                      <Textarea
                        value={r.value}
                        placeholder="Value"
                        rows={1}
                        className="min-h-9 resize-y py-2"
                        onChange={(e) => setRow(i, { value: e.target.value })}
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${r.label || "row"}`}
                        onClick={() => set("rows", f.rows.filter((_, j) => j !== i))}
                        className="mt-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ROWS.filter((l) => !f.rows.some((r) => r.label === l)).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => set("rows", [...f.rows, { label: l, value: l === "Packing & loading" ? "Done by customer" : "" }])}
                      className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:border-tys-blue hover:text-tys-blue"
                    >
                      + {l}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Message">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Greeting name" hint="Empty = “Hi there,”">{input("greetingName")}</Field>
                  <Field label="Heading" error={errors.heading}>{input("heading")}</Field>
                </div>
                <Field label="Opening">{area("intro", 3)}</Field>
                <Field label="Why our rate is lower" hint="Leave empty to hide.">{area("partnerLine", 2)}</Field>
                <Field label="Closing">{area("closing", 2)}</Field>
                <Field label="Small print" hint="Shown in small grey text above the signature.">{area("note", 3)}</Field>
              </Section>

              <Section
                title="Tip box"
                aside={
                  !f.tipText && (
                    <button type="button" onClick={() => setFields({ ...f, tipTitle: "A tip on customs", tipText: CUSTOMS_TIP })} className="text-xs font-medium text-tys-blue hover:underline">
                      Insert customs tip
                    </button>
                  )
                }
              >
                <Field label="Title">{input("tipTitle", { placeholder: "Optional" })}</Field>
                <Field label="Text" hint="Leave empty to hide the box.">{area("tipText", 2)}</Field>
              </Section>
            </div>

            {/* Preview */}
            <div className="flex min-h-0 flex-col bg-muted/40">
              <div className="flex items-center gap-1 border-b bg-background px-4 py-2">
                {([
                  ["email", "Email & PDF"],
                  ["whatsapp", "WhatsApp"],
                ] as const).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTab(v)}
                    className={cn(
                      "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium",
                      tab === v ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
                <span className="ml-auto truncate text-xs text-muted-foreground" title={f.subject || autoSubject(f, quoteId)}>
                  {f.subject || autoSubject(f, quoteId)}
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {tab === "email" ? (
                  <iframe
                    ref={previewRef}
                    title="Email preview"
                    sandbox="allow-same-origin"
                    srcDoc={previewHtml}
                    onLoad={() => {
                      const h = previewRef.current?.contentDocument?.documentElement.scrollHeight;
                      if (h) setPreviewHeight(h);
                    }}
                    className="block w-full border-0"
                    style={{ height: previewHeight }}
                  />
                ) : (
                  <div className="p-6">
                    <div className="mx-auto max-w-md whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-4 py-3 text-[14px] leading-relaxed text-[#111b21] shadow-sm">
                      {whatsapp}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-background px-5 py-3">
            <div className="min-w-0 text-xs text-muted-foreground">
              {sentTo ? (
                <span className="flex items-center gap-1.5 font-medium text-green-700">
                  <CheckCircleIcon size={15} weight="fill" /> Sent to {sentTo}. Now download the PDF or copy the WhatsApp text.
                </span>
              ) : (
                <>Sends from sales@ as {repName}, saves the price on the quote and marks it Quoted.</>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={copyWhatsApp}>
                <CopyIcon size={15} /> Copy WhatsApp text
              </Button>
              <Button variant="outline" onClick={pdf} disabled={pdfBusy}>
                <DownloadSimpleIcon size={15} /> {pdfBusy ? "Creating PDF…" : "Download PDF"}
              </Button>
              <Button className="bg-tys-blue text-white hover:bg-tys-blue/90" onClick={send} disabled={sending}>
                <PaperPlaneTiltIcon size={15} weight="bold" />
                {sending ? "Sending…" : sentTo ? "Send again" : "Send email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
