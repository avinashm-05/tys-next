"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useFieldArray, useForm, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AirplaneTiltIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BoatIcon,
  CheckIcon,
  CubeIcon,
  EnvelopeSimpleIcon,
  PackageIcon,
  PlusIcon,
  StackIcon,
  TrashIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { SearchableSelect } from "@/components/public/searchable-select";
import { PostalCodeInput } from "@/components/public/postal-code-input";
import {
  STEP_FIELDS,
  shipmentWizardSchema,
  toApiPayload,
  type ShipmentWizardInput,
  type ShipmentWizardValues,
} from "@/lib/validation/shipment-wizard";

// Schedule Shipment (2026-09-30 redesign). Same four steps and data as
// before, rebuilt after the owner's SFL hub screenshots in TYS's theme:
// the quote wizard's high-contrast "wells" (label inside a firm outline),
// a numbered progress bar you can click back through, Air/Ground/Ocean as
// tiles instead of a dropdown, SFL's "Do you need pickup?" with a date, a
// package type, running totals, and a terms tick before booking. Laid out
// in three columns so each step fits on a laptop screen without scrolling.

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({ value: code, label: name, flag: code }));

const wellBase =
  "block min-w-0 rounded-2xl bg-white px-4 pb-2 pt-2 text-left ring-inset transition focus-within:ring-2 focus-within:ring-brand";
const well = (invalid?: boolean) =>
  `${wellBase} ${invalid ? "ring-2 ring-red-500 bg-[#FFF7F7]" : "ring-[1.5px] ring-[#AEBBCD] hover:ring-[#7F8FA6]"}`;
const wellLabel = "block text-[13px] font-semibold text-[#2B3445]";
const bareInput =
  "mt-0.5 w-full min-w-0 bg-transparent py-0.5 text-[16px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-[#6B778A]";
const errorClass = "mt-1 px-1 text-[13px] font-medium text-red-700";

const STEPS = [
  { n: 1, label: "Route" },
  { n: 2, label: "Sender" },
  { n: 3, label: "Recipient" },
  { n: 4, label: "Packages" },
] as const;

const TYPE_TILES = [
  { value: "air", label: "Air", hint: "Fastest, most parcels", icon: AirplaneTiltIcon },
  { value: "ground", label: "Ground", hint: "Within North America", icon: TruckIcon },
  { value: "ocean", label: "Ocean", hint: "Big, heavy, best value", icon: BoatIcon },
] as const;

const PACKAGE_KINDS = [
  { value: "package", label: "Boxes / packages", icon: PackageIcon },
  { value: "document", label: "Documents", icon: EnvelopeSimpleIcon },
  { value: "pallet", label: "Pallet / freight", icon: StackIcon },
] as const;

export type SenderDefaults = {
  contact_name?: string;
  company_name?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone_1?: string;
  email?: string;
};

function emptyParty() {
  return {
    contact_name: "",
    company_name: "",
    address_line_1: "",
    address_line_2: "",
    address_line_3: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    phone_1: "",
    phone_2: "",
    email: "",
  };
}

