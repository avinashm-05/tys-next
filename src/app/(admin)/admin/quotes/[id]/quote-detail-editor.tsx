"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BuildingsIcon,
  ClockIcon,
  EnvelopeIcon,
  GlobeIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { FieldRow, IconInput } from "@/components/admin/field-row";
import { adminApi, ApiError } from "@/lib/admin-api";
import { QuoteWorkstation } from "@/components/admin/quote-workstation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LocalDateTime } from "@/components/shared/local-date-time";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { serializeQuoteDetail } from "@/app/api/admin/quotes/helpers";
import { formatPackageTypes } from "@/lib/package-type";
import { TIME_SLOTS } from "@/lib/validation/quote-store";
import { QuoteNotesSection, type QuoteNotesSectionHandle } from "./quote-notes-section";

const TIME_SLOT_LABELS: Record<string, string> = Object.fromEntries(TIME_SLOTS.map((s) => [s.value, s.label]));

type QuoteDetail = ReturnType<typeof serializeQuoteDetail>;
type Pkg = QuoteDetail["packages"][number];

// Seeds the "New Quote" page (no `quote` prop) — same shape a real quote
// serializes to, just empty, so the rest of this component never has to
// know whether it's creating or editing. See QuoteDetailEditor's `editing`.
const BLANK_QUOTE: QuoteDetail = {
  id: 0,
  fromCountry: "US",
  fromZip: "",
  toCountry: "",
  toZip: "",
  isResidence: false,
  packageType: "",
  status: "pending",
  totalChargeableWeight: null,
  estimatedCost: null,
  currency: null,
  preferredTimeSlot: null,
  timezone: null,
  contact: { name: null, email: null, countryCode: null, phone: null },
  emailStatistic: null,
  createdAt: null,
  boxData: null,
  televisionData: null,
  autoData: null,
  packages: [],
  updatedAt: null,
};

const PACKAGE_TYPES = ["box", "television", "auto", "envelope", "furniture", "packers_movers"];

// The public /quotes form no longer collects package dimensions at all (see
// quote-request-form.tsx) — staff fill these in here once they've called the
// customer. Field set per type: a box ships by weight/dimensions, a TV adds
// brand/model on top of weight/dimensions, a car is brand/model/year only —
// no weight or dimensions — and envelope/furniture/packers_movers collect
// nothing beyond quantity. Fields marked false render as a muted "—" instead
// of an input, so it's visually obvious a field doesn't apply rather than
// just sitting empty.
const PACKAGE_FIELDS: Record<
  string,
  { qty: boolean; weight: boolean; dims: boolean; chargeable: boolean; brand: boolean; model: boolean; year: boolean }
> = {
  box: { qty: true, weight: true, dims: true, chargeable: true, brand: false, model: false, year: false },
  television: { qty: false, weight: true, dims: true, chargeable: true, brand: true, model: true, year: false },
  auto: { qty: false, weight: false, dims: false, chargeable: false, brand: true, model: true, year: true },
  envelope: { qty: true, weight: false, dims: false, chargeable: false, brand: false, model: false, year: false },
  furniture: { qty: true, weight: false, dims: false, chargeable: false, brand: false, model: false, year: false },
  packers_movers: { qty: true, weight: false, dims: false, chargeable: false, brand: false, model: false, year: false },
};

function fieldsFor(type: string) {
  return PACKAGE_FIELDS[type] ?? PACKAGE_FIELDS.box;
}

function MutedCell() {
  return <span className="text-sm text-muted-foreground">—</span>;
}

// A brand-new row gets a negative client-side id (never a real DB id) so
// Save/Save & Exit's PATCH knows to create it instead of updating — see
// handleSave() below.
function emptyPackage(packageType = "box"): Pkg {
  return {
    id: -Date.now() - Math.random(),
    packageType,
    quantity: 1,
    weight: null,
    weightUnit: null,
    length: null,
    width: null,
    height: null,
    chargeableWeight: null,
    brandName: null,
    tvModel: null,
    carModel: null,
    carYear: null,
  };
}

