"use client";

// C1.3 profile forms. Name/phone go to the dedicated PATCH /api/account/profile
// (customerRoute, session-scoped). Password change goes through Better Auth's
// change-password, which verifies the current password server-side. Email is
// read-only in v1.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { SearchableSelect } from "@/components/public/searchable-select";
import { FieldError } from "@/components/public/account/shell";

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
const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const ctaClass =
  "rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60";

async function readMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; errors?: Record<string, string[]> };
    if (data.errors) {
      const first = Object.values(data.errors)[0]?.[0];
      if (first) return first;
    }
    return data.message ?? `Request failed (${res.status}).`;
  } catch {
    return `Request failed (${res.status}).`;
  }
}

export type ProfileAddress = {
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export function ProfileForm({
  initialName,
  initialPhone,
  initialAddress,
  email,
}: {
  initialName: string;
  initialPhone: string;
  initialAddress: ProfileAddress;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // Debounced zip → city/state autofill, same pattern as the admin quote
  // editor's zip glance: fires once the code looks plausible, silently does
  // nothing for an unrecognized code (never overwrites with a wrong guess).
  // Skipped once the customer has already got both fields filled in and the
  // zip hasn't changed since — so it fills in gaps, it doesn't fight typing.
  const lastLookedUp = useRef<string | null>(null);
  useEffect(() => {
    const zip = address.postalCode.trim();
    const country = address.country.trim();
    const key = `${country}:${zip}`;
    if (!zip || !country || zip.length < 3 || key === lastLookedUp.current) return;

    const timer = setTimeout(() => {
      fetch(`/api/account/zip-lookup?zip=${encodeURIComponent(zip)}&country=${encodeURIComponent(country)}`)
        .then((r) => r.json())
        .then((data: { city: string | null; state: string | null }) => {
          lastLookedUp.current = key;
          if (!data.city) return;
          setAddress((prev) =>
            prev.postalCode.trim() === zip && prev.country.trim() === country
              ? { ...prev, city: data.city ?? prev.city, state: data.state ?? prev.state }
              : prev,
          );
        })
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [address.postalCode, address.country]);

  function field(key: keyof ProfileAddress) {
    return {
      value: address[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddress((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, phone, ...address }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        setError(await readMessage(res));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Name</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Email address</label>
        <input className={inputClass} value={email} disabled />
        <p className="m-0 mt-1 text-xs text-ink-muted">
          Your email links your quotes to this account and can&apos;t be changed here.
        </p>
      </div>
      <div>
        <label className={labelClass}>Phone number</label>
        <input
          type="tel"
          className={inputClass}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 404 555 0100"
        />
      </div>
      <div>
        <label className={labelClass}>Company Name</label>
        <input className={inputClass} {...field("companyName")} />
      </div>
      <div>
        <label className={labelClass}>Address Line 1</label>
        <input className={inputClass} {...field("addressLine1")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Address Line 2</label>
          <input className={inputClass} {...field("addressLine2")} />
        </div>
        <div>
          <label className={labelClass}>Address Line 3</label>
          <input className={inputClass} {...field("addressLine3")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Country</label>
          <SearchableSelect
            options={COUNTRY_OPTIONS}
            value={address.country}
            onChange={(v) => setAddress((prev) => ({ ...prev, country: v }))}
            placeholder="Select Country"
          />
        </div>
        <div>
          <label className={labelClass}>Zip Code</label>
          <input className={inputClass} {...field("postalCode")} placeholder="Zip / Postal code" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>City</label>
          <input className={inputClass} {...field("city")} />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input className={inputClass} {...field("state")} />
        </div>
      </div>
      <FieldError message={error} />
      {saved && (
        <p className="m-0 flex items-center gap-1.5 font-semibold text-green-600">
          <CheckCircleIcon size={16} />
          Profile saved.
        </p>
      )}
      <button type="submit" className={ctaClass} disabled={busy}>
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      // Better Auth verifies currentPassword server-side; other sessions are
      // revoked so a stolen session dies with the old password.
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
          revokeOtherSessions: true,
        }),
      });
      if (res.ok) {
        setDone(true);
        setCurrent("");
        setNext("");
        setConfirm("");
      } else if (res.status === 400 || res.status === 401) {
        setError("Your current password is incorrect.");
      } else {
        setError(await readMessage(res));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Current password</label>
        <input type="password" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>New password</label>
        <input type="password" className={inputClass} value={next} onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters" />
      </div>
      <div>
        <label className={labelClass}>Confirm new password</label>
        <input type="password" className={inputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <FieldError message={error} />
      {done && (
        <p className="m-0 flex items-center gap-1.5 font-semibold text-green-600">
          <CheckCircleIcon size={16} />
          Password updated.
        </p>
      )}
      <button type="submit" className={ctaClass} disabled={busy || !current || !next}>
        {busy ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
