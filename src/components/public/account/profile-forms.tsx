"use client";

// Customer profile (2026-09-30 redesign). Details + saved address are one
// form (PATCH /api/account/profile, session-scoped, closed field list) with
// one Save. Sign-in & security is its own panel: change password (Better
// Auth checks the current one and signs out other devices), or SET one for
// Google/Microsoft-only accounts (/api/account/password), sign out other
// devices, and which sign-in methods are linked. Email stays read-only: it
// links the customer's quotes and would need re-verification to change.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  DevicesIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  LockKeyIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { SearchableSelect } from "@/components/public/searchable-select";

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({ value: code, label: name, flag: code }));

// Same high-contrast wells as the booking form.
const wellBase = "block min-w-0 rounded-2xl bg-white px-4 pb-2 pt-2 text-left ring-inset transition focus-within:ring-2 focus-within:ring-brand";
const well = (invalid?: boolean) =>
  `${wellBase} ${invalid ? "ring-2 ring-red-500 bg-[#FFF7F7]" : "ring-[1.5px] ring-[#AEBBCD] hover:ring-[#7F8FA6]"}`;
const lockedWell = "block min-w-0 rounded-2xl bg-[#F4F6F9] px-4 pb-2 pt-2 ring-[1.5px] ring-inset ring-[#E3E7ED]";
const wellLabel = "block text-[13px] font-semibold text-[#2B3445]";
const bareInput =
  "mt-0.5 w-full min-w-0 bg-transparent py-0.5 text-[16px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-[#6B778A]";
const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[14.5px] font-semibold text-white shadow-[0_10px_20px_-12px_rgba(3,100,255,0.9)] transition hover:bg-brand-dark disabled:opacity-60";
const ghostBtn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[14px] font-semibold text-ink ring-[1.5px] ring-inset ring-[#DCE0E6] transition hover:bg-[#F2F4F7] disabled:opacity-60";

async function readMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; errors?: Record<string, string[]> };
    const first = data.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    return first ?? data.message ?? `Request failed (${res.status}).`;
  } catch {
    return `Request failed (${res.status}).`;
  }
}

