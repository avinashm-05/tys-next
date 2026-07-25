"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSupportSchema, type ContactSupportInput } from "@/lib/validation/contact-support";
import { SearchableSelect } from "@/components/public/searchable-select";
import { DIAL_CODES } from "@/lib/dial-codes";

const DIAL_CODE_OPTIONS = DIAL_CODES.map(([code, dial, name]) => ({
  value: code,
  label: `${name} (${dial})`,
  flag: code,
  sublabel: dial,
}));
const DIAL_BY_ISO = new Map(DIAL_CODES.map(([code, dial]) => [code, dial]));

const inputClass =
  "w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand";
const labelClass = "block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-red-600";

export function ContactSupportForm() {
  const [countryCodeIso, setCountryCodeIso] = useState("US");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<ContactSupportInput>({
    resolver: zodResolver(contactSupportSchema),
    defaultValues: { name: "", email: "", country_code: "+1", phone: "", message: "", agree: undefined },
  });

  async function onSubmit(values: ContactSupportInput) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      reset();
      setCountryCodeIso("US");
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-brand-pale p-6 text-ink">
        <p className="font-semibold">Message sent — thank you.</p>
        <p className="mt-1 text-sm text-ink-muted">
          One of our logistics experts will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl">
      <div>
        <label className={labelClass}>Contact name</label>
        <input className={`mt-1.5 ${inputClass}`} placeholder="Enter name" {...register("name")} />
        {isSubmitted && errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div className="mt-5">
        <label className={labelClass}>Email Address</label>
        <input className={`mt-1.5 ${inputClass}`} placeholder="Enter Email Address" {...register("email")} />
        {isSubmitted && errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div className="mt-5">
        <label className={labelClass}>Phone number</label>
        <div className="mt-1.5 flex gap-2">
          <div className="w-40 shrink-0">
            <Controller
              control={control}
              name="country_code"
              render={({ field }) => (
                <SearchableSelect
                  options={DIAL_CODE_OPTIONS}
                  value={countryCodeIso}
                  onChange={(iso) => {
                    setCountryCodeIso(iso);
                    field.onChange(DIAL_BY_ISO.get(iso) ?? "");
                  }}
                  placeholder="Country"
                  invalid={isSubmitted && !!errors.country_code}
                />
              )}
            />
          </div>
          <input
            className={`flex-1 ${inputClass}`}
            placeholder="+1 (555) 000-0000"
            {...register("phone")}
          />
        </div>
        {isSubmitted && (errors.country_code || errors.phone) && (
          <p className={errorClass}>{errors.country_code?.message ?? errors.phone?.message}</p>
        )}
      </div>

      <div className="mt-5">
        <label className={labelClass}>Message</label>
        <textarea
          className={`mt-1.5 ${inputClass} min-h-32 resize-y`}
          placeholder="Leave us a message..."
          {...register("message")}
        />
        {isSubmitted && errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      <label className="mt-5 flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-brand-light text-brand focus:ring-brand"
          {...register("agree")}
        />
        You agree to our friendly privacy policy.
      </label>
      {isSubmitted && errors.agree && <p className={errorClass}>{errors.agree.message}</p>}

      {submitError && <p className={`${errorClass} mt-3`}>{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
