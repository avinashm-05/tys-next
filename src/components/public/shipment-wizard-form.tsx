"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  useFieldArray,
  useForm,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { SearchableSelect } from "@/components/public/searchable-select";
import { PostalCodeInput } from "@/components/public/postal-code-input";
import {
  SHIPMENT_TYPES,
  STEP_FIELDS,
  shipmentWizardSchema,
  toApiPayload,
  type ShipmentWizardInput,
  type ShipmentWizardValues,
} from "@/lib/validation/shipment-wizard";

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({
  value: code,
  label: name,
  flag: code,
}));

// text-base (16px), not text-sm: iOS Safari auto-zooms the page on
// focusing any input under 16px — see searchable-select.tsx for the full
// failure mode.
const inputClass =
  "w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-base text-ink outline-none focus:border-brand disabled:bg-brand-pale disabled:text-ink-muted";
const labelClass = "block text-sm font-medium text-ink";
const errorClass = "mt-1 text-xs text-red-600";

const TABS = [
  { n: 1, label: "Schedule Pickup" },
  { n: 2, label: "Sender" },
  { n: 3, label: "Recipient" },
  { n: 4, label: "Package" },
] as const;

function emptyPartyValues() {
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

export function ShipmentWizardForm({ linkedQuoteId }: { linkedQuoteId?: number | null }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ShipmentWizardInput, unknown, ShipmentWizardValues>({
    resolver: zodResolver(shipmentWizardSchema),
    mode: "onSubmit",
    defaultValues: {
      shipment_type: "air",
      from_country: "US",
      to_country: "",
      sender: emptyPartyValues(),
      recipient: { ...emptyPartyValues(), location_type: "residential" },
      packages: [emptyPackageRow()],
    },
  });
  const { control, register, watch, setValue, trigger, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;
  const packages = useFieldArray({ control, name: "packages" });

  // Same fresh-render nudge the quote wizard uses so RHF's per-field
  // subscriptions repaint cleanly on step change.
  useEffect(() => {
    form.reset(form.getValues(), { keepValues: true, keepDirty: true, keepTouched: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function next() {
    const fields = STEP_FIELDS[step as keyof typeof STEP_FIELDS] as unknown as Path<ShipmentWizardInput>[];
    const valid = await trigger(fields);
    if (!valid) return;
    setStep((s) => Math.min(4, s + 1));
  }

  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function recalcRow(index: number) {
    const row = form.getValues(`packages.${index}`);
    const chargeable = calculateChargeableWeight(
      Number(row.weight) || 0,
      { length: Number(row.length) || 0, width: Number(row.width) || 0, height: Number(row.height) || 0 },
      "lb",
    );
    setValue(`packages.${index}.chargeable_weight`, Math.round(chargeable * 100) / 100);
  }

  async function onSubmit(values: ShipmentWizardValues) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/account/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(toApiPayload(values, linkedQuoteId)),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.message || "Something went wrong. Please try again.");
        return;
      }
      router.push("/account/shipments");
    } catch {
      setSubmitError("Network error. Please try again.");
    }
  }

  function PartyFields({ base }: { base: "sender" | "recipient" }) {
    const partyErrors = errors[base];
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Contact Name</label>
          <input className={`mt-1.5 ${inputClass}`} {...register(`${base}.contact_name`)} />
          {partyErrors?.contact_name && <p className={errorClass}>{partyErrors.contact_name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Company Name</label>
          <input className={`mt-1.5 ${inputClass}`} {...register(`${base}.company_name`)} />
        </div>
        <div>
          <label className={labelClass}>Country</label>
          <div className="mt-1.5">
            <Controller
              control={control}
              name={`${base}.country`}
              render={({ field }) => (
                <SearchableSelect
                  options={COUNTRY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Country"
                  invalid={!!partyErrors?.country}
                />
              )}
            />
          </div>
          {partyErrors?.country && <p className={errorClass}>{partyErrors.country.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Address Line 1</label>
          <input className={`mt-1.5 ${inputClass}`} {...register(`${base}.address_line_1`)} />
          {partyErrors?.address_line_1 && <p className={errorClass}>{partyErrors.address_line_1.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Address Line 2</label>
          <input className={`mt-1.5 ${inputClass}`} {...register(`${base}.address_line_2`)} />
        </div>
        <div>
          <label className={labelClass}>Zip Code</label>
          <div className="mt-1.5">
            <Controller
              control={control}
              name={`${base}.postal_code`}
              render={({ field }) => (
                <PostalCodeInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  countryCode={watch(`${base}.country`)}
                  placeholder="Zip Code"
                  invalid={!!partyErrors?.postal_code}
                />
              )}
            />
          </div>
          {partyErrors?.postal_code && <p className={errorClass}>{partyErrors.postal_code.message}</p>}
        </div>
        <div>
          <label className={labelClass}>City</label>
          <input className={`mt-1.5 ${inputClass}`} {...register(`${base}.city`)} />
          {partyErrors?.city && <p className={errorClass}>{partyErrors.city.message}</p>}
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input className={`mt-1.5 ${inputClass}`} {...register(`${base}.state`)} />
          {partyErrors?.state && <p className={errorClass}>{partyErrors.state.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone 1</label>
          <input className={`mt-1.5 ${inputClass}`} {...register(`${base}.phone_1`)} placeholder="+1 404 555 0100" />
          {partyErrors?.phone_1 && <p className={errorClass}>{partyErrors.phone_1.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone 2</label>
          <input className={`mt-1.5 ${inputClass}`} {...register(`${base}.phone_2`)} />
        </div>
        <div>
          <label className={labelClass}>Email Address</label>
          <input type="email" className={`mt-1.5 ${inputClass}`} {...register(`${base}.email`)} />
          {partyErrors?.email && <p className={errorClass}>{partyErrors.email.message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <h1 className="mb-6 text-2xl font-bold text-ink">Schedule Shipment</h1>

      <div className="rounded-2xl border border-brand-light bg-white">
        <div className="flex flex-wrap border-b border-brand-light">
          {TABS.map((t) => (
            <div
              key={t.n}
              className={`px-5 py-4 text-sm font-semibold ${
                step === t.n
                  ? "border-b-2 border-brand text-brand"
                  : "text-ink-muted"
              }`}
            >
              {t.label}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 md:p-8">
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Select Shipment Type</label>
                <div className="mt-1.5">
                  <Controller
                    control={control}
                    name="shipment_type"
                    render={({ field }) => (
                      <SearchableSelect
                        options={SHIPMENT_TYPES}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Shipment Type"
                        invalid={!!errors.shipment_type}
                      />
                    )}
                  />
                </div>
                {errors.shipment_type && <p className={errorClass}>{errors.shipment_type.message}</p>}
              </div>
              <div>
                <label className={labelClass}>From Country</label>
                <div className="mt-1.5">
                  <Controller
                    control={control}
                    name="from_country"
                    render={({ field }) => (
                      <SearchableSelect
                        options={COUNTRY_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="From Country"
                        invalid={!!errors.from_country}
                      />
                    )}
                  />
                </div>
                {errors.from_country && <p className={errorClass}>{errors.from_country.message}</p>}
              </div>
              <div>
                <label className={labelClass}>To Country</label>
                <div className="mt-1.5">
                  <Controller
                    control={control}
                    name="to_country"
                    render={({ field }) => (
                      <SearchableSelect
                        options={COUNTRY_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="To Country"
                        invalid={!!errors.to_country}
                      />
                    )}
                  />
                </div>
                {errors.to_country && <p className={errorClass}>{errors.to_country.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && <PartyFields base="sender" />}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <PartyFields base="recipient" />
              <div className="md:w-64">
                <label className={labelClass}>Location Type</label>
                <div className="mt-1.5">
                  <Controller
                    control={control}
                    name="recipient.location_type"
                    render={({ field }) => (
                      <SearchableSelect
                        options={[
                          { value: "residential", label: "Residential" },
                          { value: "commercial", label: "Commercial" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Location Type"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="overflow-x-auto rounded-xl border border-brand-light">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-brand-pale text-xs font-semibold text-ink-muted uppercase">
                    <tr>
                      <th className="px-3 py-2">No. of Pkgs</th>
                      <th className="px-3 py-2">Weight (lbs)</th>
                      <th className="px-3 py-2">Dimension (L × W × H in)</th>
                      <th className="px-3 py-2">Chargeable Wt</th>
                      <th className="px-3 py-2">Insured Val (USD)</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.fields.map((field, i) => (
                      <tr key={field.id} className="border-t border-brand-light">
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={1}
                            className={`w-20 ${inputClass}`}
                            {...register(`packages.${i}.quantity`, { valueAsNumber: true })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-24 ${inputClass}`}
                            {...register(`packages.${i}.weight`, { valueAsNumber: true, onChange: () => recalcRow(i) })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="L"
                              className={`w-16 ${inputClass}`}
                              {...register(`packages.${i}.length`, { valueAsNumber: true, onChange: () => recalcRow(i) })}
                            />
                            <span className="text-ink-muted">×</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="W"
                              className={`w-16 ${inputClass}`}
                              {...register(`packages.${i}.width`, { valueAsNumber: true, onChange: () => recalcRow(i) })}
                            />
                            <span className="text-ink-muted">×</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="H"
                              className={`w-16 ${inputClass}`}
                              {...register(`packages.${i}.height`, { valueAsNumber: true, onChange: () => recalcRow(i) })}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input disabled className={`w-20 ${inputClass}`} value={Number(watch(`packages.${i}.chargeable_weight`)) || 0} readOnly />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            className={`w-24 ${inputClass}`}
                            {...register(`packages.${i}.insured_value`, { valueAsNumber: true })}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => packages.remove(i)}
                            disabled={packages.fields.length === 1}
                            aria-label="Remove package"
                            className="text-red-500 disabled:opacity-30"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errors.packages?.message && <p className={errorClass}>{errors.packages.message}</p>}
              <button
                type="button"
                onClick={() => packages.append(emptyPackageRow())}
                className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand"
              >
                <PlusIcon size={16} weight="bold" />
                Add New Row
              </button>
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
                <ArrowLeftIcon size={14} /> Previous
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
  );
}
