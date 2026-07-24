"use client";

// Customer auth forms (C1.1) — plain fetches against the shared /api/auth
// endpoints. Public styling only. The server forces role="user" on signup and
// requires email verification before sign-in; these forms just surface those
// flows.

import { useState } from "react";
import { FieldError } from "@/components/public/account/shell";

type Errors = Record<string, string>;

async function post(path: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
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

const field = "form-control";
const pill = "quote-wizard-input-group-pill";
const label = "quote-wizard-form-label";
const cta = "fillbttn fillbttn2 w-100 mt-3";

export function RegisterForm() {
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
        <p className="fw-bold mb-2">
          <i className="fa-solid fa-envelope-circle-check me-2"></i>Check your inbox
        </p>
        <p className="m-0">
          We sent a verification link to <strong>{email}</strong>. Click it to activate your
          account, then <a href="/account/login">log in</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-3">
        <label className={label}>Name</label>
        <div className={pill}>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <FieldError message={errors.name} />
      </div>
      <div className="mb-3">
        <label className={label}>Email address</label>
        <div className={pill}>
          <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <FieldError message={errors.email} />
      </div>
      <div className="mb-3">
        <label className={label}>Password</label>
        <div className={pill}>
          <input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        <FieldError message={errors.password} />
      </div>
      <div className="mb-3">
        <label className={label}>Confirm password</label>
        <div className={pill}>
          <input type="password" className={field} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        </div>
        <FieldError message={errors.confirm} />
      </div>
      <FieldError message={errors.form} />
      <button type="submit" className={cta} disabled={busy} style={{ border: "none" }}>
        {busy ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center mt-3 mb-0">
        Already registered? <a href="/account/login">Log in</a>
      </p>
    </form>
  );
}

export function LoginForm({ verified }: { verified: boolean }) {
  const [email, setEmail] = useState("");
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
      const res = await post("/api/auth/sign-in/email", { email, password });
      if (res.ok) {
        window.location.href = "/account";
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

  async function resend() {
    setBusy(true);
    try {
      await post("/api/auth/send-verification-email", {
        email,
        callbackURL: "/account/login?verified=1",
      });
      setResent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {verified && (
        <p className="fw-bold" style={{ color: "#00a843" }}>
          <i className="fa-solid fa-circle-check me-2"></i>Email verified — you can log in now.
        </p>
      )}
      <div className="mb-3">
        <label className={label}>Email address</label>
        <div className={pill}>
          <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
      </div>
      <div className="mb-3">
        <label className={label}>Password</label>
        <div className={pill}>
          <input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        </div>
      </div>
      <FieldError message={error} />
      {unverified && (
        <div className="quote-wizard-error-message" style={{ display: "block" }}>
          <p className="m-0">
            <i className="fa-solid fa-circle-exclamation me-1"></i>Your email isn&apos;t verified
            yet.{" "}
            {resent ? (
              <strong>Verification email sent — check your inbox.</strong>
            ) : (
              <button
                type="button"
                onClick={resend}
                disabled={busy}
                style={{ background: "none", border: "none", padding: 0, textDecoration: "underline", cursor: "pointer", color: "inherit", font: "inherit" }}
              >
                Resend the verification email
              </button>
            )}
          </p>
        </div>
      )}
      <button type="submit" className={cta} disabled={busy} style={{ border: "none" }}>
        {busy ? "Signing in…" : "Log in"}
      </button>
      <p className="text-center mt-3 mb-0">
        <a href="/account/forgot-password">Forgot password?</a> ·{" "}
        <a href="/account/register">Create an account</a>
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
      <p className="m-0">
        If an account exists for <strong>{email}</strong>, a verification link is on its way.
      </p>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-3">
        <label className={label}>Email address</label>
        <div className={pill}>
          <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
      </div>
      <button type="submit" className={cta} disabled={busy || !email.trim()} style={{ border: "none" }}>
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
      <p className="m-0">
        If an account exists for <strong>{email}</strong>, a password-reset link is on its way.
      </p>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-3">
        <label className={label}>Email address</label>
        <div className={pill}>
          <input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
      </div>
      <button type="submit" className={cta} disabled={busy || !email.trim()} style={{ border: "none" }}>
        {busy ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center mt-3 mb-0">
        <a href="/account/login">Back to login</a>
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
      <p className="m-0">
        This reset link is invalid or incomplete.{" "}
        <a href="/account/forgot-password">Request a new one</a>.
      </p>
    );
  }
  if (done) {
    return (
      <p className="m-0">
        <i className="fa-solid fa-circle-check me-2" style={{ color: "#00a843" }}></i>
        Password updated. <a href="/account/login">Log in with your new password</a>.
      </p>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-3">
        <label className={label}>New password</label>
        <div className={pill}>
          <input type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
      </div>
      <div className="mb-3">
        <label className={label}>Confirm new password</label>
        <div className={pill}>
          <input type="password" className={field} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
        </div>
      </div>
      <FieldError message={error} />
      <button type="submit" className={cta} disabled={busy} style={{ border: "none" }}>
        {busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
