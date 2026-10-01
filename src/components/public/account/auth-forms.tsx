"use client";

// Customer auth forms (C1.1) — plain fetches against the shared /api/auth
// endpoints. Public styling only. The server forces role="user" on signup and
// requires email verification before sign-in; these forms just surface those
// flows.

import { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, EnvelopeSimpleIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { FieldError } from "@/components/public/account/shell";
import { SocialSignIn, type SocialProvider } from "@/components/public/account/social-sign-in";

type Errors = Record<string, string>;

async function post(path: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(path, {
    method: "POST",
    // Marks the customer sign-in forms, so staff accounts are refused
    // here (see api/auth route) instead of landing on a 404.
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-TYS-Portal": "customer" },
    body: JSON.stringify(body),
  });
}

async function readMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; errors?: Record<string, string[]> };
    return data.errors?.email?.[0] ?? data.message ?? `Request failed (${res.status}).`;
  } catch {
    return `Request failed (${res.status}).`;
  }
}

// text-base (16px), not text-sm: iOS Safari auto-zooms the page on
// focusing any input under 16px — see searchable-select.tsx for the full
// failure mode.
// Same high-contrast fields as the quote wizard (2026-09-30): a firm
// slate outline, bold dark labels, 16px+ text. text-base+ also stops iOS
// Safari zooming the page on focus (see searchable-select.tsx).
const inputClass =
  "w-full rounded-2xl bg-white px-4 py-3.5 text-[16px] font-medium text-ink outline-none ring-[1.5px] ring-inset ring-[#AEBBCD] transition placeholder:font-normal placeholder:text-[#6B778A] hover:ring-[#7F8FA6] focus:ring-2 focus:ring-brand disabled:bg-[#F3F6FA] disabled:text-ink-muted";
const labelClass = "mb-1.5 block px-1 text-[14px] font-semibold text-[#2B3445]";
const ctaClass =
  "mt-2 flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 text-center text-[15px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(3,100,255,0.8)] transition hover:bg-brand-dark disabled:opacity-60";