// The public single-page form (quote-request-form.tsx) stores the customer's
// chosen package type(s) as a CSV on the quote itself but never creates
// PackageDetail rows (no dimensions are collected up front — see
// quote-request.ts) — staff fill those in on the call. Without this, a quote
// that clearly shows "Auto" or "Packers & Movers" on the list page opened up
// to an empty Package card with no indication of what was picked, so a rep
// had to go back to the list, remember the type, then manually "+ Add
// package" and re-select it before they could even start filling in
// dimensions. Seeding one editable row per selected type (already correctly
// typed) removes that round trip. "boxes" (the public form's plural value)
// normalizes to this editor's singular "box" so the row's own type dropdown
// (PACKAGE_TYPES below) actually shows it selected instead of blank.
function packageRowsFromType(csv: string): Pkg[] {
  return csv
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .map((t) => emptyPackage(t === "boxes" ? "box" : t));
}

type ZipInfoState = { city: string | null; state: string | null; timezone: string | null } | null;

// Debounced zip → city/state/timezone glance, works for any country (US via
// an instant static table server-side, everything else via a geocoder call)
// — see /api/admin/quotes/zip-lookup. Silently shows nothing for an
// unrecognized code — never a wrong guess.
const PLAUSIBLE_POSTAL_CODE = /^[a-zA-Z0-9][a-zA-Z0-9 -]{2,9}$/;

function useZipInfo(zip: string, country: string) {
  const [info, setInfo] = useState<ZipInfoState>(null);

  useEffect(() => {
    const trimmed = zip.trim();
    const isValid = PLAUSIBLE_POSTAL_CODE.test(trimmed) && country.trim().length > 0;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (!isValid) {
        setInfo(null);
        return;
      }
      fetch(
        `/api/admin/quotes/zip-lookup?zip=${encodeURIComponent(trimmed)}&country=${encodeURIComponent(country)}`,
        { signal: controller.signal },
      )
        .then((r) => r.json())
        .then((data: ZipInfoState) => setInfo(data?.city ? data : null))
        .catch(() => {});
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [zip, country]);

  return info;
}

// Live-ticking "what time is it there" — 12-hour clock + zone abbreviation,
// built as its own pieces ("12:00 AM" · "EST") rather than Intl's combined
// "12:00 AM EST" string, to match the "·"-separated style used everywhere
// else on this card. Re-renders every 30s, plenty for a glance-at-a-quote
// clock.
function useNowInTimeZone(timezone: string | null): string | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timezone) return;
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (!timezone) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const time = `${get("hour")}:${get("minute")} ${get("dayPeriod")}`.trim();
    const zone = get("timeZoneName");
    return zone ? `${time} · ${zone}` : time || null;
  } catch {
    return null;
  }
}

// Read-only "what/where is it right now" glance — sits in the rightmost grid
// column next to Country/Zip instead of as a caption line below them, so
// From and To read left-to-right as one row (per the SETU-style single-card
// layout: Customer Details, then From, then To).
function LocationGlance({ zipInfo, liveTime }: { zipInfo: ZipInfoState; liveTime: string | null }) {
  return (
    <FieldRow label="City, State">
      <div className="flex h-9 items-center gap-1.5 overflow-hidden rounded-md border border-tys-mist bg-muted/30 px-3 text-sm text-muted-foreground">
        {zipInfo ? (
          <>
            <BuildingsIcon size={14} className="shrink-0" />
            <span className="truncate">
              {zipInfo.city}, {zipInfo.state}
            </span>
            {liveTime && (
              <>
                <span className="shrink-0 text-tys-mist">·</span>
                <ClockIcon size={14} className="shrink-0" />
                <span className="shrink-0">{liveTime}</span>
              </>
            )}
          </>
        ) : (
          <span>—</span>
        )}
      </div>
    </FieldRow>
  );
}

