"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EnvelopeSimpleIcon,
  LockKeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";

async function post(path: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
}

// Book Shipment requires a TYS account. A successful login does a full
// navigation back to this same page (not a client-side route change) so the
// server component re-evaluates the session and renders the booking wizard
// instead of this gate. Same /api/auth/sign-in/email endpoint the
// /account/login form uses, just styled for this page.
export function BookShipmentLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setBusy(true);
    try {
      const res = await post("/api/auth/sign-in/email", { email, password });
      if (res.ok) {
        window.location.href = "/book-shipment";
        return;
      }
      if (res.status === 403) {
        setUnverified(true);
      } else if (res.status === 401) {
        setError("These credentials do not match our records.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <label className="block text-sm font-medium text-ink">Email Address</label>
      <div className="relative mt-1.5">
        <EnvelopeSimpleIcon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          autoComplete="email"
          // text-base (16px), not text-sm: iOS Safari auto-zooms the page on
          // focusing any input under 16px — see searchable-select.tsx for
          // the full failure mode.
          className="w-full rounded-full border border-brand-light bg-white py-3.5 pl-11 pr-4 text-base text-ink outline-none focus:border-brand"
        />
      </div>

      <label className="mt-5 block text-sm font-medium text-ink">Password</label>
      <div className="relative mt-1.5">
        <LockKeyIcon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          className="w-full rounded-full border border-brand-light bg-white py-3.5 pl-11 pr-11 text-base text-ink outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
        >
          {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>

      {unverified && (
        <p className="mt-3 text-sm text-red-600">
          Please verify your email before logging in — check your inbox for the link.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? "Logging In…" : "Log In"} <ArrowRightIcon size={16} weight="bold" />
      </button>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link href="/account/forgot-password" className="font-semibold text-brand hover:underline">
          Forgot Password?
        </Link>
        <Link href="/account/register" className="font-semibold text-brand hover:underline">
          Don&rsquo;t have an account?
        </Link>
      </div>
    </form>
  );
}