export function RegisterForm({ socialProviders = [] }: { socialProviders?: SocialProvider[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const res = await post("/api/auth/sign-up/email", { name, email, password });
      if (res.ok) setDone(true);
      else setErrors({ form: await readMessage(res) });
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div>
        <p className="mb-2 flex items-center gap-2 font-semibold text-ink">
          <EnvelopeSimpleIcon size={18} />
          Check your inbox
        </p>
        <p className="m-0 text-sm text-ink-muted">
          We sent a verification link to <strong className="text-ink">{email}</strong>. Click it
          to activate your account, then{" "}
          <Link href="/account/login" className="font-medium text-brand hover:underline">
            log in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Name</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <FieldError message={errors.name} />
      </div>
      <div>
        <label className={labelClass}>Email address</label>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <FieldError message={errors.email} />
      </div>
      <div>
        <label className={labelClass}>Password</label>
        <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        <FieldError message={errors.password} />
      </div>
      <div>
        <label className={labelClass}>Confirm password</label>
        <input type="password" className={inputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        <FieldError message={errors.confirm} />
      </div>
      <FieldError message={errors.form} />
      <button type="submit" className={ctaClass} disabled={busy}>
        {busy ? "Creating account…" : "Create account"}
      </button>
      <SocialSignIn providers={socialProviders} />
      <p className="m-0 text-center text-sm text-ink-muted">
        Already registered?{" "}
        <Link href="/account/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function LoginForm({
  verified,
  socialError = false,
  socialProviders = [],
  redirectTo = "/account",
}: {
  verified: boolean;
  socialError?: boolean;
  socialProviders?: SocialProvider[];
  /** Where a successful sign-in lands (Book now → /account/schedule). */
  redirectTo?: string;
}) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setBusy(true);
    try {
      // Email only (owner, 2026-10-01): usernames still exist server-side
      // but aren't part of the customer experience any more.
      const res = await post("/api/auth/sign-in/email", { email: identifier, password });
      if (res.ok) {
        window.location.assign(redirectTo);
        return;
      }
      if (res.status === 403) {
        // requireEmailVerification: correct password, unverified email.
        setUnverified(true);
      } else if (res.status === 401) {
        setError("These credentials do not match our records.");
      } else {
        setError(await readMessage(res));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // Only reachable when they typed an email — see the unverified block below.
  // Signing in by handle gives us no address to send to, and the endpoint
  // needs a real one.
  async function resend() {
    setBusy(true);
    try {
      await post("/api/auth/send-verification-email", {
        email: identifier,
        callbackURL: "/account/login?verified=1",
      });
      setResent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {socialError && (
        <p className="m-0 flex items-start gap-2 text-sm text-red-600">
          <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
          <span>
            That sign-in didn&apos;t go through. If you already have an account with this email,
            log in with your password.
          </span>
        </p>
      )}
      {verified && (
        <p className="m-0 flex items-center gap-2 font-semibold text-green-600">
          <CheckCircleIcon size={18} />
          Email verified. You can log in now.
        </p>
      )}
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          className={inputClass}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className={labelClass}>Password</label>
        <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      </div>
      <FieldError message={error} />
      {unverified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="m-0 flex items-start gap-1.5">
            <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
            <span>
              Your email isn&apos;t verified yet.{" "}
              {resent ? (
                <strong>Verification email sent. Check your inbox.</strong>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  disabled={busy}
                  className="font-medium underline disabled:opacity-60"
                >
                  Resend the verification email
                </button>
              )}
            </span>
          </p>
        </div>
      )}
      <button type="submit" className={ctaClass} disabled={busy}>
        {busy ? "Signing in…" : "Log in"}
      </button>
      <SocialSignIn providers={socialProviders} callbackURL={redirectTo} />
      <p className="m-0 text-center text-sm text-ink-muted">
        <Link href="/account/forgot-password" className="font-medium text-brand hover:underline">
          Forgot password?
        </Link>{" "}
        ·{" "}
        <Link href="/account/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await post("/api/auth/send-verification-email", {
        email,
        callbackURL: "/account/login?verified=1",
      });
      setSent(true); // neutral either way — no account enumeration
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <p className="m-0 text-sm text-ink-muted">
        If an account exists for <strong className="text-ink">{email}</strong>, a verification
        link is on its way.
      </p>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Email address</label>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <button type="submit" className={ctaClass} disabled={busy || !email.trim()}>
        {busy ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await post("/api/auth/request-password-reset", {
        email,
        redirectTo: "/account/reset-password",
      });
    } finally {
      // Always neutral (anti-enumeration) — same posture as the admin flow.
      setSent(true);
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <p className="m-0 text-sm text-ink-muted">
        If an account exists for <strong className="text-ink">{email}</strong>, a password-reset
        link is on its way.
      </p>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Email address</label>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <button type="submit" className={ctaClass} disabled={busy || !email.trim()}>
        {busy ? "Sending…" : "Send reset link"}
      </button>
      <p className="m-0 text-center text-sm text-ink-muted">
        <Link href="/account/login" className="font-medium text-brand hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setError(null);
    setBusy(true);
    try {
      const res = await post("/api/auth/reset-password", { newPassword: password, token });
      if (res.ok) setDone(true);
      else setError(await readMessage(res));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <p className="m-0 text-sm text-ink-muted">
        This reset link is invalid or incomplete.{" "}
        <Link href="/account/forgot-password" className="font-medium text-brand hover:underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }
  if (done) {
    return (
      <p className="m-0 flex items-center gap-2 text-sm text-ink-muted">
        <CheckCircleIcon size={18} className="text-green-600" />
        Password updated.{" "}
        <Link href="/account/login" className="font-medium text-brand hover:underline">
          Log in with your new password
        </Link>
        .
      </p>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>New password</label>
        <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </div>
      <div>
        <label className={labelClass}>Confirm new password</label>
        <input type="password" className={inputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
      </div>
      <FieldError message={error} />
      <button type="submit" className={ctaClass} disabled={busy}>
        {busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
