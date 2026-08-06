"use client";

import { useState, type FormEvent } from "react";
import { SearchableSelect } from "@/components/public/searchable-select";
import { COUNTRY_LIST } from "@/lib/countries-list";

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({ value: code, label: name, flag: code }));

const TABS = [
  { id: "card", label: "Credit Card" },
  { id: "bank", label: "Bank" },
  { id: "zelle", label: "Pay by Zelle" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// text-base (16px), not text-sm: iOS Safari auto-zooms the page on
// focusing any input under 16px — see searchable-select.tsx for the full
// failure mode.
const inputClass =
  "w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-base text-ink outline-none focus:border-brand";
const labelClass = "block text-sm font-medium text-ink";

// No payment gateway is wired up on this site (no Stripe/processor
// anywhere in the codebase) — these forms match the Figma design exactly,
// but submitting is an honest no-op rather than pretending to move money.
// Zelle's static instructions are the one real, working payment path here.
export function PaymentTabs() {
  const [tab, setTab] = useState<TabId>("card");
  const [country, setCountry] = useState("US");
  const [notice, setNotice] = useState<string | null>(null);

  function handleNoOpSubmit(e: FormEvent) {
    e.preventDefault();
    setNotice(
      "Online payment processing isn't live yet. Please use the Pay by Zelle details on this page, or contact us to arrange payment.",
    );
  }

  return (
    <div className="rounded-3xl bg-white shadow-[0_2px_16px_rgba(16,24,40,0.04)]">
      <div className="flex rounded-t-3xl bg-gray-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setNotice(null);
            }}
            className={`flex-1 border-b-2 px-4 py-5 text-center text-sm font-bold sm:text-base ${
              tab === t.id ? "border-brand text-brand" : "border-transparent text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10">
        {tab === "card" && (
          <form onSubmit={handleNoOpSubmit} autoComplete="off">
            <h2 className="text-lg font-bold text-ink">Billing Details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="First Name" placeholder="Enter First Name" required />
              <Field label="Last Name" placeholder="Enter Last Name" required />
              <Field label="Tracking Number" placeholder="Enter Tracking Number" />
              <Field label="Street Address" placeholder="Enter Address" required />
              <div>
                <label className={labelClass}>Country</label>
                <div className="mt-1.5">
                  <SearchableSelect options={COUNTRY_OPTIONS} value={country} onChange={setCountry} />
                </div>
              </div>
              <Field label="Zip Code" placeholder="Enter Zip Code" required />
              <Field label="City" placeholder="Enter City" required />
              <Field label="State" placeholder="State" required />
            </div>
            <div className="mt-5">
              <Field label="Invoice Amount" placeholder="Enter Invoice Amount USD" />
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-brand py-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
            >
              Pay Now
            </button>
            {notice && <p className="mt-4 text-sm text-ink-muted">{notice}</p>}
          </form>
        )}

        {tab === "bank" && (
          <form onSubmit={handleNoOpSubmit} autoComplete="off">
            <h2 className="text-lg font-bold text-ink">Contact Details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Name" placeholder="Enter Name" required />
              <Field label="Number" placeholder="Enter Number" />
              <Field label="Email Address" placeholder="Enter Email Address" type="email" required />
              <Field label="Tracking Number" placeholder="Enter Tracking Number" />
            </div>

            <h2 className="mt-8 text-lg font-bold text-ink">Payment Details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Name on Bank Account(*)" placeholder="Enter Name on Bank Account(*)" required />
              <Field label="Bank Name" placeholder="Enter Bank Name" required />
              <Field label="Account Number" placeholder="Enter Account Number" required />
              <Field label="Routing Number" placeholder="Enter Routing Number" required />
            </div>
            <div className="mt-5">
              <Field label="Invoice Amount" placeholder="Enter Invoice Amount USD" />
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-brand py-4 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
            >
              Send
            </button>
            {notice && <p className="mt-4 text-sm text-ink-muted">{notice}</p>}
          </form>
        )}

        {tab === "zelle" && (
          <div>
            <p className="text-ink-muted">
              Pay securely with Zelle using your registered email address or phone number. Simply use
              the payment details below to transfer funds directly to TYS Global Logistics.
            </p>
            <div className="mt-6 flex flex-col gap-3 border-y border-brand-light py-5 sm:flex-row sm:justify-between">
              <p className="text-sm text-ink">
                <span className="font-bold">Zelle Email :</span> pay@tysgloballogistic.com
              </p>
              <p className="text-sm text-ink">
                <span className="font-bold">Zelle Name :</span> Tys Global Logistic LLC
              </p>
            </div>
            <div className="mt-6 rounded-xl bg-amber-300 px-5 py-4 text-sm text-ink">
              <span className="font-bold">Note: </span>
              Please mention your shipment tracking number in Memo Field when sending payment via
              zelle.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input type={type} placeholder={placeholder} required={required} className={`mt-1.5 ${inputClass}`} />
    </div>
  );
}
