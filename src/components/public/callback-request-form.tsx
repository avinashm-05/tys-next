"use client";

import { useEffect, useMemo, useState } from "react";
import { rememberThankYouName } from "@/components/public/thank-you-title";
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
  PackageIcon,
  TelevisionIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { DIAL_CODES } from "@/lib/dial-codes";
import { detectTimezone, getTimezoneOptions } from "@/lib/timezones";
import { SearchableSelect } from "@/components/public/searchable-select";
import {
  CALLBACK_TIME_SLOTS,
  PACKAGE_TYPES,
  callbackRequestFormSchema,
  toApiPayload,
  type CallbackRequestFormValues,
} from "@/lib/validation/callback-request";

const DIAL_CODE_OPTIONS = DIAL_CODES.map(([code, dial, name]) => ({
  value: code,
  label: `${name} (${dial})`,
  flag: code,
}));
const DIAL_BY_ISO = new Map(DIAL_CODES.map(([code, dial]) => [code, dial]));

// text-base (16px), not text-sm: iOS Safari auto-zooms the page on
// focusing any input under 16px — see searchable-select.tsx for the full
// failure mode.
const inputClass =
  "w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-base text-ink outline-none focus:border-brand disabled:bg-brand-pale disabled:text-ink-muted";
const labelClass = "block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-red-600";

const PACKAGE_CARD_ICON: Record<string, typeof PackageIcon> = {
  envelope: FileTextIcon,
  boxes: PackageIcon,
  television: TelevisionIcon,
  furniture: CouchIcon,
  auto: CarSimpleIcon,
  packers_movers: TruckIcon,
};

// Single-step "call me back" lead form — a lighter alternative to the full
// /quotes wizard for a customer who'd rather just talk to someone: name +
// contact, a preferred callback window, package type, submit. No route, no
// package dimensions — staff get those on the call.
export function CallbackRequestForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [countryCodeIso, setCountryCodeIso] = useState("US");

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);

  const form = useForm<CallbackRequestFormValues>({
    resolver: zodResolver(callbackRequestFormSchema),
    mode: "onSubmit",
    defaultValues: {
      contact: { name: "", email: "", country_code: "+1", phone: "" },
      time_slot: undefined as unknown as CallbackRequestFormValues["time_slot"],
      timezone: "",
      package_types: [],
    },
  });
  const { control, register, watch, setValue, handleSubmit, formState } = form;
  const { errors, isSubmitting, isSubmitted } = formState;
  const packageTypes = watch("package_types");
  const timeSlot = watch("time_slot");
  const timezone = watch("timezone");

  // Preselect the visitor's own zone. Done post-mount (not in defaultValues)
  // since the browser's zone can differ from the server's — setting it during
  // SSR would desync the hydrated markup.
  useEffect(() => {
    setValue("timezone", detectTimezone(), { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function togglePackageType(value: string) {
    const current = form.getValues("package_types");
    const next = current.includes(value)
      ? current.filter((t) => t !== value)
      : [...current, value];
    setValue("package_types", next, { shouldValidate: false });
  }

  async function onSubmit(values: CallbackRequestFormValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/callback-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(toApiPayload(values)),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          for (const [field, messages] of Object.entries(
            data.errors as Record<string, string[]>,
          )) {
            const path = field === "package_type" ? "package_types" : field;
            form.setError(path as Path<CallbackRequestFormValues>, {
              type: "server",
              message: messages[0],
            });
          }
          setSubmitError("Please fix the highlighted fields and try again.");
        } else {
          setSubmitError(data.message || "Something went wrong. Please try again.");
        }
        return;
      }
      // The name goes to sessionStorage, never the URL (privacy).
      rememberThankYouName(values.contact.name);
      router.push("/thank-you?type=callback");
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={`mt-1.5 ${inputClass}`}
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
              className={`mt-1.5 ${inputClass}`}
              placeholder="Enter Email"
              {...register("contact.email")}
            />
            {isSubmitted && errors.contact?.email && (
              <p className={errorClass}>{errors.contact.email.message}</p>
            )}
          </div>
        </div>
        {/* grid-cols-1 explicitly for the base breakpoint — see the matching
            comment in quote-request-form.tsx for the full explanation: a
            bare `grid` with no defined column track lets the browser
            auto-size the single implicit column to content width instead
            of container width, overflowing the viewport on narrow screens. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,220px)_1fr]">
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
              className={`mt-1.5 ${inputClass}`}
              placeholder="Enter Phone Number"
              {...register("contact.phone")}
            />
            {isSubmitted && errors.contact?.phone && (
              <p className={errorClass}>{errors.contact.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className={labelClass}>Best time to call you back</label>
          <div className="flex items-center gap-2">
            <GlobeIcon size={15} className="shrink-0 text-ink-muted" />
            <div className="w-44">
              <Controller
                control={control}
                name="timezone"
                render={({ field }) => (
                  <SearchableSelect
                    options={timezoneOptions}
                    value={timezone}
                    onChange={field.onChange}
                    placeholder="Your timezone"
                    invalid={isSubmitted && !!errors.timezone}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {isSubmitted && errors.timezone && (
          <p className={errorClass}>{errors.timezone.message}</p>
        )}
        <div className="mt-2 grid grid-cols-3 gap-3">
          {CALLBACK_TIME_SLOTS.map((slot) => {
            const selected = timeSlot === slot.value;
            return (
              <button
                type="button"
                key={slot.value}
                onClick={() =>
                  setValue("time_slot", slot.value, { shouldValidate: false })
                }
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 bg-white px-4 py-5 text-center transition ${
                  selected ? "border-brand" : "border-brand-light"
                }`}
              >
                <ClockIcon
                  size={22}
                  className={selected ? "text-brand" : "text-ink-muted"}
                />
                <span className="text-sm font-semibold text-ink">{slot.label}</span>
                <span className="text-xs text-ink-muted">{slot.hint}</span>
              </button>
            );
          })}
        </div>
        {isSubmitted && errors.time_slot && (
          <p className={errorClass}>{errors.time_slot.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>What are you shipping?</label>
        <div className="mt-2 grid grid-cols-3 gap-3 md:grid-cols-5">
          {PACKAGE_TYPES.map((pt) => {
            const Icon = PACKAGE_CARD_ICON[pt.value];
            const selected = packageTypes.includes(pt.value);
            return (
              <button
                type="button"
                key={pt.value}
                onClick={() => togglePackageType(pt.value)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-4 text-center transition ${
                  selected ? "border-brand" : "border-brand-light"
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${selected ? "bg-brand text-white" : "bg-gray-100 text-ink-muted"}`}
                >
                  <Icon size={20} />
                </span>
                <span className="text-xs font-medium text-ink">{pt.label}</span>
              </button>
            );
          })}
        </div>
        {isSubmitted && errors.package_types && (
          <p className={errorClass}>{errors.package_types.message}</p>
        )}
      </div>

      {submitError && <p className={errorClass}>{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60 md:w-auto"
      >
        {isSubmitting ? "Submitting…" : "Request a callback"} <ArrowRightIcon size={14} />
      </button>
    </form>
  );
}
