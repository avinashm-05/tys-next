"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useForm,
  type Path,
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
  MapPinIcon,
  PackageIcon,
  PhoneCallIcon,
  TelevisionIcon,
} from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { DIAL_CODES } from "@/lib/dial-codes";
import { SearchableSelect } from "@/components/public/searchable-select";
import { PostalCodeInput } from "@/components/public/postal-code-input";
import {
  PACKAGE_TYPES,
  quoteWizardSchema,
  toApiPayload,
  type QuoteWizardInput,
  type QuoteWizardValues,
} from "@/lib/validation/quote-wizard";
import { detectTimezone, timezoneForCountry } from "@/lib/timezones";

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({
  value: code,
  label: name,
  flag: code,
}));

// Keyed by ISO code, not dial code: NANP (US/CA/Caribbean, all "+1") and
// Russia/Kazakhstan (both "+7") share a dial code, so the dial code alone
// isn't a unique option value — see the dedicated countryCodeIso state below.
const DIAL_CODE_OPTIONS = DIAL_CODES.map(([code, dial, name]) => ({
  value: code,
  label: `${name} (${dial})`,
  flag: code,
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

// Three steps: "Package Details" (box/tv/auto dimensions) was removed
// entirely on 2026-08-16 — every package type now behaves like envelope
// always did, with staff capturing exact dimensions on the callback via the
// admin editor rather than on the public form (see quote-wizard.ts).
//
// Contact FIRST (reordered 2026-08-22). It used to be last, which meant
// anyone who dropped out partway through was an anonymous bounce — the form
// knew what they wanted to ship but had no way to reach them. Asking for it
// up front turns every partial completion into a lead sales can actually
// call. It does trade against first-step drop-off (a phone number before any
// value is shown is a bigger ask), which is the deliberate call recorded in
// 13_Media_Plan/FIX_THE_QUOTE_FORM.md.
const STEPS = [
  { n: 1, label: "Contact Information", icon: HeadsetIcon },
  { n: 2, label: "Location", icon: MapPinIcon },
  { n: 3, label: "Select Package", icon: PackageIcon },
] as const;

const PACKAGE_CARD_ICON: Record<string, typeof PackageIcon> = {
  envelope: EnvelopeSimpleIcon,
  boxes: PackageIcon,
  television: TelevisionIcon,
  furniture: CouchIcon,
  auto: CarSimpleIcon,
};

// text-base (16px) on mobile, text-sm only from md up. iOS Safari auto-zooms
// the whole page when you focus an input smaller than 16px, and never zooms
// back out — which is the "it zooms while adding data" report (2026-08-16).
// The search box inside SearchableSelect already had this fix for the same
// reason; these fields did not.
const inputClass =
  "w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-base text-ink outline-none focus:border-brand disabled:bg-brand-pale disabled:text-ink-muted md:text-sm";
// Labels/checkbox text/error text below all sit directly on the page's own
// dark background (see QuoteHero/the wrapping section), not inside a white
// card — hence light-on-dark colors here, distinct from `inputClass` above,
// which stays white/dark-text because the inputs themselves stay light.
const labelClass = "block text-sm font-medium text-white";
const errorClass = "mt-1 text-xs text-red-400";

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

// Dark, full-bleed hero — no separate light band + swoop-curve transition
// into a white section below it anymore (2026-08-16). That curve needed a
// lot of extra bottom padding just to have room to swoop without covering
// the title, which is exactly what was pushing the actual form below the
// fold on mobile. Now the hero and the form area below share one flat dark
// background (bg-ink, the same near-black already used site-wide for text
// and overlays), so there's no seam to leave room for and padding can stay
// tight. The title needs to change once results are showing (and show what
// the customer actually submitted, not the generic pitch) — that state only
// exists inside this client component, so the hero lives in here with it.
function QuoteHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="relative z-10 mx-auto max-w-2xl text-center">
      {/* text-2xl on mobile, not text-3xl — this is a compact utility form,
          not a marketing headline, and the larger size (still used at
          md+, where there's room) read as oversized next to the tight
          spacing below it. */}
      <h1 className="text-2xl font-extrabold text-white md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-white/70 md:mt-2 md:text-base">{subtitle}</p>}
    </div>
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  // Tracks which country's flag/name the phone-code dropdown displays. The
  // form field itself only stores the dial string (e.g. "+1"), which isn't
  // unique enough to know whether that means the US, Canada, or a Caribbean
  // nation — this local state is the real selection; the dial code is
  // derived from it on change.
  const [countryCodeIso, setCountryCodeIso] = useState("US");
  // Once the customer manually picks a phone country code, the step-3
  // from_country auto-fill (below) stops overwriting it — even if they go
  // back and change from_country again.
  const phoneCountryTouchedRef = useRef(false);

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
      timezone: "",
      contact: { name: "", email: "", country_code: "+1", phone: "" },
    },
  });
  const { control, register, watch, setValue, trigger, handleSubmit, formState, reset, getValues } = form;

  // Timezone is captured SILENTLY — there is no timezone field in the form.
  // The customer-facing "best time to call you back" question was removed
  // (2026-08-15) as too much friction on a quote form, but sales still wants
  // to know what hour it is at the lead's end, so we infer it from "Sending
  // From" — the shipment's origin is a better guess than the visitor's own
  // browser zone (someone filling this in on a customer's behalf shouldn't
  // get their own). Falls back to the browser zone for a country with no
  // curated mapping. Post-mount only: the browser's zone can differ from the
  // server's, and setting it during SSR would desync hydration.
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
  const { errors, isSubmitting } = formState;

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

  // The phone country code used to be auto-filled from the shipment's "from"
  // country when the customer reached the Contact step. That is impossible now
  // that Contact is step 1 — from_country hasn't been chosen yet — so the
  // field simply starts on its US/+1 default and the customer changes it if
  // they need to. Removed rather than deferred to step 2, because silently
  // rewriting a phone country code the customer already filled in would be
  // worse than not guessing at all.

  const packageTypes = watch("package_types");

  async function next() {
    const fieldsByStep: Record<number, Path<QuoteWizardInput>[]> = {
      1: ["contact"],
      2: ["from_country", "from_zip", "to_country", "to_zip", "is_residence"],
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
    setStep((s) => Math.min(3, s + 1));
  }

  function back() {
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
      <section className="bg-ink px-4 pb-16 pt-6 md:px-8 md:pt-10">
        <QuoteHero
          title="Your Shipping Quote"
          subtitle={
            result.summary
              ? `${result.summary.route} · ${result.summary.package_label} · ${result.summary.weight_lb} lb`
              : undefined
          }
        />
        <div className="mx-auto mt-8 max-w-5xl">
          <RatesResult result={result} />
        </div>
      </section>
    );
  }

  const activeIndex = STEPS.findIndex((s) => s.n === step);
  const activeStep = STEPS[activeIndex] ?? STEPS[0];

  return (
    // min-h keeps the dark background reaching the bottom of the viewport.
    // The shared public layout's wrapper is `min-h-full` + `bg-white`, and
    // `full` resolves against an ancestor height that neither html nor body
    // actually sets — so on a short page the wrapper stops at its content
    // height and leaves a white strip below it (reported 2026-08-16, only
    // appeared once this page got short enough to not fill a tall display).
    // Fixed here rather than in the layout so nothing outside the quote form
    // changes. 102px is the header's height — it's the same at every
    // breakpoint (fixed h-11 logo + py-3 inner + py-4 outer), and the header
    // is `sticky`, not `fixed`, so it genuinely occupies that much flow space
    // above this section. dvh (not vh) so mobile browser chrome collapsing
    // doesn't leave a gap.
    <section className="relative min-h-[calc(100dvh-102px)] bg-ink px-4 pb-6 pt-4 md:px-8 md:pb-16 md:pt-10">
      {/* Fixed dark backdrop covering the whole viewport. The section's own
          min-height is in dvh, which SHRINKS when the on-screen keyboard
          opens — so the dark area became shorter than the page and the
          layout wrapper's bg-white showed through underneath it ("bottom
          white space while keyboard is up", 2026-08-16). A fixed inset-0
          layer is immune to that: it tracks the viewport at whatever size
          the keyboard leaves.
          z-0, NOT -z-10: a negative z-index puts this *behind* the ancestor
          wrapper's own white background, so the white simply painted over it
          and the gap remained (shipped that way once — the local check used
          elementFromPoint, which reports hit-testing, not paint order, so it
          passed while the page still looked wrong). At z-0 it paints above
          the wrapper's background; the hero and form below carry relative
          z-10 to stay above it in turn. The sticky header is z-50. */}
      <div aria-hidden className="fixed inset-0 z-0 bg-ink" />
      <QuoteHero
        title="Get a Free Quote"
        subtitle="Tell us about your shipment and we'll send you a custom quote within 24 hours."
      />
      <div className="relative z-10 mx-auto mt-4 max-w-5xl md:mt-8">
    <div>
      {/* Progress bar. Abandonment climbs when a form gives no sense of
          how much is left, and this one previously rendered a bare
          "Step 1" with no total — it could have been step 1 of three or
          of ten. role/aria-* mirror the visual state for screen readers,
          which get nothing from a coloured bar. */}
      <div className="mb-3">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={activeIndex + 1}
          aria-label={`Step ${activeIndex + 1} of ${STEPS.length}: ${activeStep.label}`}
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
            style={{ width: `${((activeIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs font-medium text-white/70">
          Step {activeIndex + 1} of {STEPS.length}
        </p>
      </div>
      {/* Mobile: only the current step's card, matching the reference —
          the full 3-up grid is reserved for md+ where it fits comfortably. */}
      <div className="flex items-center gap-3 rounded-2xl border-b-2 border-brand bg-white p-3 shadow-sm md:hidden">
        <activeStep.icon size={28} className="shrink-0 text-brand" />
        <div>
          <div className="text-xs text-ink-muted">Step {activeIndex + 1} of {STEPS.length}</div>
          <div className="text-sm font-semibold text-brand">{activeStep.label}</div>
        </div>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={`flex items-center gap-3 rounded-2xl border-b-2 bg-white p-4 shadow-sm md:p-5 ${step === s.n ? "border-brand" : "border-transparent"}`}
          >
            <s.icon size={28} className={`shrink-0 ${step >= s.n ? "text-brand" : "text-ink-muted"}`} />
            <div>
              <div className="text-xs text-ink-muted">Step {i + 1} of {STEPS.length}</div>
              <div className="text-sm font-semibold text-ink md:text-base">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 md:mt-8">
        {step === 2 && (
          <div className="grid gap-3 md:grid-cols-2 md:gap-6">
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
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/40 text-brand focus:ring-brand"
                  checked={watch("is_residence") === true}
                  onChange={(e) => setValue("is_residence", e.target.checked)}
                />
                I&rsquo;m shipping to a residence
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            {/* Mobile keeps 2 columns but much tighter padding/icon sizing —
                at p-8 + h-16 icons this step alone ran ~300px past the fold
                on a 812px-tall phone. Desktop (md:) is unchanged. */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-5">
              {PACKAGE_TYPES.map((pt) => {
                const Icon = PACKAGE_CARD_ICON[pt.value];
                const selected = packageTypes.includes(pt.value);
                return (
                  <button
                    type="button"
                    key={pt.value}
                    onClick={() => togglePackageType(pt.value)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-3 text-center transition md:gap-4 md:p-8 ${
                      selected ? "border-brand" : "border-brand-light"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl md:h-16 md:w-16 md:rounded-2xl ${selected ? "bg-brand text-white" : "bg-gray-100 text-ink-muted"}`}
                    >
                      <Icon size={22} className="md:hidden" />
                      <Icon size={28} className="hidden md:block" />
                    </span>
                    <span className="text-sm font-medium text-ink md:text-base">{pt.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.package_types && <p className={errorClass}>{errors.package_types.message}</p>}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 md:grid-cols-2 md:gap-6">
            <div>
              <label className={labelClass}>Name</label>
              <input className={`mt-1.5 ${inputClass}`} placeholder="Enter name" {...register("contact.name")} />
              {errors.contact?.name && (
                <p className={errorClass}>{errors.contact.name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input className={`mt-1.5 ${inputClass}`} placeholder="Enter Email" {...register("contact.email")} />
              {errors.contact?.email && (
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
                      invalid={!!errors.contact?.country_code}
                    />
                  )}
                />
              </div>
              {errors.contact?.country_code && (
                <p className={errorClass}>{errors.contact.country_code.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input className={`mt-1.5 ${inputClass}`} placeholder="Enter Phone Number" {...register("contact.phone")} />
              {errors.contact?.phone && (
                <p className={errorClass}>{errors.contact.phone.message}</p>
              )}
            </div>
          </div>
        )}

        {submitError && <p className={`${errorClass} mt-4`}>{submitError}</p>}

        <div
          className={`mt-6 flex items-center justify-between md:mt-10 ${justTransitioned ? "pointer-events-none" : ""}`}
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
          {step < 3 ? (
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

      {result.rates_error && <p className="mt-4 text-sm text-red-400">{result.rates_error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(result.rates ?? []).map((rate) => (
          <div key={rate.service_type} className="rounded-2xl border border-brand-light bg-white p-6">
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

      <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-brand-light bg-white/95 p-5 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
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
