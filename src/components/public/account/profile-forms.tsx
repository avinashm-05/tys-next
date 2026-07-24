"use client";

// C1.3 profile forms. Name/phone go to the dedicated PATCH /api/account/profile
// (customerRoute, session-scoped). Password change goes through Better Auth's
// change-password, which verifies the current password server-side. Email is
// read-only in v1.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldError } from "@/components/public/account/shell";

const field = "form-control";
const pill = "quote-wizard-input-group-pill";
const label = "quote-wizard-form-label";
const cta = "fillbttn fillbttn2";

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

export function ProfileForm({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, phone }),
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
    <form onSubmit={submit} noValidate>
      <div className="mb-3">
        <label className={label}>Name</label>
        <div className={pill}>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div className="mb-3">
        <label className={label}>Email address</label>
        <div className={pill} style={{ background: "#f8f9fa" }}>
          <input className={field} value={email} disabled />
        </div>
        <p className="text-muted m-0 mt-1" style={{ fontSize: "0.8rem" }}>
          Your email links your quotes to this account and can&apos;t be changed here.
        </p>
      </div>
      <div className="mb-3">
        <label className={label}>Phone number</label>
        <div className={pill}>
          <input
            type="tel"
            className={field}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 404 555 0100"
          />
        </div>
      </div>
      <FieldError message={error} />
      {saved && (
        <p className="m-0 mb-2" style={{ color: "#00a843", fontWeight: 600 }}>
          <i className="fa-solid fa-circle-check me-1"></i>Profile saved.
        </p>
      )}
      <button type="submit" className={cta} disabled={busy} style={{ border: "none" }}>
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
    <form onSubmit={submit} noValidate>
      <div className="mb-3">
        <label className={label}>Current password</label>
        <div className={pill}>
          <input type="password" className={field} value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
      </div>
      <div className="mb-3">
        <label className={label}>New password</label>
        <div className={pill}>
          <input type="password" className={field} value={next} onChange={(e) => setNext(e.target.value)} placeholder="At least 8 characters" />
        </div>
      </div>
      <div className="mb-3">
        <label className={label}>Confirm new password</label>
        <div className={pill}>
          <input type="password" className={field} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      </div>
      <FieldError message={error} />
      {done && (
        <p className="m-0 mb-2" style={{ color: "#00a843", fontWeight: 600 }}>
          <i className="fa-solid fa-circle-check me-1"></i>Password updated.
        </p>
      )}
      <button type="submit" className={cta} disabled={busy || !current || !next} style={{ border: "none" }}>
        {busy ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
