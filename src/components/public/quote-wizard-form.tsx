"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type Path,
  type UseFormRegister,
  type UseFormWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CarSimpleIcon,
  CheckIcon,
  CouchIcon,
  EnvelopeSimpleIcon,
  HeadsetIcon,
  InfoIcon,
  MapPinIcon,
  MinusCircleIcon,
  PackageIcon,
  PlusCircleIcon,
  TelevisionIcon,
} from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { DIAL_CODES } from "@/lib/dial-codes";
import { flagEmoji } from "@/lib/flag-emoji";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { SearchableSelect } from "@/components/public/searchable-select";
import {
  PACKAGE_TYPES,
  quoteWizardSchema,
  skipDetailsStep,
  toApiPayload,
  type QuoteWizardInput,
  type QuoteWizardValues,
} from "@/lib/validation/quote-wizard";

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({
  value: code,
  label: name,
  flag: flagEmoji(code),
}));

// Keyed by ISO code, not dial code: NANP (US/CA/Caribbean, all "+1") and
// Russia/Kazakhstan (both "+7") share a dial code, so the dial code alone
// isn't a unique option value — see the dedicated countryCodeIso state below.
const DIAL_CODE_OPTIONS = DIAL_CODES.map(([code, dial, name]) => ({
  value: code,
  label: `${name} (${dial})`,
  flag: flagEmoji(code),
}));
const DIAL_BY_ISO = new Map(DIAL_CODES.map(([code, dial]) => [code, dial]));

const STEPS = [
  { n: 1, label: "Location", icon: MapPinIcon },
  { n: 2, label: "Select Package", icon: PackageIcon },
  { n: 3, label: "Package Details", icon: PackageIcon },
  { n: 4, label: "Contact Information", icon: HeadsetIcon },
] as const;

const PACKAGE_CARD_ICON: Record<string, typeof PackageIcon> = {
  envelope: EnvelopeSimpleIcon,
  boxes: PackageIcon,
  television: TelevisionIcon,
  furniture: CouchIcon,
  auto: CarSimpleIcon,
};

const inputClass =
  "w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand disabled:bg-brand-pale disabled:text-ink-muted";
// Larger variant for the Step 1 "Sending From / Sending To" location fields
// only — the rest of the wizard's inputs (contact info, box/tv/auto detail
// rows) keep the compact `inputClass` size.
const locationInputClass =
  "w-full rounded-full border border-brand-light bg-white px-4 py-4 text-base text-ink outline-none focus:border-brand";
const labelClass = "block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-red-600";

type Rate = {
  service_type: string;
  service_name: string;
  currency: string;
  save_percent: number | null;
  estimated_delivery: string;
  total_charge: number;
  retail_charge: number | null;
};

type SubmitResult = {
  message: string;
  quote_id: number;
  show_fedex_rates: boolean;
  summary?: { package_label: string; weight_lb: number; route: string };
  rates?: Rate[];
  rates_error?: string | null;
};