function emptyPackageRow() {
  return { quantity: 1, weight: 0, length: 0, width: 0, height: 0, chargeable_weight: 0, insured_value: 0 };
}

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** A two-way choice drawn as joined buttons (pickup, location type). */
function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-[#EEF2F8] p-1 ring-1 ring-inset ring-[#DCE3EC]">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${
              on ? "bg-brand text-white shadow-[0_8px_16px_-10px_rgba(3,100,255,0.9)]" : "text-[#3A4353] hover:bg-white/70 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ShipmentWizardForm({
  linkedQuoteId,
  senderDefaults,
}: {
  linkedQuoteId?: number | null;
  /** From the customer's saved profile, so Sender is mostly filled in. */
  senderDefaults?: SenderDefaults;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ShipmentWizardInput, unknown, ShipmentWizardValues>({
    resolver: zodResolver(shipmentWizardSchema),
    mode: "onSubmit",
    defaultValues: {
      shipment_type: "air",
      from_country: "US",
      to_country: "",
      sender: { ...emptyParty(), ...stripEmpty(senderDefaults ?? {}), country: senderDefaults?.country || "US" },
      recipient: { ...emptyParty(), location_type: "residential" },
      packages: [emptyPackageRow()],
      package_type: "package",
      pickup_needed: false,
      pickup_date: null,
      special_instruction: "",
      agree_terms: false,
    },
  });
  const { control, register, setValue, getValues, trigger, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;
  const packages = useFieldArray({ control, name: "packages" });
  const watched = useWatch({ control });

  // Same fresh-render nudge the quote wizard uses so RHF's per-field
  // subscriptions repaint cleanly on step change.
  useEffect(() => {
    form.reset(form.getValues(), { keepValues: true, keepDirty: true, keepTouched: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Next and "Book shipment" sit in the same spot. The click that opens
  // step 4 can finish (mouseup) on the freshly-mounted Book button and
  // submit the form before the customer has seen it; the quote wizard hit
  // the same race. Clicks on Book within 500ms of a step change are ignored.
  const stepChangedAt = useRef(0);
  // Keep the card's top in view when a step changes on a short screen.
  const topRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    stepChangedAt.current = Date.now();
    if (first.current) {
      first.current = false;
      return;
    }
    const el = topRef.current;
    if (el && el.getBoundingClientRect().top < 70) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  async function next() {
    // Stamped BEFORE the async validation, not in an effect: the stray
    // mouseup can land between React committing step 4 and any effect
    // running (confirmed with a submit listener, 2026-09-30).
    stepChangedAt.current = Date.now();
    const fields = STEP_FIELDS[step as keyof typeof STEP_FIELDS] as unknown as Path<ShipmentWizardInput>[];
    if (!(await trigger(fields))) return;
    // Carry the chosen route into the addresses the first time through.
    if (step === 1) {
      if (!getValues("sender.country")) setValue("sender.country", getValues("from_country"));
      if (!getValues("recipient.country")) setValue("recipient.country", getValues("to_country"));
    }
    const n = Math.min(4, step + 1);
    stepChangedAt.current = Date.now();
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
  }

  function recalcRow(i: number) {
    const row = getValues(`packages.${i}`);
    const chargeable = calculateChargeableWeight(
      Number(row.weight) || 0,
      { length: Number(row.length) || 0, width: Number(row.width) || 0, height: Number(row.height) || 0 },
      "lb",
    );
    setValue(`packages.${i}.chargeable_weight`, Math.round(chargeable * 100) / 100);
  }

  async function onSubmit(values: ShipmentWizardValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/account/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(toApiPayload(values, linkedQuoteId)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.message || "Something went wrong. Please try again.");
        return;
      }
      router.push("/account/shipments?booked=1");
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  }

  const rows = watched.packages ?? [];
  type Totals = { pkgs: number; weight: number; chargeable: number; insured: number };
  const totals = rows.reduce<Totals>(
    (t, r) => {
      const q = Number(r?.quantity) || 0;
      return {
        pkgs: t.pkgs + q,
        weight: t.weight + (Number(r?.weight) || 0) * q,
        chargeable: t.chargeable + (Number(r?.chargeable_weight) || 0) * q,
        insured: t.insured + (Number(r?.insured_value) || 0),
      };
    },
    { pkgs: 0, weight: 0, chargeable: 0, insured: 0 },
  );
  const round = (n: number) => Math.round(n * 100) / 100;

  // A render function, NOT a component: a component defined inside this one
  // would be a new type every render and remount (losing focus) per keystroke.
  function renderParty(base: "sender" | "recipient") {
    const e = errors[base];
    const country = base === "sender" ? watched.sender?.country : watched.recipient?.country;
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 [&>*]:min-w-0">
        <div>
          <label className={well(!!e?.contact_name)}>
            <span className={wellLabel}>Contact name *</span>
            <input className={bareInput} autoComplete="name" placeholder="Full name" {...register(`${base}.contact_name`)} />
          </label>
          {e?.contact_name && <p className={errorClass}>{e.contact_name.message}</p>}
        </div>
        <div>
          <label className={well()}>
            <span className={wellLabel}>Company</span>
            <input className={bareInput} autoComplete="organization" placeholder="Optional" {...register(`${base}.company_name`)} />
          </label>
        </div>
        <div>
          <label className={well(!!e?.email)}>
            <span className={wellLabel}>Email</span>
            <input className={bareInput} type="email" inputMode="email" placeholder="name@example.com" {...register(`${base}.email`)} />
          </label>
          {e?.email && <p className={errorClass}>{e.email.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={well(!!e?.address_line_1)}>
            <span className={wellLabel}>Street address *</span>
            <input className={bareInput} autoComplete="address-line1" placeholder="House number and street" {...register(`${base}.address_line_1`)} />
          </label>
          {e?.address_line_1 && <p className={errorClass}>{e.address_line_1.message}</p>}
        </div>
        <div>
          <label className={well()}>
            <span className={wellLabel}>Apt, suite, floor</span>
            <input className={bareInput} autoComplete="address-line2" placeholder="Optional" {...register(`${base}.address_line_2`)} />
          </label>
        </div>
        <div>
          <div className={well(!!e?.country)} data-select-anchor>
            <span className={wellLabel}>Country *</span>
            <Controller
              control={control}
              name={`${base}.country`}
              render={({ field }) => (
                <SearchableSelect options={COUNTRY_OPTIONS} value={field.value} onChange={field.onChange} label="Country" placeholder="Select country" invalid={!!e?.country} bare />
              )}
            />
          </div>
          {e?.country && <p className={errorClass}>{e.country.message}</p>}
        </div>
        <div>
          <div className={well(!!e?.postal_code)}>
            <span className={wellLabel}>Zip / postal code *</span>
            <Controller
              control={control}
              name={`${base}.postal_code`}
              render={({ field }) => (
                <PostalCodeInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} countryCode={country} placeholder="Zip code" invalid={!!e?.postal_code} bare />
              )}
            />
          </div>
          {e?.postal_code && <p className={errorClass}>{e.postal_code.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2.5 [&>*]:min-w-0">
          <div>
            <label className={well(!!e?.city)}>
              <span className={wellLabel}>City *</span>
              <input className={bareInput} autoComplete="address-level2" {...register(`${base}.city`)} />
            </label>
            {e?.city && <p className={errorClass}>{e.city.message}</p>}
          </div>
          <div>
            <label className={well(!!e?.state)}>
              <span className={wellLabel}>State *</span>
              <input className={bareInput} autoComplete="address-level1" {...register(`${base}.state`)} />
            </label>
            {e?.state && <p className={errorClass}>{e.state.message}</p>}
          </div>
        </div>
        <div>
          <label className={well(!!e?.phone_1)}>
            <span className={wellLabel}>Phone *</span>
            <input className={bareInput} type="tel" inputMode="tel" autoComplete="tel" placeholder="+1 404 555 0100" {...register(`${base}.phone_1`)} />
          </label>
          {e?.phone_1 && <p className={errorClass}>{e.phone_1.message}</p>}
        </div>
        <div>
          <label className={well()}>
            <span className={wellLabel}>Second phone</span>
            <input className={bareInput} type="tel" inputMode="tel" placeholder="Optional" {...register(`${base}.phone_2`)} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* Progress: numbered bars; finished steps are clickable. */}
      <ol className="mb-5 grid grid-cols-4 gap-2">
        {STEPS.map((s) => {
          const done = s.n < step;
          const current = s.n === step;
          const reachable = s.n <= maxStep && !current;
          return (
            <li key={s.n}>
              <button type="button" disabled={!reachable} onClick={() => setStep(s.n)} className="group w-full text-left disabled:cursor-default">
                <span className="block h-1.5 overflow-hidden rounded-full bg-[#DCE3EC]">
                  <span className={`block h-full rounded-full bg-brand transition-[width] duration-500 ${done || current ? "w-full" : "w-0"}`} />
                </span>
                <span className="mt-2 flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                      done ? "bg-brand text-white" : current ? "bg-[#0B1220] text-white" : "bg-[#DCE3EC] text-[#4A5568]"
                    }`}
                  >
                    {done ? <CheckIcon size={12} weight="bold" /> : s.n}
                  </span>
                  <span className={`truncate text-[14px] font-semibold ${current ? "text-ink" : done ? "text-brand group-hover:underline" : "text-[#6B778A]"}`}>
                    {s.label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={(e) => {
          // Only the final step books; Enter in a field on steps 1-3 just
          // moves on instead of submitting half a form.
          if (step < 4 || Date.now() - stepChangedAt.current < 500) {
            e.preventDefault();
            if (step < 4) void next();
            return;
          }
          void handleSubmit(onSubmit)(e);
        }}
        noValidate
      >
        <div key={step} className="step-in">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 px-1 text-[15px] font-semibold text-[#2B3445]">How should it travel?</p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {TYPE_TILES.map((t) => {
                    const on = watched.shipment_type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setValue("shipment_type", t.value, { shouldValidate: true })}
                        className={`relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-inset transition ${
                          on ? "bg-[#E8F0FF] ring-[2.5px] ring-brand shadow-[0_10px_24px_-14px_rgba(3,100,255,0.7)]" : "bg-white ring-[1.5px] ring-[#AEBBCD] hover:ring-[#7F8FA6]"
                        }`}
                      >
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${on ? "bg-brand text-white" : "bg-[#EEF2F8] text-ink"}`}>
                          <t.icon size={22} />
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-[16px] font-bold ${on ? "text-brand" : "text-ink"}`}>{t.label}</span>
                          <span className="block text-[13px] text-[#4A5568]">{t.hint}</span>
                        </span>
                        {on && (
                          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                            <CheckIcon size={11} weight="bold" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.shipment_type && <p className={errorClass}>{errors.shipment_type.message}</p>}
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 [&>*]:min-w-0">
                <div>
                  <div className={well(!!errors.from_country)} data-select-anchor>
                    <span className={wellLabel}>Shipping from</span>
                    <Controller
                      control={control}
                      name="from_country"
                      render={({ field }) => (
                        <SearchableSelect options={COUNTRY_OPTIONS} value={field.value} onChange={field.onChange} label="Shipping from" placeholder="Select country" invalid={!!errors.from_country} bare />
                      )}
                    />
                  </div>
                  {errors.from_country && <p className={errorClass}>{errors.from_country.message}</p>}
                </div>
                <div>
                  <div className={well(!!errors.to_country)} data-select-anchor>
                    <span className={wellLabel}>Shipping to</span>
                    <Controller
                      control={control}
                      name="to_country"
                      render={({ field }) => (
                        <SearchableSelect options={COUNTRY_OPTIONS} value={field.value} onChange={field.onChange} label="Shipping to" placeholder="Where is it going?" invalid={!!errors.to_country} bare />
                      )}
                    />
                  </div>
                  {errors.to_country && <p className={errorClass}>{errors.to_country.message}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              {renderParty("sender")}
              <div className="grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <p className="mb-1.5 px-1 text-[13px] font-semibold text-[#2B3445]">Do you need a pickup?</p>
                  <Segmented
                    value={watched.pickup_needed ? "yes" : "no"}
                    onChange={(v) => {
                      setValue("pickup_needed", v === "yes");
                      if (v === "yes" && !getValues("pickup_date")) setValue("pickup_date", tomorrowIso());
                    }}
                    options={[
                      { value: "no", label: "No, I'll drop it off" },
                      { value: "yes", label: "Yes, pick it up from me" },
                    ]}
                  />
                </div>
                {watched.pickup_needed && (
                  <div>
                    <label className={well(!!errors.pickup_date)}>
                      <span className={wellLabel}>Pickup date *</span>
                      <input className={bareInput} type="date" min={tomorrowIso()} {...register("pickup_date")} />
                    </label>
                    {errors.pickup_date && <p className={errorClass}>{errors.pickup_date.message}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              {renderParty("recipient")}
              <div className="sm:w-[360px]">
                <p className="mb-1.5 px-1 text-[13px] font-semibold text-[#2B3445]">Delivering to a</p>
                <Controller
                  control={control}
                  name="recipient.location_type"
                  render={({ field }) => (
                    <Segmented
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "residential", label: "Home" },
                        { value: "commercial", label: "Business" },
                      ]}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 px-1 text-[13px] font-semibold text-[#2B3445]">What are you sending?</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {PACKAGE_KINDS.map((k) => {
                    const on = watched.package_type === k.value;
                    return (
                      <button
                        key={k.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setValue("package_type", k.value)}
                        className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-[14.5px] font-semibold ring-inset transition ${
                          on ? "bg-[#E8F0FF] text-brand ring-[2px] ring-brand" : "bg-white text-ink ring-[1.5px] ring-[#AEBBCD] hover:ring-[#7F8FA6]"
                        }`}
                      >
                        <k.icon size={20} />
                        {k.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl ring-[1.5px] ring-inset ring-[#DCE3EC]">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-[#0B1220] text-[12.5px] font-semibold uppercase tracking-wide text-white/85">
                    <tr>
                      <th className="px-3 py-2.5">Qty</th>
                      <th className="px-3 py-2.5">Weight (lb)</th>
                      <th className="px-3 py-2.5">Size L × W × H (in)</th>
                      <th className="px-3 py-2.5">Chargeable (lb)</th>
                      <th className="px-3 py-2.5">Insured value ($)</th>
                      <th className="px-3 py-2.5">
                        <span className="sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.fields.map((field, i) => {
                      const rowErr = errors.packages?.[i];
                      const cell = (invalid?: boolean) =>
                        `w-full rounded-xl bg-white px-3 py-2 text-[15px] font-medium text-ink outline-none ring-inset transition focus:ring-2 focus:ring-brand ${
                          invalid ? "ring-2 ring-red-500" : "ring-[1.5px] ring-[#AEBBCD]"
                        }`;
                      return (
                        <tr key={field.id} className="border-t border-[#E6EBF2] align-top">
                          <td className="w-[90px] px-3 py-2.5">
                            <input type="number" min={1} aria-label="Quantity" className={cell(!!rowErr?.quantity)} {...register(`packages.${i}.quantity`, { valueAsNumber: true })} />
                          </td>
                          <td className="w-[130px] px-3 py-2.5">
                            <input type="number" step="0.01" min={0} aria-label="Weight" className={cell(!!rowErr?.weight)} {...register(`packages.${i}.weight`, { valueAsNumber: true, onChange: () => recalcRow(i) })} />
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              {(["length", "width", "height"] as const).map((dim, k) => (
                                <span key={dim} className="flex items-center gap-1.5">
                                  {k > 0 && <span className="text-[#6B778A]">×</span>}
                                  <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder={dim[0].toUpperCase()}
                                    aria-label={dim}
                                    className={`${cell(!!rowErr?.[dim])} w-[70px]`}
                                    {...register(`packages.${i}.${dim}`, { valueAsNumber: true, onChange: () => recalcRow(i) })}
                                  />
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="w-[130px] px-3 py-2.5">
                            <div className="rounded-xl bg-[#EEF2F8] px-3 py-2 text-[15px] font-semibold text-ink">{Number(watched.packages?.[i]?.chargeable_weight) || 0}</div>
                          </td>
                          <td className="w-[140px] px-3 py-2.5">
                            <input type="number" step="0.01" min={0} aria-label="Insured value" className={cell()} {...register(`packages.${i}.insured_value`, { valueAsNumber: true })} />
                          </td>
                          <td className="w-[48px] px-2 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => packages.remove(i)}
                              disabled={packages.fields.length === 1}
                              aria-label="Remove this row"
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-30"
                            >
                              <TrashIcon size={17} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {errors.packages?.message && <p className={errorClass}>{errors.packages.message}</p>}
              {Array.isArray(errors.packages) && errors.packages.some((r) => r?.weight) && (
                <p className={errorClass}>Every row needs a weight greater than 0.</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => packages.append(emptyPackageRow())}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-semibold text-brand ring-[1.5px] ring-inset ring-[#C9D6EE] transition hover:bg-[#F2F6FE]"
                >
                  <PlusIcon size={15} weight="bold" /> Add another row
                </button>
                <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-2xl bg-[#EEF2F8] px-4 py-2.5 text-[14px] tabular-nums text-[#2B3445]">
                  <span>
                    <CubeIcon size={15} className="-mt-0.5 mr-1 inline text-brand" />
                    <strong>{totals.pkgs}</strong> pkgs
                  </span>
                  <span>
                    Weight <strong>{round(totals.weight)}</strong> lb
                  </span>
                  <span>
                    Chargeable <strong>{round(totals.chargeable)}</strong> lb
                  </span>
                  <span>
                    Insured <strong>${round(totals.insured)}</strong>
                  </span>
                </div>
              </div>

              <label className={well(!!errors.special_instruction)}>
                <span className={wellLabel}>Anything we should know?</span>
                <textarea rows={2} className={`${bareInput} resize-none`} placeholder="Gate code, fragile items, best time to call (optional)" {...register("special_instruction")} />
              </label>

              <div>
                <label className="flex cursor-pointer items-start gap-3 px-1">
                  <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0364FF]" {...register("agree_terms")} />
                  <span className="text-[14.5px] leading-snug text-[#2B3445]">
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" className="font-semibold text-brand underline-offset-2 hover:underline">
                      Terms and Conditions
                    </Link>{" "}
                    and confirm nothing in this shipment is prohibited.
                  </span>
                </label>
                {errors.agree_terms && <p className={errorClass}>{errors.agree_terms.message}</p>}
              </div>
            </div>
          )}
        </div>

        {submitError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-[14px] font-medium text-red-700">{submitError}</p>}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E6EBF2] pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-semibold text-ink ring-[1.5px] ring-inset ring-[#AEBBCD] transition hover:bg-[#F5F8FC]"
            >
              <ArrowLeftIcon size={15} /> Back
            </button>
          ) : (
            <span className="text-[13.5px] text-[#4A5568]">Step {step} of 4</span>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(3,100,255,0.8)] transition hover:bg-brand-dark"
            >
              Next <ArrowRightIcon size={15} />
            </button>
          ) : (
            <button
              type="submit"
              onClick={(e) => {
                if (Date.now() - stepChangedAt.current < 500) e.preventDefault();
              }}
              disabled={isSubmitting}
              className="flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(3,100,255,0.8)] transition hover:bg-brand-dark disabled:opacity-60"
            >
              {isSubmitting ? "Booking…" : "Book shipment"} <ArrowRightIcon size={15} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function stripEmpty<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== "")) as Partial<T>;
}
