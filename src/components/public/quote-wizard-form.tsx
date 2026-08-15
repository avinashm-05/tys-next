"use client";

import { useEffect, useRef, useState } from "react";
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
  PhoneCallIcon,
  PlusCircleIcon,
  TelevisionIcon,
} from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { DIAL_CODES } from "@/lib/dial-codes";
import { flagEmoji } from "@/lib/flag-emoji";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { SearchableSelect } from "@/components/public/searchable-select";
import { PostalCodeInput } from "@/components/public/postal-code-input";
import {
  PACKAGE_TYPES,
  quoteWizardSchema,
  skipDetailsStep,
  toApiPayload,
  type QuoteWizardInput,
  type QuoteWizardValues,
} from "@/lib/validation/quote-wizard";
import { TIME_SLOTS } from "@/lib/validation/quote-store";
import { detectTimezone, getTimezoneOptions, timezoneForCountry } from "@/lib/timezones";

const TIMEZONE_OPTIONS = getTimezoneOptions();

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

// Temporarily off: land every submission on the simple Thank You page
// instead of the inline live-FedEx-rates results screen, even for the
// domestic quotes the server flags with show_fedex_rates. Flip back to true
// to restore it.
const SHOW_LIVE_RATES_RESULT = false;

// Same support channels used site-wide (site-header.tsx, contact-us/support).
const SUPPORT_PHONE_DISPLAY = "+1 (404) 793-8759";
const SUPPORT_PHONE_TEL = "tel:+14047938759";
const SUPPORT_EMAIL = "sales@tysgloballogistics.com";

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

// The colored band + curve used to live as static markup in page.tsx, but the
// title needs to change once results are showing (and show what the customer
// actually submitted, not the generic pitch) — that state only exists inside
// this client component, so the hero moved in here with it.
function QuoteHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-brand-light px-4 pb-20 pt-6 md:px-8 md:pb-28 md:pt-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold text-ink md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-ink-muted">{subtitle}</p>}
      </div>
      <svg
        aria-hidden
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-16 w-full text-white md:h-24"
      >
        <path d="M0,70 Q720,-30 1440,70 L1440,100 L0,100 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