export function QuoteWizardForm({
  defaultFromCountry,
  defaultToCountry,
}: {
  defaultFromCountry?: string;
  defaultToCountry?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [skippedStep3, setSkippedStep3] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  // Tracks which country's flag/name the phone-code dropdown displays. The
  // form field itself only stores the dial string (e.g. "+1"), which isn't
  // unique enough to know whether that means the US, Canada, or a Caribbean
  // nation — this local state is the real selection; the dial code is
  // derived from it on change.
  const [countryCodeIso, setCountryCodeIso] = useState("US");

  // Input/output split: the box/tv rows use z.coerce.number() (shared with
  // the server schema), so RHF's field values (pre-coercion, TQuoteWizardInput)
  // differ from what zodResolver hands to onSubmit post-coercion
  // (QuoteWizardValues). See quote-wizard.ts.
  const form = useForm<QuoteWizardInput, unknown, QuoteWizardValues>({
    resolver: zodResolver(quoteWizardSchema),
    mode: "onSubmit",
    defaultValues: {
      from_country: defaultFromCountry || "US",
      from_zip: "",
      to_country: defaultToCountry || "",
      to_zip: "",
      is_residence: true,
      package_types: [],
      box_details: [],
      television_details: [],
      auto_details: [],
      contact: { name: "", email: "", country_code: "+1", phone: "" },
    },
  });
  const { control, register, watch, setValue, trigger, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const boxes = useFieldArray({ control, name: "box_details" });
  const tvs = useFieldArray({ control, name: "television_details" });
  const autos = useFieldArray({ control, name: "auto_details" });
  const packageTypes = watch("package_types");

  async function next() {
    const fieldsByStep: Record<number, Path<QuoteWizardInput>[]> = {
      1: ["from_country", "from_zip", "to_country", "to_zip", "is_residence"],
      2: ["package_types"],
      3: ["box_details", "television_details", "auto_details"],
    };
    const valid = await trigger(fieldsByStep[step]);
    if (!valid) return;

    if (step === 2) {
      const skip = skipDetailsStep(packageTypes);
      setSkippedStep3(skip);
      if (skip) {
        setStep(4);
        return;
      }
      // Seed exactly one row per selected detail type so the step isn't empty.
      if (packageTypes.includes("boxes") && boxes.fields.length === 0) {
        boxes.append({ quantity: 1, weight: 0, weight_unit: "lb", length: 0, width: 0, height: 0, chargeable_weight: 0 });
      }
      if (packageTypes.includes("television") && tvs.fields.length === 0) {
        tvs.append({ brand_name: "", tv_model: "", weight: 0, weight_unit: "lb", length: 0, width: 0, height: 0, chargeable_weight: 0 });
      }
      if (packageTypes.includes("auto") && autos.fields.length === 0) {
        autos.append({ brand_name: "", car_model: "", car_year: "" });
      }
      setStep(3);
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }

  function back() {
    if (step === 4 && skippedStep3) {
      setStep(2);
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  function togglePackageType(value: string) {
    // Reads the live value (not the `packageTypes` watch() snapshot from the
    // last render) so rapid clicks each see the previous click's result
    // instead of racing on a stale closure.
    const current = form.getValues("package_types");
    const next = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value];
    setValue("package_types", next, { shouldValidate: false });
  }

  function recalcRow(kind: "box_details" | "television_details", index: number) {
    // Reads the live row values via getValues() rather than the row
    // component's watch() snapshot — RHF's internal store updates
    // synchronously ahead of this callback, but a watch()-derived closure
    // only reflects the last completed render, which lags under rapid
    // programmatic field changes (and is one render behind even for a
    // single keystroke, since the value that just changed triggered this
    // very callback).
    const row = form.getValues(`${kind}.${index}`);
    const chargeable = calculateChargeableWeight(
      Number(row.weight) || 0,
      { length: Number(row.length) || 0, width: Number(row.width) || 0, height: Number(row.height) || 0 },
      row.weight_unit,
    );
    setValue(`${kind}.${index}.chargeable_weight`, Math.round(chargeable * 100) / 100);
  }

  async function onSubmit(values: QuoteWizardValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(toApiPayload(values)),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          for (const [field, messages] of Object.entries(data.errors as Record<string, string[]>)) {
            const path = field === "package_type" ? "package_types" : field;
            form.setError(path as Path<QuoteWizardInput>, { type: "server", message: messages[0] });
          }
          setSubmitError("Please fix the highlighted fields and try again.");
        } else {
          setSubmitError(data.message || "Something went wrong. Please try again.");
        }
        return;
      }
      if (data.show_fedex_rates) {
        setResult(data as SubmitResult);
      } else {
        router.push(`/thank-you?name=${encodeURIComponent(values.contact.name)}`);
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  }

  if (result?.show_fedex_rates) {
    return <RatesResult result={result} />;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className={`flex items-center gap-3 rounded-2xl border-b-2 bg-white p-4 shadow-sm md:p-5 ${step === s.n ? "border-brand" : "border-transparent"}`}
          >
            {s.n === 3 ? (
              <span className="relative inline-flex shrink-0">
                <s.icon size={28} className={step >= s.n ? "text-brand" : "text-ink-muted"} />
                <InfoIcon
                  size={14}
                  weight="fill"
                  className={`absolute -bottom-0.5 -left-0.5 rounded-full bg-white ${step >= s.n ? "text-brand" : "text-ink-muted"}`}
                />
              </span>
            ) : (
              <s.icon size={28} className={`shrink-0 ${step >= s.n ? "text-brand" : "text-ink-muted"}`} />
            )}
            <div>
              <div className="text-xs text-ink-muted">Step {s.n}</div>
              <div className="text-sm font-semibold text-ink md:text-base">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8">
        {step === 1 && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Sending From</label>
              <div className="mt-1.5">
                <Controller
                  control={control}
                  name="from_country"
                  render={({ field }) => (
                    <SearchableSelect
                      options={COUNTRY_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Country"
                      invalid={!!errors.from_country}
                      large
                      pill
                    />
                  )}
                />
              </div>
              {errors.from_country && <p className={errorClass}>{errors.from_country.message}</p>}
            </div>
            <div>
              <label className={labelClass}>From Zip Code</label>
              <div className="relative mt-1.5">
                <MapPinIcon
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  className={`${locationInputClass} pl-11`}
                  placeholder="From Zip Code"
                  {...register("from_zip")}
                />
              </div>
              {errors.from_zip && <p className={errorClass}>{errors.from_zip.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Sending To</label>
              <div className="mt-1.5">
                <Controller
                  control={control}
                  name="to_country"
                  render={({ field }) => (
                    <SearchableSelect
                      options={COUNTRY_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sending To"
                      invalid={!!errors.to_country}
                      large
                      pill
                      placeholderIcon
                    />
                  )}
                />
              </div>
              {errors.to_country && <p className={errorClass}>{errors.to_country.message}</p>}
            </div>
            <div>
              <label className={labelClass}>To Zip Code</label>
              <div className="relative mt-1.5">
                <MapPinIcon
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
                />
                <input
                  className={`${locationInputClass} pl-11`}
                  placeholder="To Zip Code"
                  {...register("to_zip")}
                />
              </div>
              {errors.to_zip && <p className={errorClass}>{errors.to_zip.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-brand-light text-brand focus:ring-brand"
                  checked={watch("is_residence") === true}
                  onChange={(e) => setValue("is_residence", e.target.checked)}
                />
                I&rsquo;m shipping to a residence
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {PACKAGE_TYPES.map((pt) => {
                const Icon = PACKAGE_CARD_ICON[pt.value];
                const selected = packageTypes.includes(pt.value);
                return (
                  <button
                    type="button"
                    key={pt.value}
                    onClick={() => togglePackageType(pt.value)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center transition ${
                      selected ? "border-brand bg-brand-pale" : "border-brand-light bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${selected ? "bg-brand text-white" : "bg-brand-pale text-brand"}`}
                    >
                      <Icon size={22} />
                    </span>
                    <span className="text-sm font-medium text-ink">{pt.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.package_types && <p className={errorClass}>{errors.package_types.message}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            {packageTypes.includes("boxes") && (
              <DetailSection title="Box Details" icon={PackageIcon}>
                {boxes.fields.map((f, i) => (
                  <BoxRow key={f.id} control={control} register={register} errors={errors} index={i} onRemove={() => boxes.remove(i)} onRecalc={recalcRow} watch={watch} />
                ))}
                <AddRowButton
                  onClick={() =>
                    boxes.append({ quantity: 1, weight: 0, weight_unit: "lb", length: 0, width: 0, height: 0, chargeable_weight: 0 })
                  }
                  label="Add Box"
                />
              </DetailSection>
            )}
            {packageTypes.includes("television") && (
              <DetailSection title="Television" icon={TelevisionIcon}>
                {tvs.fields.map((f, i) => (
                  <TvRow key={f.id} control={control} register={register} errors={errors} index={i} onRemove={() => tvs.remove(i)} onRecalc={recalcRow} watch={watch} />
                ))}
                <AddRowButton
                  onClick={() =>
                    tvs.append({ brand_name: "", tv_model: "", weight: 0, weight_unit: "lb", length: 0, width: 0, height: 0, chargeable_weight: 0 })
                  }
                  label="Add Television"
                />
              </DetailSection>
            )}
            {packageTypes.includes("auto") && (
              <DetailSection title="Auto" icon={CarSimpleIcon}>
                {autos.fields.map((f, i) => (
                  <AutoRow key={f.id} register={register} errors={errors} index={i} onRemove={() => autos.remove(i)} />
                ))}
                <AddRowButton onClick={() => autos.append({ brand_name: "", car_model: "", car_year: "" })} label="Add Vehicle" />
              </DetailSection>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input className={`mt-1.5 ${inputClass}`} placeholder="Enter name" {...register("contact.name")} />
              {errors.contact?.name && <p className={errorClass}>{errors.contact.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input className={`mt-1.5 ${inputClass}`} placeholder="Enter Email" {...register("contact.email")} />
              {errors.contact?.email && <p className={errorClass}>{errors.contact.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Country Code</label>
              <div className="mt-1.5">
                <Controller
                  control={control}
                  name="contact.country_code"
                  render={({ field }) => (
                    <SearchableSelect
                      options={DIAL_CODE_OPTIONS}
                      value={countryCodeIso}
                      onChange={(iso) => {
                        setCountryCodeIso(iso);
                        field.onChange(DIAL_BY_ISO.get(iso) ?? "");
                      }}
                      placeholder="Select Country Code"
                      invalid={!!errors.contact?.country_code}
                    />
                  )}
                />
              </div>
              {errors.contact?.country_code && <p className={errorClass}>{errors.contact.country_code.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input className={`mt-1.5 ${inputClass}`} placeholder="Enter Phone Number" {...register("contact.phone")} />
              {errors.contact?.phone && <p className={errorClass}>{errors.contact.phone.message}</p>}
            </div>
          </div>
        )}

        {submitError && <p className={`${errorClass} mt-4`}>{submitError}</p>}

        <div className="mt-10 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1.5 rounded-full border border-brand-light bg-white px-6 py-3 text-sm font-semibold text-ink"
            >
              <ArrowLeftIcon size={14} /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Next <ArrowRightIcon size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Submit"} <ArrowRightIcon size={14} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof PackageIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-brand-light p-6">
      <div className="flex items-center gap-2 text-ink">
        <Icon size={20} className="text-brand" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function AddRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-semibold text-brand"
    >
      <PlusCircleIcon size={18} /> {label}
    </button>
  );
}

type FormBag = {
  control: Control<QuoteWizardInput>;
  register: UseFormRegister<QuoteWizardInput>;
  errors: FieldErrors<QuoteWizardInput>;
  watch: UseFormWatch<QuoteWizardInput>;
  onRecalc: (kind: "box_details" | "television_details", index: number) => void;
};

function BoxRow({
  index,
  onRemove,
  onRecalc,
  register,
  errors,
  watch,
}: FormBag & { index: number; onRemove: () => void }) {
  const base = `box_details.${index}` as const;
  const chargeable = watch(`${base}.chargeable_weight`);
  const rowErrors = errors.box_details?.[index];

  function recalc() {
    onRecalc("box_details", index);
  }

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-brand-light p-4 md:grid-cols-6">
      <Field label="No. of Boxes">
        <input type="number" min={1} className={inputClass} {...register(`${base}.quantity`, { valueAsNumber: true })} />
        {rowErrors?.quantity && <p className={errorClass}>{rowErrors.quantity.message}</p>}
      </Field>
      <Field label="Weight">
        <div className="flex gap-1">
          <input
            type="number"
            step="0.01"
            className={inputClass}
            {...register(`${base}.weight`, { valueAsNumber: true, onChange: recalc })}
          />
          <select className={`${inputClass} w-20`} {...register(`${base}.weight_unit`, { onChange: recalc })}>
            <option value="lb">LB</option>
            <option value="kg">KG</option>
          </select>
        </div>
        {rowErrors?.weight && <p className={errorClass}>{rowErrors.weight.message}</p>}
      </Field>
      <Field label="L">
        <input type="number" step="0.01" className={inputClass} {...register(`${base}.length`, { valueAsNumber: true, onChange: recalc })} />
      </Field>
      <Field label="W">
        <input type="number" step="0.01" className={inputClass} {...register(`${base}.width`, { valueAsNumber: true, onChange: recalc })} />
      </Field>
      <Field label="H">
        <input type="number" step="0.01" className={inputClass} {...register(`${base}.height`, { valueAsNumber: true, onChange: recalc })} />
      </Field>
      <Field label="Chargeable Weight">
        <div className="flex items-center gap-2">
          <input disabled className={inputClass} value={Number(chargeable) || 0} readOnly />
          <button type="button" onClick={onRemove} aria-label="Remove box">
            <MinusCircleIcon size={20} className="text-red-500" />
          </button>
        </div>
      </Field>
    </div>
  );
}

function TvRow({
  index,
  onRemove,
  onRecalc,
  register,
  errors,
  watch,
}: FormBag & { index: number; onRemove: () => void }) {
  const base = `television_details.${index}` as const;
  const chargeable = watch(`${base}.chargeable_weight`);
  const rowErrors = errors.television_details?.[index];

  function recalc() {
    onRecalc("television_details", index);
  }

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-brand-light p-4 md:grid-cols-6">
      <Field label="Brand Name">
        <input className={inputClass} placeholder="Brand Name" {...register(`${base}.brand_name`)} />
        {rowErrors?.brand_name && <p className={errorClass}>{rowErrors.brand_name.message}</p>}
      </Field>
      <Field label="Model">
        <input className={inputClass} placeholder="Model" {...register(`${base}.tv_model`)} />
        {rowErrors?.tv_model && <p className={errorClass}>{rowErrors.tv_model.message}</p>}
      </Field>
      <Field label="Weight">
        <div className="flex gap-1">
          <input
            type="number"
            step="0.01"
            className={inputClass}
            {...register(`${base}.weight`, { valueAsNumber: true, onChange: recalc })}
          />
          <select className={`${inputClass} w-20`} {...register(`${base}.weight_unit`, { onChange: recalc })}>
            <option value="lb">LB</option>
            <option value="kg">KG</option>
          </select>
        </div>
      </Field>
      <Field label="Dimensions">
        <div className="flex gap-1">
          <input type="number" step="0.01" className={inputClass} placeholder="L" {...register(`${base}.length`, { valueAsNumber: true, onChange: recalc })} />
          <input type="number" step="0.01" className={inputClass} placeholder="W" {...register(`${base}.width`, { valueAsNumber: true, onChange: recalc })} />
          <input type="number" step="0.01" className={inputClass} placeholder="H" {...register(`${base}.height`, { valueAsNumber: true, onChange: recalc })} />
        </div>
      </Field>
      <Field label="Chargeable Weight">
        <input disabled className={inputClass} value={Number(chargeable) || 0} readOnly />
      </Field>
      <div className="flex items-end justify-end">
        <button type="button" onClick={onRemove} aria-label="Remove television">
          <MinusCircleIcon size={20} className="text-red-500" />
        </button>
      </div>
    </div>
  );
}

function AutoRow({
  index,
  onRemove,
  register,
  errors,
}: {
  index: number;
  onRemove: () => void;
  register: UseFormRegister<QuoteWizardInput>;
  errors: FieldErrors<QuoteWizardInput>;
}) {
  const base = `auto_details.${index}` as const;
  const rowErrors = errors.auto_details?.[index];
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-brand-light p-4 md:grid-cols-4">
      <Field label="Brand Name">
        <input className={inputClass} placeholder="Car Name" {...register(`${base}.brand_name`)} />
        {rowErrors?.brand_name && <p className={errorClass}>{rowErrors.brand_name.message}</p>}
      </Field>
      <Field label="Car Model">
        <input className={inputClass} placeholder="Car Model" {...register(`${base}.car_model`)} />
        {rowErrors?.car_model && <p className={errorClass}>{rowErrors.car_model.message}</p>}
      </Field>
      <Field label="Car Year">
        <input className={inputClass} placeholder="YYYY" maxLength={4} {...register(`${base}.car_year`)} />
        {rowErrors?.car_year && <p className={errorClass}>{rowErrors.car_year.message}</p>}
      </Field>
      <div className="flex items-end justify-end">
        <button type="button" onClick={onRemove} aria-label="Remove vehicle">
          <MinusCircleIcon size={20} className="text-red-500" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-muted">{label}</label>
      {children}
    </div>
  );
}

function RatesResult({ result }: { result: SubmitResult }) {
  return (
    <div>
      <div className="rounded-2xl bg-brand-pale p-6">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckIcon size={18} weight="bold" />
          <span className="text-sm font-semibold">{result.message}</span>
        </div>
        {result.summary && (
          <p className="mt-2 text-sm text-ink-muted">
            {result.summary.route} · {result.summary.package_label} · {result.summary.weight_lb} lb
          </p>
        )}
      </div>

      {result.rates_error && <p className="mt-4 text-sm text-red-600">{result.rates_error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(result.rates ?? []).map((rate) => (
          <div key={rate.service_type} className="rounded-2xl border border-brand-light p-6">
            <div className="text-sm font-semibold text-ink">{rate.service_name}</div>
            <div className="mt-1 text-xs text-ink-muted">{rate.estimated_delivery}</div>
            <div className="mt-4 flex items-baseline gap-2">
              {rate.retail_charge && rate.retail_charge > rate.total_charge && (
                <span className="text-sm text-ink-muted line-through">
                  {rate.currency} {rate.retail_charge.toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-extrabold text-ink">
                {rate.currency} {rate.total_charge.toFixed(2)}
              </span>
            </div>
            {rate.save_percent != null && rate.save_percent > 0 && (
              <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Save {rate.save_percent}%
              </span>
            )}
            <button
              type="button"
              className="mt-4 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