function Note({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  return tone === "ok" ? (
    <p className="flex items-center gap-1.5 text-[14px] font-semibold text-[#15803D]">
      <CheckCircleIcon size={17} weight="fill" /> {children}
    </p>
  ) : (
    <p className="flex items-center gap-1.5 text-[14px] font-medium text-red-700">
      <WarningCircleIcon size={17} /> {children}
    </p>
  );
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
  const dirty =
    name !== initialName || phone !== initialPhone || JSON.stringify(address) !== JSON.stringify(initialAddress);

  // Debounced zip → city/state autofill (fills gaps, never fights typing).
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
              ? { ...prev, city: prev.city || data.city || "", state: prev.state || data.state || "" }
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
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaved(false);
        setAddress((prev) => ({ ...prev, [key]: e.target.value }));
      },
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!name.trim()) return setError("Please enter your name.");
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
    <form onSubmit={submit} noValidate className="overflow-hidden rounded-2xl border border-[#E3E7ED] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="border-b border-[#EEF0F3] px-5 py-3.5 md:px-6">
        <h2 className="text-[15px] font-semibold text-ink">Your details</h2>
        <p className="text-[13.5px] text-[#5B6472]">Used to pre-fill the Sender step when you book.</p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 p-5 sm:grid-cols-2 md:p-6 [&>*]:min-w-0">
        <label className={well(!name.trim() && !!error)}>
          <span className={wellLabel}>Full name</span>
          <input className={bareInput} autoComplete="name" value={name} onChange={(e) => { setSaved(false); setName(e.target.value); }} />
        </label>
        <label className={well()}>
          <span className={wellLabel}>Phone</span>
          <input className={bareInput} type="tel" autoComplete="tel" placeholder="+1 404 555 0100" value={phone} onChange={(e) => { setSaved(false); setPhone(e.target.value); }} />
        </label>
        <div className={`${lockedWell} sm:col-span-2`} title="Your email links your quotes to this account">
          <span className={wellLabel}>Email</span>
          <span className="mt-0.5 flex items-center gap-2 truncate py-0.5 text-[16px] font-medium text-[#3A4353]">
            <LockKeyIcon size={15} className="shrink-0 text-[#8A94A6]" /> {email}
          </span>
        </div>
        <label className={`${well()} sm:col-span-2`}>
          <span className={wellLabel}>Company</span>
          <input className={bareInput} autoComplete="organization" placeholder="Optional" {...field("companyName")} />
        </label>
      </div>

      <div className="border-y border-[#EEF0F3] bg-[#FAFBFC] px-5 py-3.5 md:px-6">
        <h2 className="text-[15px] font-semibold text-ink">Saved address</h2>
        <p className="text-[13.5px] text-[#5B6472]">Where we usually pick up from.</p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 p-5 sm:grid-cols-2 lg:grid-cols-3 md:p-6 [&>*]:min-w-0">
        <label className={`${well()} sm:col-span-2`}>
          <span className={wellLabel}>Street address</span>
          <input className={bareInput} autoComplete="address-line1" placeholder="House number and street" {...field("addressLine1")} />
        </label>
        <label className={well()}>
          <span className={wellLabel}>Apt, suite, floor</span>
          <input className={bareInput} autoComplete="address-line2" placeholder="Optional" {...field("addressLine2")} />
        </label>
        <div className={well()} data-select-anchor>
          <span className={wellLabel}>Country</span>
          <SearchableSelect
            options={COUNTRY_OPTIONS}
            value={address.country}
            onChange={(v) => {
              setSaved(false);
              setAddress((prev) => ({ ...prev, country: v }));
            }}
            label="Country"
            placeholder="Select country"
            bare
          />
        </div>
        <label className={well()}>
          <span className={wellLabel}>Zip / postal code</span>
          <input className={bareInput} autoComplete="postal-code" {...field("postalCode")} />
        </label>
        <div className="grid grid-cols-2 gap-2.5 [&>*]:min-w-0">
          <label className={well()}>
            <span className={wellLabel}>City</span>
            <input className={bareInput} autoComplete="address-level2" {...field("city")} />
          </label>
          <label className={well()}>
            <span className={wellLabel}>State</span>
            <input className={bareInput} autoComplete="address-level1" {...field("state")} />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF0F3] px-5 py-3.5 md:px-6">
        <div className="min-h-[22px]">
          {error ? <Note tone="error">{error}</Note> : saved ? <Note tone="ok">Saved.</Note> : dirty ? <span className="text-[13.5px] text-[#5B6472]">You have unsaved changes.</span> : null}
        </div>
        <button type="submit" className={primaryBtn} disabled={busy || !dirty}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function PasswordInput({ label, value, onChange, autoComplete }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className={well()}>
      <span className={wellLabel}>{label}</span>
      <span className="flex items-center gap-2">
        <input className={bareInput} type={show ? "text" : "password"} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="shrink-0 text-[#6B778A] hover:text-ink">
          {show ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </span>
    </label>
  );
}

/** 0–4, shown as a bar. Length does most of the work; variety adds a little. */
function strength(p: string) {
  if (!p) return 0;
  let s = p.length >= 8 ? 1 : 0;
  if (p.length >= 12) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(4, s);
}
const STRENGTH = ["Too short", "Weak", "Okay", "Good", "Strong"];

