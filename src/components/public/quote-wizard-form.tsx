"use client";

import { useEffect, useRef, useState } from "react";
import { rememberThankYouName } from "@/components/public/thank-you-title";
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
  PackageIcon,
  PhoneCallIcon,
  TelevisionIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { DIAL_CODES } from "@/lib/dial-codes";
import { SearchableSelect } from "@/components/public/searchable-select";
import { PostalCodeInput } from "@/components/public/postal-code-input";
import { FlagIcon } from "@/components/public/flag-icon";
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
const COUNTRY_NAME = new Map(COUNTRY_LIST.map(([code, name]) => [code, name]));
const countryName = (code: string) => COUNTRY_NAME.get(code) ?? code;

// Temporarily off: land every submission on the simple Thank You page
// instead of the inline live-FedEx-rates results screen, even for the
// domestic quotes the server flags with show_fedex_rates. Flip back to true
// to restore it.
const SHOW_LIVE_RATES_RESULT = false;

// Same support channels used site-wide (site-header.tsx, contact-us).
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
  { n: 1, label: "Details" },
  { n: 2, label: "Route" },
  { n: 3, label: "Package" },
] as const;

const PACKAGE_CARD_ICON: Record<string, typeof PackageIcon> = {
  envelope: EnvelopeSimpleIcon,
  boxes: PackageIcon,
  television: TelevisionIcon,
  furniture: CouchIcon,
  auto: CarSimpleIcon,
  packers_movers: TruckIcon,
};

// Fields (2026-09-29 renovation): white boxes with a clearly visible border
// and the label inside, turning blue-ringed while you type. Built for
// legibility first (a lot of our customers are 60+): dark 14px labels,
// 17px medium-weight values, dark placeholders, and a border strong enough
// to see where each box starts and ends. Inputs stay 16px+ on phones: iOS
// Safari auto-zooms the page when you focus anything smaller and never zooms
// back out (the "it zooms while adding data" report, 2026-08-16).
const wellClass =
  "block min-w-0 rounded-2xl bg-white px-4 pb-2 pt-2 text-left ring-inset transition focus-within:ring-2 focus-within:ring-brand sm:px-5 sm:pb-2.5 sm:pt-2.5";
const well = (invalid: boolean) =>
  `${wellClass} ${invalid ? "ring-2 ring-red-500 bg-[#FFF7F7]" : "ring-[1.5px] ring-[#AEBBCD] hover:ring-[#7F8FA6]"}`;
const wellLabel = "block text-[14px] font-semibold text-[#2B3445]";
const bareInput =
  "mt-0.5 w-full min-w-0 bg-transparent py-0.5 text-[17px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-[#6B778A]";
const errorClass = "mt-1.5 px-1 text-[14px] font-medium text-red-700";

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

// The page's hero (2026-09-29 renovation): dark, the same navy as the
// footer, with a soft blue glow and dot field, and the wizard card sitting
// in it. Sized so each step fits on one phone screen without scrolling:
// small type and no subtitle on phones, the promises folded into one line.
// data-nav-dark turns the sticky header dark over it, like the home page's
// night band. It lives in here rather than in quotes/page.tsx because the
// title switches to the customer's own route once results are showing, and
// only this client component knows that state.
function QuoteHero({
  title,
  accent,
  subtitle,
  children,
}: {
  title: string;
  accent?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section data-nav-dark data-quote-page className="relative overflow-hidden bg-[#0B1220]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(3,100,255,0.28),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(60%_60%_at_50%_20%,#000,transparent)]"
      />
      <div className="relative mx-auto max-w-4xl px-4 pb-10 pt-5 md:px-8 md:pb-20 md:pt-12">
        <div className="text-center">
          <span className="hidden rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white/80 ring-1 ring-inset ring-white/15 sm:inline-block">
            Free quote
          </span>
          <h1 className="mx-auto max-w-[760px] text-balance text-[1.65rem] font-bold leading-[1.08] tracking-[-0.035em] text-white sm:mt-4 sm:text-[2.6rem] lg:text-[3rem]">
            {title}
            {accent && <span className="text-[#6FA3FF]"> {accent}</span>}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-3 hidden max-w-[620px] text-balance text-[17px] leading-relaxed text-white/70 sm:block">
              {subtitle}
            </p>
          )}
        </div>
        <div className="mx-auto mt-4 max-w-[880px] sm:mt-8 md:mt-10">{children}</div>
      </div>
    </section>
  );
}