export function QuoteWizardForm({
  defaultFromCountry,
  defaultToCountry,
}: {
  defaultFromCountry?: string;
  defaultToCountry?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  // Guards against a real race: the Next (type="button") and Submit
  // (type="submit") controls share the exact same slot, swapping based on
  // `step`. Next's own handler is async (it awaits trigger() before calling
  // setStep()), so the re-render that mounts Submit in Next's place can land
  // *after* the browser has already begun a click gesture — mousedown on
  // Next, then mouseup landing on the freshly-mounted Submit sitting at the
  // same coordinates, since click targeting resolves from mouseup. That
  // silently fires a real form submission before the user ever sees the
  // Contact step, which is what produced "errors show before I've touched
  // anything" — confirmed by reproducing it only with real, timed clicks,
  // never with an instant synthetic .click(). A brief pointer-events-none
  // window on the button row closes that gap. It's set in the same render
  // that changes `step` (React's documented "adjust state during render"
  // pattern — re-renders once more before painting) rather than via a
  // useEffect, which would let one guard-less frame slip through between the
  // step change committing and the effect reacting to it.
  const [justTransitioned, setJustTransitioned] = useState(false);
  const [guardedStep, setGuardedStep] = useState(step);
  if (guardedStep !== step) {
    setGuardedStep(step);
    setJustTransitioned(true);
  }
  useEffect(() => {
    if (!justTransitioned) return;
    const timer = setTimeout(() => setJustTransitioned(false), 300);
    return () => clearTimeout(timer);
  }, [justTransitioned]);
  const [skippedStep3, setSkippedStep3] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  // Tracks which country's flag/name the phone-code dropdown displays. The
  // form field itself only stores the dial string (e.g. "+1"), which isn't
  // unique enough to know whether that means the US, Canada, or a Caribbean
  // nation — this local state is the real selection; the dial code is
  // derived from it on change.
  const [countryCodeIso, setCountryCodeIso] = useState("US");
  // Once the customer manually picks a phone country code, the step-4
  // from_country auto-fill (below) stops overwriting it — even if they go
  // back and change from_country again.
  const phoneCountryTouchedRef = useRef(false);

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
      is_residence: false,
      package_types: [],
      box_details: [],
      television_details: [],
      auto_details: [],
      time_slot: undefined as unknown as QuoteWizardInput["time_slot"],
      timezone: "",
      contact: { name: "", email: "", country_code: "+1", phone: "" },
    },
  });
  const { control, register, watch, setValue, trigger, handleSubmit, formState, reset, getValues } = form;

  // Default the callback timezone off "Sending From" — the shipment's origin
  // is a better guess than the visitor's own browser zone (someone filling
  // this in on a customer's behalf shouldn't get their own). Falls back to the
  // browser zone for a country with no curated mapping. Post-mount only: the
  // browser's zone can differ from the server's, and setting it during SSR
  // would desync hydration. Stops once the customer picks their own.
  const timezoneTouchedRef = useRef(false);
  const watchedFromCountry = watch("from_country");
  const watchedTimezone = watch("timezone");
  useEffect(() => {
    if (timezoneTouchedRef.current) return;
    const guess = timezoneForCountry(watchedFromCountry) || detectTimezone();
    if (guess && guess !== watchedTimezone) {
      setValue("timezone", guess, { shouldValidate: false });
    }
  }, [watchedFromCountry, watchedTimezone, setValue]);
  const { errors, isSubmitting, isSubmitted } = formState;

  // Belt-and-suspenders alongside the pointer-events-none transition guard
  // above: if a phantom submit ever still slips through that race (or any
  // other path we haven't thought of), this forcibly clears isSubmitted
  // every time OUR OWN code moves the wizard to a new step — which a real
  // user-initiated submit never does on its own (submitting doesn't change
  // `step`). So this can never mask a genuine "clicked Submit with empty
  // fields while already on the Contact step" case, only a false positive
  // picked up in transit to it.
  useEffect(() => {
    reset(getValues(), { keepValues: true, keepDirty: true, keepTouched: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Default the Contact step's phone country code from the shipment's
  // "from" country (nicer starting point than always US) — only on first
  // arrival at step 4 and only if the customer hasn't already picked their
  // own phone country code (phoneCountryTouchedRef), so it never clobbers a
  // manual choice when navigating back and forth.
  useEffect(() => {
    if (step !== 4 || phoneCountryTouchedRef.current) return;
    const fromIso = getValues("from_country");
    const dial = fromIso && DIAL_BY_ISO.get(fromIso);
    if (dial) {
      setCountryCodeIso(fromIso);
      setValue("contact.country_code", dial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
    // Next (type="button") and Submit (type="submit") share one slot,
    // swapping on `step`. Since this function is async, the swap can land
    // *after* the browser has already begun the click gesture that got us
    // here — mousedown on Next, then mouseup resolving against whatever now
    // sits at that same screen position, which is the freshly-mounted
    // Submit if the transition already committed. That's a real click on a
    // real submit-typed button, so it fires a genuine (if accidental) form
    // submission — silently, before the user has ever seen the Contact
    // step, which is what produced errors appearing before it was touched.
    // This buffer holds the swap until well after any in-flight click has
    // finished resolving against the button that was actually visible when
    // the gesture started.
    await new Promise((resolve) => setTimeout(resolve, 120));

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
      // Back to the step-2 decision point — un-collapse the stepper right
      // away rather than leaving it showing 3 steps until skippedStep3 gets
      // recomputed by a future Next click (or, previously, a page refresh).
      setSkippedStep3(false);
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
      if (SHOW_LIVE_RATES_RESULT && data.show_fedex_rates) {
        setResult(data as SubmitResult);
      } else {
        const params = new URLSearchParams({ name: values.contact.name });
        if (data.quote_id) params.set("quote_id", String(data.quote_id));
        router.push(`/thank-you?${params.toString()}`);
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  }

  if (result?.show_fedex_rates) {
    return (
      <>
        <QuoteHero
          title="Your Shipping Quote"
          subtitle={
            result.summary
              ? `${result.summary.route} · ${result.summary.package_label} · ${result.summary.weight_lb} lb`
              : undefined
          }
        />
        <section className="bg-white px-4 pb-16 md:px-8">
          <div className="mx-auto max-w-5xl">
            <RatesResult result={result} />
          </div>
        </section>
      </>
    );
  }

  // The stepper always starts at the full 4 steps — it only collapses once
  // `skippedStep3` is actually confirmed by clicking Next off step 2 (not
  // live as package types are checked/unchecked), so nothing shifts while
  // the user is still mid-decision on steps 1–2. Once confirmed, step 3 is
  // dropped from the row and Contact Information is relabeled down to
  // "Step 3" rather than leaving a numbering gap for a step that won't show.
  const visibleSteps = skippedStep3 ? STEPS.filter((s) => s.n !== 3) : STEPS;
  const activeIndex = visibleSteps.findIndex((s) => s.n === step);
  const activeStep = visibleSteps[activeIndex] ?? visibleSteps[0];

  return (
    <>
      <QuoteHero
        title="Get a Free Quote"
        subtitle="Tell us about your shipment and we'll get you a rate in minutes."
      />
      <section className="bg-white px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-5xl">
    <div>
      {/* Mobile: only the current step's card, matching the reference —
          the full 4-up grid is reserved for md+ where it fits comfortably. */}
      <div className="flex items-center gap-3 rounded-2xl border-b-2 border-brand bg-white p-4 shadow-sm md:hidden">
        {activeStep.n === 3 ? (
          <span className="relative inline-flex shrink-0">
            <activeStep.icon size={28} className="text-brand" />
            <InfoIcon
              size={14}
              weight="fill"
              className="absolute -bottom-0.5 -left-0.5 rounded-full bg-white text-brand"
            />
          </span>
        ) : (
          <activeStep.icon size={28} className="shrink-0 text-brand" />
        )}
        <div>
          <div className="text-xs text-ink-muted">Step {activeIndex + 1}</div>
          <div className="text-sm font-semibold text-brand">{activeStep.label}</div>
        </div>
      </div>

      <div className={`hidden gap-4 md:grid ${skippedStep3 ? "grid-cols-3" : "grid-cols-4"}`}>
        {visibleSteps.map((s, i) => (
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
              <div className="text-xs text-ink-muted">Step {i + 1}</div>
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
              <div className="mt-1.5">
                <Controller
                  control={control}
                  name="from_zip"
                  render={({ field }) => (
                    <PostalCodeInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      countryCode={watch("from_country")}
                      placeholder="From Zip Code"
                      invalid={!!errors.from_zip}
                    />
                  )}
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
              <div className="mt-1.5">
                <Controller
                  control={control}
                  name="to_zip"
                  render={({ field }) => (
                    <PostalCodeInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      countryCode={watch("to_country")}
                      placeholder="To Zip Code"
                      invalid={!!errors.to_zip}
                    />
                  )}
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
            <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
              {PACKAGE_TYPES.map((pt) => {
                const Icon = PACKAGE_CARD_ICON[pt.value];
                const selected = packageTypes.includes(pt.value);
                return (
                  <button
                    type="button"
                    key={pt.value}
                    onClick={() => togglePackageType(pt.value)}
                    className={`flex flex-col items-center gap-4 rounded-2xl border-2 bg-white p-8 text-center transition ${
                      selected ? "border-brand" : "border-brand-light"
                    }`}
                  >
                    <span
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl ${selected ? "bg-brand text-white" : "bg-gray-100 text-ink-muted"}`}
                    >
                      <Icon size={28} />
                    </span>
                    <span className="text-base font-medium text-ink">{pt.label}</span>
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
              {isSubmitted && errors.contact?.name && (
                <p className={errorClass}>{errors.contact.name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input className={`mt-1.5 ${inputClass}`} placeholder="Enter Email" {...register("contact.email")} />
              {isSubmitted && errors.contact?.email && (
                <p className={errorClass}>{errors.contact.email.message}</p>
              )}
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
                        phoneCountryTouchedRef.current = true;
                        setCountryCodeIso(iso);
                        field.onChange(DIAL_BY_ISO.get(iso) ?? "");
                      }}
                      placeholder="Select Country Code"
                      invalid={isSubmitted && !!errors.contact?.country_code}
                    />
                  )}
                />
              </div>
              {isSubmitted && errors.contact?.country_code && (
                <p className={errorClass}>{errors.contact.country_code.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input className={`mt-1.5 ${inputClass}`} placeholder="Enter Phone Number" {...register("contact.phone")} />
              {isSubmitted && errors.contact?.phone && (
                <p className={errorClass}>{errors.contact.phone.message}</p>
              )}
            </div>

            {/* Callback time + timezone. quoteStoreInput made both REQUIRED
                after this wizard was first retired, so without them every
                submission 422s. Asked here, beside the contact details, which
                is where the single-page form put them. */}
            <div className="md:col-span-2">
              <label className={labelClass}>Best Time To Call You Back</label>
              <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TIME_SLOTS.map((s) => {
                  const active = watch("time_slot") === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setValue("time_slot", s.value, { shouldValidate: isSubmitted })}
                      className={`rounded-xl border px-3 py-3 text-center transition ${
                        active
                          ? "border-brand bg-brand-pale text-brand"
                          : "border-brand-light bg-white text-ink hover:border-brand"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{s.label}</span>
                      <span className="block text-xs text-ink-muted">{s.hint}</span>
                    </button>
                  );
                })}
              </div>
              {isSubmitted && errors.time_slot && (
                <p className={errorClass}>{errors.time_slot.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Your Timezone</label>
              <select className={`mt-1.5 ${inputClass}`} {...register("timezone")}>
                <option value="">Select timezone</option>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              {isSubmitted && errors.timezone && (
                <p className={errorClass}>{errors.timezone.message}</p>
              )}
            </div>
          </div>
        )}

        {submitError && <p className={`${errorClass} mt-4`}>{submitError}</p>}

        {isSubmitting && (
          <p className="mt-4 text-sm text-ink-muted">
            Getting live rates from FedEx — this can take up to 15 seconds, please don&rsquo;t close this page.
          </p>
        )}

        <div
          className={`mt-10 flex items-center justify-between ${justTransitioned ? "pointer-events-none" : ""}`}
        >
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
        </div>
      </section>
    </>
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

// L/W/H input for the dimensions row — the letter is a fixed prefix inside
// the field (not a placeholder), so it stays visible once a real value
// (including 0) is entered instead of disappearing like a placeholder would.
function DimensionInput({
  prefix,
  ...inputProps
}: { prefix: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-1 items-center rounded-xl border border-brand-light bg-white pl-3 focus-within:border-brand">
      <span className="mr-1 shrink-0 text-xs font-medium text-ink-muted">{prefix}</span>
      <input
        type="number"
        step="0.01"
        className="w-full min-w-0 bg-transparent py-3 pr-3 text-sm text-ink outline-none"
        {...inputProps}
      />
    </div>
  );
}

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
  const unit = watch(`${base}.weight_unit`);
  const rowErrors = errors.box_details?.[index];

  function recalc() {
    onRecalc("box_details", index);
  }

  return (
    <div className="rounded-xl border border-brand-light p-4">
      <div className="grid grid-cols-2 gap-3">
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
              <option value="lb">LB/IN</option>
              <option value="kg">KG/CM</option>
            </select>
          </div>
          {rowErrors?.weight && <p className={errorClass}>{rowErrors.weight.message}</p>}
        </Field>
      </div>

      <div className="mt-3">
        <Field label={`Dimensions (${unit === "kg" ? "CM" : "IN"})`}>
          <div className="flex items-center gap-2">
            <DimensionInput prefix="L" {...register(`${base}.length`, { valueAsNumber: true, onChange: recalc })} />
            <span className="shrink-0 text-ink-muted">×</span>
            <DimensionInput prefix="W" {...register(`${base}.width`, { valueAsNumber: true, onChange: recalc })} />
            <span className="shrink-0 text-ink-muted">×</span>
            <DimensionInput prefix="H" {...register(`${base}.height`, { valueAsNumber: true, onChange: recalc })} />
          </div>
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Chargeable Weight">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input disabled className={`${inputClass} pr-9`} value={Number(chargeable) || 0} readOnly />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <ChargeableWeightInfo />
              </span>
            </div>
            <button type="button" onClick={onRemove} aria-label="Remove box">
              <MinusCircleIcon size={20} className="text-red-500" />
            </button>
          </div>
        </Field>
      </div>
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
  const unit = watch(`${base}.weight_unit`);
  const rowErrors = errors.television_details?.[index];

  function recalc() {
    onRecalc("television_details", index);
  }

  return (
    <div className="rounded-xl border border-brand-light p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
              <option value="lb">LB/IN</option>
              <option value="kg">KG/CM</option>
            </select>
          </div>
        </Field>
      </div>

      <div className="mt-3">
        <Field label={`Dimensions (${unit === "kg" ? "CM" : "IN"})`}>
          <div className="flex items-center gap-2">
            <DimensionInput prefix="L" {...register(`${base}.length`, { valueAsNumber: true, onChange: recalc })} />
            <span className="shrink-0 text-ink-muted">×</span>
            <DimensionInput prefix="W" {...register(`${base}.width`, { valueAsNumber: true, onChange: recalc })} />
            <span className="shrink-0 text-ink-muted">×</span>
            <DimensionInput prefix="H" {...register(`${base}.height`, { valueAsNumber: true, onChange: recalc })} />
          </div>
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Chargeable Weight">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input disabled className={`${inputClass} pr-9`} value={Number(chargeable) || 0} readOnly />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <ChargeableWeightInfo />
              </span>
            </div>
            <button type="button" onClick={onRemove} aria-label="Remove television">
              <MinusCircleIcon size={20} className="text-red-500" />
            </button>
          </div>
        </Field>
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

// Click-to-toggle (not hover-only, so it works on touch) explainer for how
// carriers actually bill a shipment — the greater of actual vs. dimensional
// weight — since "chargeable weight" reads as jargon without it.
function ChargeableWeightInfo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="What is chargeable weight?"
        aria-expanded={open}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-muted/70 text-white"
      >
        <InfoIcon size={13} weight="bold" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-brand-light bg-white p-3 text-xs leading-relaxed text-ink-muted shadow-lg">
          Chargeable weight is whichever is greater: your package&rsquo;s actual weight, or its
          dimensional (volumetric) weight — length × width × height ÷ the carrier&rsquo;s
          divisor. Carriers bill by the larger number, since a bulky-but-light package still
          takes up the same space in a truck or plane.
        </div>
      )}
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
            {/* "Book Now" temporarily hidden — see the matching note in
                site-header.tsx. It was a non-functional stub either way. */}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-brand-light bg-brand-pale/40 p-5 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
        <p className="text-sm font-medium text-ink">
          Need help picking a rate or have questions about your shipment?
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={SUPPORT_PHONE_TEL}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
          >
            <PhoneCallIcon size={16} weight="bold" />
            {SUPPORT_PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
          >
            <EnvelopeSimpleIcon size={16} weight="bold" />
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