function PasswordForm({ hasPassword, onDone }: { hasPassword: boolean; onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const score = strength(next);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 8) return setError("Use at least 8 characters.");
    if (next !== confirm) return setError("The two new passwords don't match.");
    setBusy(true);
    try {
      const res = hasPassword
        ? await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            // Other devices are signed out, so a stolen session dies with the old password.
            body: JSON.stringify({ currentPassword: current, newPassword: next, revokeOtherSessions: true }),
          })
        : await fetch("/api/account/password", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ newPassword: next }),
          });
      if (res.ok) return onDone();
      setError(hasPassword && (res.status === 400 || res.status === 401) ? "Your current password is incorrect." : await readMessage(res));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-2.5">
      {hasPassword && <PasswordInput label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />}
      <PasswordInput label="New password" value={next} onChange={setNext} autoComplete="new-password" />
      {next && (
        <div className="px-1">
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-1.5 rounded-full ${i <= score ? (score <= 1 ? "bg-red-500" : score === 2 ? "bg-amber-500" : "bg-[#16A34A]") : "bg-[#E3E7ED]"}`} />
            ))}
          </div>
          <p className="mt-1 text-[12.5px] text-[#5B6472]">{STRENGTH[score]}. Longer is stronger: try a short sentence.</p>
        </div>
      )}
      <PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      {error && <Note tone="error">{error}</Note>}
      <button type="submit" className={`${primaryBtn} mt-1`} disabled={busy || !next || (hasPassword && !current)}>
        {busy ? "Saving…" : hasPassword ? "Update password" : "Set password"}
      </button>
    </form>
  );
}

export function SecurityPanel({
  hasPassword,
  providers,
  memberSince,
}: {
  hasPassword: boolean;
  /** Linked social providers, e.g. ["google"]. */
  providers: string[];
  memberSince: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  async function signOutOthers() {
    setRevoking(true);
    setDone(null);
    try {
      const res = await fetch("/api/auth/revoke-other-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      setDone(res.ok ? "Signed out of every other device." : "Couldn't do that just now. Please try again.");
    } finally {
      setRevoking(false);
    }
  }

  const methods = [
    { key: "credential", label: "Email and password", on: hasPassword, icon: EnvelopeSimpleIcon },
    { key: "google", label: "Google", on: providers.includes("google"), icon: KeyIcon },
    { key: "microsoft", label: "Microsoft", on: providers.includes("microsoft"), icon: KeyIcon },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E3E7ED] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="border-b border-[#EEF0F3] px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <LockKeyIcon size={17} weight="duotone" className="text-brand" /> Sign-in &amp; security
        </h2>
        {memberSince && <p className="text-[13.5px] text-[#5B6472]">Customer since {memberSince}</p>}
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="mb-2 text-[13px] font-semibold text-[#2B3445]">Ways you can sign in</p>
          <ul className="flex flex-col gap-1.5">
            {methods.map((m) => (
              <li key={m.key} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FA] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[14px] font-medium text-ink">
                  <m.icon size={16} className="text-[#6B778A]" /> {m.label}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${m.on ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#EEF0F3] text-[#6B778A]"}`}>
                  {m.on ? "On" : "Not linked"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[12.5px] leading-snug text-[#5B6472]">Google and Microsoft link automatically the first time you use them with this email.</p>
        </div>

        <div className="border-t border-[#EEF0F3] pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-[#2B3445]">Password</p>
            {!editing && (
              <button type="button" className={ghostBtn} onClick={() => { setEditing(true); setDone(null); }}>
                {hasPassword ? "Change" : "Set a password"}
              </button>
            )}
          </div>
          {!editing && (
            <p className="text-[13.5px] text-[#5B6472]">
              {hasPassword ? "Changing it signs you out everywhere else." : "You sign in with Google or Microsoft. Add a password to sign in with your email too."}
            </p>
          )}
          {editing && (
            <PasswordForm
              hasPassword={hasPassword}
              onDone={() => {
                setEditing(false);
                setDone(hasPassword ? "Password updated. Other devices were signed out." : "Password set. You can now sign in with your email too.");
                router.refresh();
              }}
            />
          )}
        </div>

        <div className="border-t border-[#EEF0F3] pt-4">
          <p className="text-[13px] font-semibold text-[#2B3445]">Other devices</p>
          <p className="mt-0.5 text-[13.5px] text-[#5B6472]">Signed in on a shared or lost computer? End those sessions.</p>
          <button type="button" className={`${ghostBtn} mt-2`} onClick={signOutOthers} disabled={revoking}>
            <DevicesIcon size={16} /> {revoking ? "Signing out…" : "Sign out other devices"}
          </button>
        </div>
        {done && <Note tone="ok">{done}</Note>}
      </div>
    </section>
  );
}