function RouteSection({
  title,
  icon: Icon,
  country,
  zip,
  onCountryChange,
  onZipChange,
  extra,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  country: string;
  zip: string;
  onCountryChange: (v: string) => void;
  onZipChange: (v: string) => void;
  extra?: React.ReactNode;
}) {
  const zipInfo = useZipInfo(zip, country);
  const liveTime = useNowInTimeZone(zipInfo?.timezone ?? null);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-tys-blue" />
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FieldRow label="Country">
          <IconInput icon={GlobeIcon} value={country} onChange={(e) => onCountryChange(e.target.value)} />
        </FieldRow>
        <FieldRow label="Zip / Postal code">
          <IconInput icon={BuildingsIcon} value={zip} onChange={(e) => onZipChange(e.target.value)} />
        </FieldRow>
        <LocationGlance zipInfo={zipInfo} liveTime={liveTime} />
      </div>
      {extra && <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{extra}</div>}
    </section>
  );
}

export function QuoteDetailEditor({ quote: quoteProp }: { quote?: QuoteDetail }) {
  const router = useRouter();
  // No `quote` prop = the "New Quote" page (see admin/quotes/new/page.tsx) —
  // same component, same layout, just seeded blank so staff build a quote
  // from scratch instead of editing one that already exists.
  const editing = quoteProp !== undefined;
  const quote = quoteProp ?? BLANK_QUOTE;
  const [fromCountry, setFromCountry] = useState(quote.fromCountry);
  const [fromZip, setFromZip] = useState(quote.fromZip);
  const [toCountry, setToCountry] = useState(quote.toCountry);
  const [toZip, setToZip] = useState(quote.toZip);
  const [isResidence, setIsResidence] = useState(quote.isResidence);

  const [name, setName] = useState(quote.contact.name ?? "");
  const [email, setEmail] = useState(quote.contact.email ?? "");
  const [countryCode, setCountryCode] = useState(quote.contact.countryCode ?? "");
  const [phone, setPhone] = useState(quote.contact.phone ?? "");

  const [packages, setPackages] = useState<Pkg[]>(() =>
    quote.packages.length > 0
      ? quote.packages
      : quote.packageType
        ? packageRowsFromType(quote.packageType)
        : [],
  );
  const [saving, setSaving] = useState(false);
  // Save/Save & Exit also posts whatever's sitting in the Notes draft box —
  // otherwise a rep who types a comment and hits the page's Save button
  // (instead of the Notes card's own "+") would see it silently vanish.
  const notesRef = useRef<QuoteNotesSectionHandle>(null);

  function updatePackage(index: number, patch: Partial<Pkg>) {
    setPackages((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function removePackage(index: number) {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  }

  function addPackage() {
    setPackages((prev) => [...prev, emptyPackage()]);
  }

  // Saves route + contact + package rows in one request. Package rows keep
  // whatever id the client currently has — negative (client-generated, a row
  // added this session) creates, positive updates — so the response's fresh
  // ids/rows are written back into state; otherwise a second save on a
  // just-added row would try to "update" an id that was never real.
  //
  // Editing an existing quote PATCHes it and stays put (or exits to the
  // list). A brand-new quote (no `quote` prop) POSTs to create it, then
  // always navigates — "Save" opens the quote it just created (the same
  // detail page a real customer submission would land on), "Save & Exit"
  // goes straight back to the list.
  async function handleSave(exitAfter: boolean) {
    setSaving(true);
    const payload = {
      from_country: fromCountry,
      from_zip: fromZip,
      to_country: toCountry,
      to_zip: toZip,
      is_residence: isResidence,
      contact: { name, email, country_code: countryCode, phone },
      packages: packages.map((p) => ({
        id: p.id,
        package_type: p.packageType,
        quantity: p.quantity,
        weight: p.weight,
        weight_unit: p.weightUnit,
        length: p.length,
        width: p.width,
        height: p.height,
        brand_name: p.brandName,
        tv_model: p.tvModel,
        car_model: p.carModel,
        car_year: p.carYear,
      })),
    };
    try {
      if (editing) {
        const [updated] = await Promise.all([
          adminApi<QuoteDetail>(`/api/admin/quotes/${quote.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          }),
          notesRef.current?.flushDraft(),
        ]);
        setPackages(updated.packages);
        toast.success("Quote saved.");
        if (exitAfter) router.push("/admin/quotes");
      } else {
        const created = await adminApi<{ id: number }>("/api/admin/quotes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Quote created.");
        router.push(exitAfter ? "/admin/quotes" : `/admin/quotes/${created.id}`);
      }
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't save the quote.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card size="sm">
        <CardContent className="flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserIcon size={18} className="text-tys-blue" />
                <h2 className="font-heading text-lg font-semibold">Customer Details</h2>
              </div>
              {quote.preferredTimeSlot && (
                <span className="flex items-center gap-1.5 rounded-full bg-tys-blue/10 px-3 py-1 text-xs font-medium text-tys-blue">
                  <ClockIcon size={14} />
                  Call back: {TIME_SLOT_LABELS[quote.preferredTimeSlot] ?? quote.preferredTimeSlot}
                  {quote.timezone ? ` · ${quote.timezone}` : ""}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr_90px_1fr]">
              <FieldRow label="Name">
                <IconInput icon={UserIcon} value={name} onChange={(e) => setName(e.target.value)} />
              </FieldRow>
              <FieldRow label="Email">
                <IconInput icon={EnvelopeIcon} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FieldRow>
              <FieldRow label="Code">
                <IconInput icon={PhoneIcon} value={countryCode} onChange={(e) => setCountryCode(e.target.value)} />
              </FieldRow>
              <FieldRow label="Phone">
                <IconInput icon={PhoneIcon} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </FieldRow>
            </div>
          </section>

          <RouteSection
            title="From"
            icon={GlobeIcon}
            country={fromCountry}
            zip={fromZip}
            onCountryChange={setFromCountry}
            onZipChange={setFromZip}
          />
          <RouteSection
            title="To"
            icon={GlobeIcon}
            country={toCountry}
            zip={toZip}
            onCountryChange={setToCountry}
            onZipChange={setToZip}
            extra={
              <FieldRow label="Location type">
                <Select
                  value={isResidence ? "residential" : "commercial"}
                  onValueChange={(v) => setIsResidence(v === "residential")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            }
          />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BuildingsIcon size={18} className="text-tys-blue" />
              <h2 className="font-heading text-lg font-semibold">Package</h2>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={addPackage}
              className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
            >
              <PlusIcon size={14} weight="bold" />
              Add package
            </Button>
          </div>

          {packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No package type selected yet — add one below.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-tys-mist">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>
                      Dimensions ({packages[0]?.weightUnit === "kg" ? "cm" : "in"})
                    </TableHead>
                    <TableHead>Chargeable</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((p, i) => {
                    const fields = fieldsFor(p.packageType);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="min-w-32">
                          <Select
                            value={p.packageType}
                            onValueChange={(v) => updatePackage(i, { packageType: v })}
                          >
                            <SelectTrigger className="h-8 w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PACKAGE_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>{formatPackageTypes(t)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {fields.qty ? (
                            <Input
                              type="number"
                              min={1}
                              className="h-8 w-16"
                              value={p.quantity}
                              onChange={(e) => updatePackage(i, { quantity: Number(e.target.value) || 1 })}
                            />
                          ) : (
                            <MutedCell />
                          )}
                        </TableCell>
                        <TableCell>
                          {fields.weight ? (
                            // Weight + unit, same pairing as the public wizard's
                            // "LB/IN" / "KG/CM" selector — one toggle drives
                            // both the weight unit and the dimension unit.
                            <div className="flex gap-1">
                              <Input
                                className="h-8 w-16"
                                value={p.weight ?? ""}
                                onChange={(e) => updatePackage(i, { weight: e.target.value })}
                              />
                              <Select
                                value={p.weightUnit ?? "lb"}
                                onValueChange={(v) => updatePackage(i, { weightUnit: v as Pkg["weightUnit"] })}
                              >
                                <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lb">lb</SelectItem>
                                  <SelectItem value="kg">kg</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <MutedCell />
                          )}
                        </TableCell>
                        <TableCell>
                          {fields.dims ? (
                            <div className="flex items-center gap-1">
                              <Input
                                className="h-8 w-14"
                                value={p.length ?? ""}
                                onChange={(e) => updatePackage(i, { length: e.target.value })}
                              />
                              <span className="text-muted-foreground">×</span>
                              <Input
                                className="h-8 w-14"
                                value={p.width ?? ""}
                                onChange={(e) => updatePackage(i, { width: e.target.value })}
                              />
                              <span className="text-muted-foreground">×</span>
                              <Input
                                className="h-8 w-14"
                                value={p.height ?? ""}
                                onChange={(e) => updatePackage(i, { height: e.target.value })}
                              />
                            </div>
                          ) : (
                            <MutedCell />
                          )}
                        </TableCell>
                        <TableCell>
                          {fields.chargeable ? (
                            // Read-only, same as the public wizard's computed
                            // Chargeable Weight field — carried straight from
                            // what the customer's submission calculated.
                            <Input disabled className="h-8 w-20" value={p.chargeableWeight ?? "—"} />
                          ) : (
                            <MutedCell />
                          )}
                        </TableCell>
                        <TableCell>
                          {fields.brand ? (
                            <Input
                              className="h-8 w-24"
                              placeholder={p.packageType === "auto" ? "Car name" : "Brand"}
                              value={p.brandName ?? ""}
                              onChange={(e) => updatePackage(i, { brandName: e.target.value })}
                            />
                          ) : (
                            <MutedCell />
                          )}
                        </TableCell>
                        <TableCell>
                          {fields.model ? (
                            <Input
                              className="h-8 w-24"
                              placeholder={p.packageType === "auto" ? "Car model" : "Model"}
                              value={p.tvModel ?? p.carModel ?? ""}
                              onChange={(e) =>
                                updatePackage(
                                  i,
                                  p.packageType === "auto"
                                    ? { carModel: e.target.value }
                                    : { tvModel: e.target.value },
                                )
                              }
                            />
                          ) : (
                            <MutedCell />
                          )}
                        </TableCell>
                        <TableCell>
                          {fields.year ? (
                            <Input
                              className="h-8 w-20"
                              placeholder="YYYY"
                              maxLength={4}
                              value={p.carYear ?? ""}
                              onChange={(e) => updatePackage(i, { carYear: e.target.value })}
                            />
                          ) : (
                            <MutedCell />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removePackage(i)}
                            aria-label="Remove package"
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FedEx rates/Notes only make sense once the quote is real (a save
          has happened) — a brand-new "New Quote" page has no id to fetch/
          post against yet. Rendered here, inside the same component as the
          sticky footer below, so that footer is the true last thing on the
          page (see the comment on it) instead of floating mid-page above
          these sections the way it did when they lived in page.tsx. */}
      {editing && (
        <>
          <div id="pricing" className="flex flex-col gap-6 scroll-mt-6">
            <QuoteWorkstation
              quoteId={quote.id}
              isResidence={quote.isResidence}
              currency={quote.currency ?? "USD"}
              estimatedCost={quote.estimatedCost}
              sendTo={quote.contact.email}
              packageType={quote.packageType}
            />
          </div>

          <QuoteNotesSection ref={notesRef} quoteId={quote.id} />

          <p className="text-xs text-muted-foreground">
            Last updated <LocalDateTime iso={quote.updatedAt} />
          </p>
        </>
      )}

      {/* Sticky action bar — same pattern as Shipments' edit page
          (shipment-edit-client.tsx): pinned to the viewport bottom so
          Save/Save & Exit stay reachable without scrolling back up past the
          Package table. Rendered as the LAST thing on the page (after FedEx
          rates/Notes above) — a sticky element only stays pinned to the
          viewport for as long as its own parent container is still on
          screen, so if anything else followed it in the DOM, it would
          release and float away instead of tracking the real page bottom. */}
      <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-tys-mist bg-background/95 px-6 py-3 backdrop-blur">
        <Button type="button" variant="outline" disabled={saving} onClick={() => router.push("/admin/quotes")}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={saving}
          onClick={() => handleSave(false)}
          className="bg-tys-rose text-white hover:bg-tys-rose/90"
        >
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          disabled={saving}
          onClick={() => handleSave(true)}
          className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
        >
          {saving ? "Saving…" : "Save & Exit"}
        </Button>
      </div>
    </div>
  );
}