const PROMISES = ["Free, no obligation", "A real person replies", "Quote within 24 hours"];

export function QuoteWizardForm({
  defaultFromCountry,
  defaultToCountry,
  defaultPackageType,
}: {
  defaultFromCountry?: string;
  defaultToCountry?: string;
  /** Set by service pages (e.g. packers_movers): the package step is skipped. */
  defaultPackageType?: string;
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
  // Arriving from a quote bar with both countries already picked, step 2
  // shows them as a one-line summary with a "Change" link, so the customer
  // only types zip codes instead of re-choosing countries they just chose.
  const [editRoute, setEditRoute] = useState(!(defaultFromCountry && defaultToCountry));
  // Arriving from a service page that already said what's being sent (e.g.
  // packers and movers), the "What are you sending?" step is dropped: the
  // wizard is two steps, and step 2 submits. A "Change" link on step 2 brings
  // the package step back (2026-09-30).
  const [editPackage, setEditPackage] = useState(!defaultPackageType);
  const steps = editPackage ? STEPS : STEPS.slice(0, 2);
  const lastStep = steps.length;
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
      package_types: defaultPackageType ? [defaultPackageType] : [],
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

  // On phones the card can be taller than the screen, so after Next the new
  // step's first field would sit above the fold. Bring the card's top back
  // into view, but only when it's actually out of view (no jump otherwise).
  const cardRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = cardRef.current;
    if (el && el.getBoundingClientRect().top < 80) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Partial lead (2026-09-29): once step 1 is valid, the contact details are
  // saved as a lead (POST /api/quote-leads, listed at /admin/leads), so the
  // team can reach people who start a quote but never submit it. Step 2 adds
  // the route to the same lead; submitting marks it converted. All of it is
  // fire-and-forget: a failure here must never slow or block the form.
  const leadTokenRef = useRef<string | null>(null);
  function saveLead() {
    const v = getValues();
    fetch("/api/quote-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        token: leadTokenRef.current,
        contact: v.contact,
        from_country: v.from_country || null,
        to_country: v.to_country || null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { token?: string } | null) => {
        if (d?.token) leadTokenRef.current = d.token;
      })
      .catch(() => {});
  }

  async function next() {
    const fieldsByStep: Record<number, Path<QuoteWizardInput>[]> = {
      1: ["contact"],
      2: ["from_country", "from_zip", "to_country", "to_zip", "is_residence"],
    };
    const valid = await trigger(fieldsByStep[step]);
    if (!valid) return;
    saveLead();
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
    setStep((s) => Math.min(lastStep, s + 1));
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
      if (leadTokenRef.current && data.quote_id) {
        // keepalive: this fires just before the page navigates away.
        fetch("/api/quote-leads/convert", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: leadTokenRef.current, quote_id: data.quote_id }),
        }).catch(() => {});
      }
      if (SHOW_LIVE_RATES_RESULT && data.show_fedex_rates) {
        setResult(data as SubmitResult);
      } else {
        // The name goes to sessionStorage, never the URL (privacy).
        rememberThankYouName(values.contact.name);
        const params = new URLSearchParams();
        if (data.quote_id) params.set("quote_id", String(data.quote_id));
        router.push(params.size ? `/thank-you?${params.toString()}` : "/thank-you");
      }
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  }

  if (result?.show_fedex_rates) {
    return (
      <QuoteHero
        title="Your shipping"
        accent="quote."
        subtitle={
          result.summary
            ? `${result.summary.route} · ${result.summary.package_label} · ${result.summary.weight_lb} lb`
            : undefined
        }
      >
        <RatesResult result={result} />
      </QuoteHero>
    );
  }

  const activeIndex = steps.findIndex((s) => s.n === step);
  const activeStep = steps[activeIndex] ?? steps[0];

  return (
    <QuoteHero
      title="Get a free"
      accent="shipping quote."
      subtitle="Three quick steps. A real person looks at your details and sends you a custom quote, usually within 24 hours."
    >
      <div
        ref={cardRef}
        className="scroll-mt-28 rounded-[28px] bg-white p-2.5 shadow-[0_0_0_1px_rgba(3,100,255,0.14),0_40px_80px_-36px_rgba(3,100,255,0.65)]"
      >
        {/* Stepper. Abandonment climbs when a form gives no sense of how much
            is left, so every step shows "n of 3" and a bar that fills.
            Finished steps get a tick and can be clicked to go back (going
            back never validates, so it's always safe). role/aria-* mirror
            the visual state for screen readers. */}
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={activeIndex + 1}
          aria-label={`Step ${activeIndex + 1} of ${steps.length}: ${activeStep.label}`}
          className={`grid ${steps.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-1.5 px-2 pb-3 pt-2.5 sm:pb-4 sm:pt-3 md:px-3`}
        >
          {steps.map((s, i) => {
            const done = step > s.n;
            const current = step === s.n;
            return (
              <button
                key={s.n}
                type="button"
                disabled={!done}
                onClick={() => done && setStep(s.n)}
                className="group text-left disabled:cursor-default"
              >
                <span className="block h-1.5 overflow-hidden rounded-full bg-[#DCE3EC]">
                  <span
                    className="block h-full rounded-full bg-brand transition-[width] duration-500"
                    style={{ width: done || current ? "100%" : "0%", transitionTimingFunction: "cubic-bezier(0.22, 0.8, 0.3, 1)" }}
                  />
                </span>
                <span className="mt-2 flex items-center gap-2 sm:mt-2.5">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors duration-300 ${
                      done ? "bg-brand text-white group-hover:bg-brand-dark" : current ? "bg-brand text-white" : "bg-[#E3E8F0] text-[#3D4656]"
                    }`}
                  >
                    {done ? <CheckIcon size={12} weight="bold" /> : i + 1}
                  </span>
                  <span
                    className={`truncate text-[14px] font-semibold transition-colors duration-300 ${
                      current ? "text-ink" : done ? "text-[#2B3445] group-hover:text-ink" : "text-[#4A5568]"
                    } ${current ? "" : "hidden sm:inline"}`}
                  >
                    {s.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* key={step}: each step fades up as it arrives instead of the
              fields swapping in place. */}
          <div key={step} className="step-in">
            {step === 1 && (
              <div className="grid gap-2 md:grid-cols-2 [&>*]:min-w-0">
                <div>
                  <label className={well(!!errors.contact?.name)}>
                    <span className={wellLabel}>Your name</span>
                    <input className={bareInput} placeholder="Full name" autoComplete="name" {...register("contact.name")} />
                  </label>
                  {errors.contact?.name && <p className={errorClass}>{errors.contact.name.message}</p>}
                </div>
                <div>
                  <label className={well(!!errors.contact?.email)}>
                    <span className={wellLabel}>Email</span>
                    <input
                      className={bareInput}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...register("contact.email")}
                    />
                  </label>
                  {errors.contact?.email && <p className={errorClass}>{errors.contact.email.message}</p>}
                </div>
                <div>
                  <div className={well(!!errors.contact?.country_code)} data-select-anchor>
                    <span className={wellLabel}>Country code</span>
                    <Controller
                      control={control}
                      name="contact.country_code"
                      render={({ field }) => (
                        <SearchableSelect
                          options={DIAL_CODE_OPTIONS}
                          value={countryCodeIso}
                          label="Country code"
                          onChange={(iso) => {
                            phoneCountryTouchedRef.current = true;
                            setCountryCodeIso(iso);
                            field.onChange(DIAL_BY_ISO.get(iso) ?? "");
                          }}
                          placeholder="Select country code"
                          invalid={!!errors.contact?.country_code}
                          bare
                        />
                      )}
                    />
                  </div>
                  {errors.contact?.country_code && <p className={errorClass}>{errors.contact.country_code.message}</p>}
                </div>
                <div>
                  <label className={well(!!errors.contact?.phone)}>
                    <span className={wellLabel}>Phone</span>
                    <input
                      className={bareInput}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="Phone number"
                      {...register("contact.phone")}
                    />
                  </label>
                  {errors.contact?.phone && <p className={errorClass}>{errors.contact.phone.message}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-2 md:grid-cols-2 [&>*]:min-w-0">
                {!editRoute && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F4F7FC] px-4 py-3 ring-[1.5px] ring-inset ring-[#D5DDE8] sm:px-5 md:col-span-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[16px] font-semibold text-ink">
                      <span className="flex items-center gap-2">
                        <FlagIcon code={watchedFromCountry} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                        {countryName(watchedFromCountry)}
                      </span>
                      <ArrowRightIcon size={15} className="text-ink-muted" />
                      <span className="flex items-center gap-2">
                        <FlagIcon code={watch("to_country")} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                        {countryName(watch("to_country"))}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditRoute(true)}
                      className="text-[15px] font-semibold text-brand underline underline-offset-4"
                    >
                      Change
                    </button>
                  </div>
                )}
                {editRoute && (
                  <>
                <div>
                  <div className={well(!!errors.from_country)} data-select-anchor>
                    <span className={wellLabel}>Sending from</span>
                    <Controller
                      control={control}
                      name="from_country"
                      render={({ field }) => (
                        <SearchableSelect
                          options={COUNTRY_OPTIONS}
                          value={field.value}
                          label="Sending from"
                          onChange={field.onChange}
                          placeholder="Select country"
                          invalid={!!errors.from_country}
                          bare
                        />
                      )}
                    />
                  </div>
                  {errors.from_country && <p className={errorClass}>{errors.from_country.message}</p>}
                </div>
                  </>
                )}
                <div>
                  <div className={well(!!errors.from_zip)}>
                    <span className={wellLabel}>From zip code</span>
                    <Controller
                      control={control}
                      name="from_zip"
                      render={({ field }) => (
                        <PostalCodeInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          countryCode={watch("from_country")}
                          placeholder="Zip or postal code"
                          invalid={!!errors.from_zip}
                          bare
                        />
                      )}
                    />
                  </div>
                  {errors.from_zip && <p className={errorClass}>{errors.from_zip.message}</p>}
                </div>
                {editRoute && (
                  <>
                <div>
                  <div className={well(!!errors.to_country)} data-select-anchor>
                    <span className={wellLabel}>Sending to</span>
                    <Controller
                      control={control}
                      name="to_country"
                      render={({ field }) => (
                        <SearchableSelect
                          options={COUNTRY_OPTIONS}
                          value={field.value}
                          label="Sending to"
                          onChange={field.onChange}
                          placeholder="Where is it going?"
                          invalid={!!errors.to_country}
                          bare
                        />
                      )}
                    />
                  </div>
                  {errors.to_country && <p className={errorClass}>{errors.to_country.message}</p>}
                </div>
                  </>
                )}
                <div>
                  <div className={well(!!errors.to_zip)}>
                    <span className={wellLabel}>To zip code</span>
                    <Controller
                      control={control}
                      name="to_zip"
                      render={({ field }) => (
                        <PostalCodeInput
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          countryCode={watch("to_country")}
                          placeholder="Zip or postal code"
                          invalid={!!errors.to_zip}
                          bare
                        />
                      )}
                    />
                  </div>
                  {errors.to_zip && <p className={errorClass}>{errors.to_zip.message}</p>}
                </div>

                {!editPackage && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F4F7FC] px-4 py-3 ring-[1.5px] ring-inset ring-[#D5DDE8] sm:px-5 md:col-span-2">
                    <span className="flex min-w-0 items-center gap-2.5 text-[16px] text-ink">
                      {(() => {
                        const Icon = PACKAGE_CARD_ICON[packageTypes[0]] ?? PackageIcon;
                        return <Icon size={20} className="shrink-0 text-brand" />;
                      })()}
                      <span>
                        Sending: <strong className="font-semibold">{PACKAGE_TYPES.find((t) => t.value === packageTypes[0])?.label ?? "Packages"}</strong>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditPackage(true)}
                      className="text-[15px] font-semibold text-brand underline underline-offset-4"
                    >
                      Change
                    </button>
                  </div>
                )}
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-[1.5px] ring-inset ring-[#AEBBCD] transition hover:ring-[#7F8FA6] sm:px-5 sm:py-3.5 md:col-span-2">
                  <input
                    type="checkbox"
                    className="h-5 w-5 shrink-0 cursor-pointer rounded accent-brand"
                    checked={watch("is_residence") === true}
                    onChange={(e) => setValue("is_residence", e.target.checked)}
                  />
                  <span className="text-[16px] font-medium text-ink">
                    It&rsquo;s going to a home address
                    <span className="ml-1.5 hidden font-normal text-[#4A5568] sm:inline">(not a business)</span>
                  </span>
                </label>
              </div>
            )}

            {step === 3 && (
              <div>
                {/* Phones get compact rows (icon beside the label) so all six options
                    and the buttons fit on one screen, even an iPhone SE
                    (2026-09-30). From sm up they're the tall centred tiles. */}
                <p className="px-2 pb-2 text-[15px] font-medium leading-snug text-[#2B3445] sm:pb-3 sm:text-[16px]">What are you sending? Pick all that apply.</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 [&>*]:min-w-0">
                  {PACKAGE_TYPES.map((pt) => {
                    const Icon = PACKAGE_CARD_ICON[pt.value];
                    const selected = packageTypes.includes(pt.value);
                    return (
                      <button
                        type="button"
                        key={pt.value}
                        aria-pressed={selected}
                        onClick={() => togglePackageType(pt.value)}
                        className={`relative flex min-h-[58px] items-center gap-2.5 rounded-2xl px-2.5 py-2 text-left ring-inset transition sm:min-h-0 sm:flex-col sm:gap-3 sm:px-3 sm:py-5 sm:text-center md:py-7 ${
                          selected ? "bg-[#E8F0FF] shadow-[0_10px_24px_-14px_rgba(3,100,255,0.7)] ring-[2.5px] ring-brand" : "bg-white ring-[1.5px] ring-[#AEBBCD] hover:ring-[#7F8FA6] active:scale-[0.98]"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full transition duration-300 sm:right-2 sm:top-2 sm:h-6 sm:w-6 ${
                            selected ? "scale-100 bg-brand text-white opacity-100" : "scale-50 opacity-0"
                          }`}
                        >
                          <CheckIcon size={13} weight="bold" />
                        </span>
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 sm:h-12 sm:w-12 ${
                            selected ? "border-brand bg-brand text-white" : "border-[#C9D2DF] bg-white text-ink"
                          }`}
                        >
                          <Icon size={22} />
                        </span>
                        <span className={`min-w-0 break-words pr-4 text-[15px] font-semibold leading-tight sm:pr-0 sm:text-[15.5px] ${selected ? "text-brand" : "text-ink"}`}>{pt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.package_types && <p className={errorClass}>{errors.package_types.message}</p>}
              </div>
            )}
          </div>

          {submitError && (
            <p className="mx-2 mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-[14px] text-red-700">{submitError}</p>
          )}

          <div
            className={`mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] px-2 pb-0.5 pt-2.5 sm:pb-1 sm:pt-3 ${justTransitioned ? "pointer-events-none" : ""}`}
          >
            {step > 1 ? (
              <button type="button" onClick={back} className="btn btn-secondary btn-lg !rounded-2xl">
                <ArrowLeftIcon size={15} /> Back
              </button>
            ) : (
              <>
                <a href={SUPPORT_PHONE_TEL} className="whitespace-nowrap text-[15.5px] font-semibold text-brand underline underline-offset-4 sm:hidden">
                  Rather call us?
                </a>
                <span className="hidden text-[15px] text-[#3D4656] sm:block">
                  We only use this to help with your quote.
                </span>
              </>
            )}
            {step < lastStep ? (
              <button type="button" onClick={next} className="btn btn-primary btn-lg ml-auto !rounded-2xl !px-7">
                Next <ArrowRightIcon size={15} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg ml-auto !rounded-2xl !px-7 disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Get my quote"} <ArrowRightIcon size={15} />
              </button>
            )}
          </div>
        </form>
      </div>

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:mt-5 sm:gap-x-6">
        {PROMISES.map((t, i) => (
          <li
            key={t}
            className={`items-center gap-1.5 whitespace-nowrap text-[14px] font-semibold text-white sm:text-[15px] ${i === 1 ? "hidden sm:flex" : "flex"}`}
          >
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#12B76A] text-white">
              <CheckIcon size={11} weight="bold" />
            </span>
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-4 hidden text-center text-[15.5px] text-white/85 sm:block">
        Rather talk it through?{" "}
        <a href={SUPPORT_PHONE_TEL} className="font-semibold text-white hover:underline">
          Call {SUPPORT_PHONE_DISPLAY}
        </a>
      </p>
    </QuoteHero>
  );
}

function RatesResult({ result }: { result: SubmitResult }) {
  return (
    <div>
      <div className="rounded-2xl bg-white p-6 shadow-[0_0_0_1px_rgba(3,100,255,0.12)]">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckIcon size={18} weight="bold" />
          <span className="text-sm font-semibold">{result.message}</span>
        </div>
      </div>

      {result.rates_error && <p className="mt-4 text-sm text-red-600">{result.rates_error}</p>}

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

      <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-[var(--line)] bg-white p-5 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
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
