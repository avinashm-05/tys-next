"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightIcon,
  CarSimpleIcon,
  ClockIcon,
  CouchIcon,
  FileTextIcon,
  GlobeIcon,
  HeadsetIcon,
  MapPinIcon,
  MoonStarsIcon,
  PackageIcon,
  SunHorizonIcon,
  SunIcon,
  TelevisionIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { DIAL_CODES } from "@/lib/dial-codes";
import { detectTimezone, getTimezoneOptions, timezoneForCountry } from "@/lib/timezones";
import { SearchableSelect } from "@/components/public/searchable-select";
import {
  PACKAGE_TYPES,
  TIME_SLOTS,
  quoteRequestSchema,
  toApiPayload,
  type QuoteRequestValues,
} from "@/lib/validation/quote-request";

// Single-page quote request — replaces the old 4-step /quotes wizard. Just
// the two countries the shipment is between + package type + a callback
// window (time slot, timezone) + contact info, all on one page — no zip
// codes or residence/commercial type up front, since staff get those on the
// call. A real Quote is still created (same as the old wizard did) so admin
// can pull FedEx rates on demand once the full route is known. This is the
// same single-step shape the standalone "Quick Quote" callback form used —
// that form is now folded into this one (see /quick-quote's redirect).

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

const PACKAGE_CARD_ICON: Record<string, typeof PackageIcon> = {
  envelope: FileTextIcon,
  boxes: PackageIcon,
  television: TelevisionIcon,
  furniture: CouchIcon,
  auto: CarSimpleIcon,
  packers_movers: TruckIcon,
};

const TIME_SLOT_ICON: Record<string, typeof ClockIcon> = {
  morning: SunHorizonIcon, // sunrise
  afternoon: SunIcon,
  evening: MoonStarsIcon,
};

// text-base (16px), not text-sm (14px): iOS Safari auto-zooms the whole
// page on focusing any input under 16px (see searchable-select.tsx for the
// full failure mode this causes downstream — a stuck zoom level makes every
// later dropdown/panel on the page look misaligned, not just this field).
const inputClass =
  "w-full rounded-xl border border-brand-light bg-white px-3.5 py-2.5 text-base text-ink outline-none focus:border-brand disabled:bg-brand-pale disabled:text-ink-muted";
const labelClass = "block text-xs font-medium text-ink";
const errorClass = "mt-1 text-xs text-red-600";

// Deliberately short and flat (no curve, minimal padding) — the whole form
// is meant to fit one viewport with no scrolling, so the hero can't afford
// the tall version the old 4-step wizard used.
function QuoteHero() {
  return (
    <section className="bg-brand-light px-4 py-2.5 text-center md:px-8 md:py-3">
      <h1 className="text-lg font-extrabold text-ink md:text-xl">Get a Free Quote</h1>
      <p className="mt-0.5 text-xs text-ink-muted">We&rsquo;ll call you back with your rate.</p>
    </section>
  );
}

export function QuoteRequestForm({
  defaultFromCountry,
  defaultToCountry,
}: {
  defaultFromCountry?: string;
  defaultToCountry?: string;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [countryCodeIso, setCountryCodeIso] = useState("US");
  const phoneCountryTouchedRef = useRef(false);
  const timezoneTouchedRef = useRef(false);
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  const form = useForm<QuoteRequestValues>({
    resolver: zodResolver(quoteRequestSchema),
    mode: "onSubmit",
    defaultValues: {
      from_country: defaultFromCountry || "US",
      to_country: defaultToCountry || "",
      package_types: [],
      time_slot: undefined as unknown as QuoteRequestValues["time_slot"],
      timezone: "",
      contact: { name: "", email: "", country_code: "+1", phone: "" },
    },
  });
  const { control, register, watch, setValue, handleSubmit, formState } = form;
  const { errors, isSubmitting, isSubmitted } = formState;
  const packageTypes = watch("package_types");
  const timeSlot = watch("time_slot");
  const timezone = watch("timezone");
  const fromCountry = watch("from_country");

  // Default the callback timezone off "Sending From" — the shipment's actual
  // origin is a better guess than the visitor's own browser zone (someone
  // filling this out on the customer's behalf, or just browsing from
  // somewhere else, shouldn't get their own zone). Falls back to the
  // browser's zone only for a country with no curated mapping. Runs
  // post-mount only (the browser's zone can differ from the server's —
  // setting it during SSR would desync hydration) and stops once the
  // customer picks their own timezone, same pattern as the phone country
  // code below.
  useEffect(() => {
    if (timezoneTouchedRef.current) return;
    setValue("timezone", timezoneForCountry(fromCountry) ?? detectTimezone(), { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCountry]);

  // Default the phone country code from the "from" country (nicer starting
  // point than always US) — only until the customer picks their own.
  useEffect(() => {
    if (phoneCountryTouchedRef.current) return;
    const dial = fromCountry && DIAL_BY_ISO.get(fromCountry);
    if (dial) {
      setCountryCodeIso(fromCountry);
      setValue("contact.country_code", dial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCountry]);

  function togglePackageType(value: string) {
    const current = form.getValues("package_types");
    const next = current.includes(value) ? current.filter((t) => t !== value) : [...current, value];
    setValue("package_types", next, { shouldValidate: false });
  }

  async function onSubmit(values: QuoteRequestValues) {
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
            form.setError(path as Path<QuoteRequestValues>, { type: "server", message: messages[0] });
          }
          setSubmitError("Please fix the highlighted fields and try again.");
        } else {
          setSubmitError(data.message || "Something went wrong. Please try again.");
        }
        return;
      }
      const params = new URLSearchParams({
        name: values.contact.name,
        time_slot: values.time_slot,
        package_type: values.package_types.join(","),
      });
      if (data.quote_id) params.set("quote_id", String(data.quote_id));
      router.push(`/thank-you?${params.toString()}`);
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  }

  return (
    <>
      <QuoteHero />
      {/* Two columns on desktop (route+packages left, contact+callback
          window right) instead of a tall single stack — spreads the same
          fields across the screen's actual width so nothing has to scroll. */}
      <section className="bg-white px-4 py-3 md:px-8 md:py-4">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-3xl border border-brand-light bg-white p-5 shadow-[0_20px_60px_rgba(16,24,40,0.08)] md:p-7">
              <div className="grid gap-6 md:grid-cols-2 md:gap-10">
                {/* Left: route + package type */}
                <div className="flex flex-col gap-5">
                  <div>
                    <div className="flex items-center gap-2 text-brand">
                      <MapPinIcon size={16} weight="bold" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Shipment route</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-3">
                      <div>
                        <label className={labelClass}>Sending From</label>
                        <div className="mt-1">
                          <Controller
                            control={control}
                            name="from_country"
                            render={({ field }) => (
                              <SearchableSelect
                                options={COUNTRY_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select Country"
                                invalid={isSubmitted && !!errors.from_country}
                              />
                            )}
                          />
                        </div>
                        {isSubmitted && errors.from_country && (
                          <p className={errorClass}>{errors.from_country.message}</p>
                        )}
                      </div>

                      <div>
                        <label className={labelClass}>Sending To</label>
                        <div className="mt-1">
                          <Controller
                            control={control}
                            name="to_country"
                            render={({ field }) => (
                              <SearchableSelect
                                options={COUNTRY_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Sending To"
                                invalid={isSubmitted && !!errors.to_country}
                                placeholderIcon
                              />
                            )}
                          />
                        </div>
                        {isSubmitted && errors.to_country && <p className={errorClass}>{errors.to_country.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-brand">
                      <PackageIcon size={16} weight="bold" />
                      <span className="text-xs font-semibold uppercase tracking-wide">What are you shipping?</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {PACKAGE_TYPES.map((pt) => {
                        const Icon = PACKAGE_CARD_ICON[pt.value];
                        const selected = packageTypes.includes(pt.value);
                        return (
                          <button
                            type="button"
                            key={pt.value}
                            onClick={() => togglePackageType(pt.value)}
                            className={`flex min-h-[92px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 bg-white p-3 text-center transition ${
                              selected ? "border-brand" : "border-brand-light"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-brand text-white" : "bg-gray-100 text-ink-muted"}`}
                            >
                              <Icon size={17} />
                            </span>
                            <span className="text-xs font-medium leading-tight text-ink">{pt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {isSubmitted && errors.package_types && (
                      <p className={errorClass}>{errors.package_types.message}</p>
                    )}
                  </div>
                </div>

                {/* Right: contact, then the (smaller) callback window below it */}
                <div className="flex flex-col gap-5">
                  <div>
                    <div className="flex items-center gap-2 text-brand">
                      <HeadsetIcon size={16} weight="bold" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Your details</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-3">
                      <div>
                        <label className={labelClass}>Name</label>
                        <input
                          className={`mt-1 ${inputClass}`}
                          placeholder="Enter name"
                          {...register("contact.name")}
                        />
                        {isSubmitted && errors.contact?.name && (
                          <p className={errorClass}>{errors.contact.name.message}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input
                          className={`mt-1 ${inputClass}`}
                          placeholder="Enter Email"
                          {...register("contact.email")}
                        />
                        {isSubmitted && errors.contact?.email && (
                          <p className={errorClass}>{errors.contact.email.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-[minmax(0,120px)_1fr] gap-3">
                        <div>
                          <label className={labelClass}>Code</label>
                          <div className="mt-1">
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
                                  placeholder="Code"
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
                          <input
                            className={`mt-1 ${inputClass}`}
                            placeholder="Enter Phone Number"
                            {...register("contact.phone")}
                          />
                          {isSubmitted && errors.contact?.phone && (
                            <p className={errorClass}>{errors.contact.phone.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-brand">
                      <ClockIcon size={16} weight="bold" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Best time to call you back</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <GlobeIcon size={13} className="shrink-0 text-ink-muted" />
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="timezone"
                          render={({ field }) => (
                            <SearchableSelect
                              options={timezoneOptions}
                              value={timezone}
                              onChange={(v) => {
                                timezoneTouchedRef.current = true;
                                field.onChange(v);
                              }}
                              placeholder="Your timezone"
                              invalid={isSubmitted && !!errors.timezone}
                            />
                          )}
                        />
                      </div>
                    </div>
                    {isSubmitted && errors.timezone && <p className={errorClass}>{errors.timezone.message}</p>}
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const selected = timeSlot === slot.value;
                        const Icon = TIME_SLOT_ICON[slot.value] ?? ClockIcon;
                        return (
                          <button
                            type="button"
                            key={slot.value}
                            onClick={() => setValue("time_slot", slot.value, { shouldValidate: false })}
                            className={`flex flex-col items-center gap-1 rounded-xl border-2 bg-white px-2 py-2.5 text-center transition ${
                              selected ? "border-brand" : "border-brand-light"
                            }`}
                          >
                            <Icon size={17} className={selected ? "text-brand" : "text-ink-muted"} />
                            <span className="text-xs font-semibold text-ink">{slot.label}</span>
                            <span className="text-[10px] text-ink-muted">{slot.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                    {isSubmitted && errors.time_slot && <p className={errorClass}>{errors.time_slot.message}</p>}
                  </div>

                  {submitError && <p className={errorClass}>{submitError}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting…" : "Get My Free Quote"} <ArrowRightIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
