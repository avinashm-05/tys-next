"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Staff sign-in, Attio-style (2026-10-05): work email → a 6-digit code in
// that inbox → in. No password to remember. "Use a password instead" keeps
// the old way as a fallback (e.g. the code email is slow or in spam), and an
// account that turned on authenticator 2-step still gets that step there.

/** Laravel-shaped 422 body ({ message, errors }) — includes the login lockout. */
type ServerError = { status: number; message?: string; code?: string; errors?: Record<string, string[]> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 30;

function serverMessage(error: unknown, fallback: string): string {
  const e = error as ServerError;
  const field = e.errors ? Object.values(e.errors)[0]?.[0] : undefined;
  if (field) return field;
  if (e.status === 429) return "Too many tries. Wait a minute, then try again.";
  return fallback;
}

const title = "text-[22px] font-semibold tracking-tight text-foreground";
const sub = "mt-1.5 text-sm text-muted-foreground";
const primaryBtn = "h-11 w-full rounded-xl bg-tys-blue text-[15px] font-semibold text-white hover:bg-tys-blue/90";

export function LoginForm() {
  const [step, setStep] = useState<"email" | "code" | "password" | "totp">("email");
  const [email, setEmail] = useState("");

  if (step === "code") return <EmailCodeStep email={email} onBack={() => setStep("email")} />;
  if (step === "password")
    return <PasswordStep email={email} onBack={() => setStep("email")} onTwoStep={() => setStep("totp")} />;
  if (step === "totp") return <TotpStep onBack={() => setStep("password")} />;
  return (
    <EmailStep
      email={email}
      setEmail={setEmail}
      onCodeSent={() => setStep("code")}
      onUsePassword={() => setStep("password")}
    />
  );
}

function EmailStep({
  email,
  setEmail,
  onCodeSent,
  onUsePassword,
}: {
  email: string;
  setEmail: (v: string) => void;
  onCodeSent: () => void;
  onUsePassword: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL.test(value)) {
      setError("Enter your work email address.");
      return;
    }
    setBusy(true);
    setError(null);
    // Same answer for every address: only staff accounts actually get a
    // code, but the page never says which addresses are staff.
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: value, type: "sign-in" });
    setBusy(false);
    if (error) {
      setError(serverMessage(error, "We couldn't send a code. Try again."));
      return;
    }
    setEmail(value);
    onCodeSent();
  }

  return (
    <div>
      <div className="text-center">
        <h1 className={title}>Log in to TYS Admin</h1>
        <p className={sub}>Welcome back. Enter your work email to continue.</p>
      </div>
      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium text-foreground/80">
          Work email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="name@tysgloballogistics.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          className="h-11 rounded-xl bg-background text-[15px]"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className={primaryBtn}>
          <EnvelopeSimpleIcon size={17} weight="bold" />
          {busy ? "Sending code…" : "Continue with email"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <button type="button" onClick={onUsePassword} className="font-medium text-foreground/80 underline-offset-4 hover:underline">
          Use a password instead
        </button>
      </p>
    </div>
  );
}

/** Six boxes, paste-friendly, submits itself on the sixth digit. */
function CodeBoxes({ value, onChange, onComplete, disabled, invalid }: {
  value: string;
  onChange: (v: string) => void;
  onComplete: (v: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function setFrom(index: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) return;
    const next = (value.slice(0, index) + clean).slice(0, 6);
    onChange(next);
    refs.current[Math.min(next.length, 5)]?.focus();
    if (next.length === 6) onComplete(next);
  }

  return (
    <div className="flex justify-between gap-2" onPaste={(e) => {
      e.preventDefault();
      setFrom(0, e.clipboardData.getData("text"));
    }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          maxLength={6}
          onChange={(e) => setFrom(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              const cut = d ? i : Math.max(0, i - 1);
              onChange(value.slice(0, cut));
              refs.current[cut]?.focus();
            }
          }}
          className="h-14 w-full min-w-0 rounded-xl border border-input bg-background text-center text-2xl font-semibold text-foreground outline-none transition focus:border-tys-blue focus:ring-3 focus:ring-tys-blue/20 aria-invalid:border-destructive disabled:opacity-60"
        />
      ))}
    </div>
  );
}

function EmailCodeStep({ email, onBack }: { email: string; onBack: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function verify(otp: string) {
    setBusy(true);
    setError(null);
    const { error } = await authClient.signIn.emailOtp({ email, otp });
    if (!error) {
      // Full navigation so the server sees the fresh session cookie.
      window.location.assign("/admin");
      return;
    }
    setBusy(false);
    setCode("");
    const e = error as ServerError;
    setError(
      e.errors
        ? serverMessage(error, "")
        : e.code === "TOO_MANY_ATTEMPTS" || /too many/i.test(e.message ?? "")
          ? "Too many wrong tries for this code. Send a new one."
          : /expired/i.test(e.message ?? "")
            ? "This code expired. Send a new one."
            : serverMessage(error, "That code didn't match. Check the newest email and try again."),
    );
  }

  async function resend() {
    setError(null);
    setWait(RESEND_SECONDS);
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    if (error) setError(serverMessage(error, "We couldn't send a new code. Try again."));
  }

  return (
    <div>
      <div className="text-center">
        <h1 className={title}>Check your email</h1>
        <p className={sub}>
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. It expires in 10
          minutes.
        </p>
      </div>
      <form
        className="mt-8 flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === 6) void verify(code);
        }}
      >
        <CodeBoxes value={code} onChange={setCode} onComplete={(v) => void verify(v)} disabled={busy} invalid={!!error} />
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy || code.length < 6} className={primaryBtn}>
          {busy ? "Signing in…" : "Continue"}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Can&apos;t find it? Check your spam folder.{" "}
        {wait > 0 ? (
          <span>Send a new code in {wait}s</span>
        ) : (
          <button type="button" onClick={resend} className="font-medium text-foreground/80 underline-offset-4 hover:underline">
            Send a new code
          </button>
        )}
      </p>
      <BackLink onClick={onBack}>Use a different email</BackLink>
    </div>
  );
}

function PasswordStep({ email: initialEmail, onBack, onTwoStep }: { email: string; onBack: () => void; onTwoStep: () => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL.test(email.trim()) || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error } = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
    if (!error) {
      if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
        onTwoStep();
        return;
      }
      window.location.assign("/admin");
      return;
    }
    setBusy(false);
    setError(
      (error as ServerError).status === 401
        ? "These credentials do not match our records."
        : serverMessage(error, "Sign in failed. Try again."),
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className={title}>Log in with password</h1>
        <p className={sub}>For when the email code isn&apos;t arriving.</p>
      </div>
      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-3">
        <label htmlFor="pw-email" className="text-sm font-medium text-foreground/80">Work email</label>
        <Input
          id="pw-email"
          type="email"
          autoComplete="email"
          autoFocus={!initialEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl bg-background text-[15px]"
        />
        <div className="mt-1 flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-foreground/80">Password</label>
          <Link href="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus={!!initialEmail}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          className="h-11 rounded-xl bg-background text-[15px]"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? "Signing in…" : "Log in"}
        </Button>
      </form>
      <BackLink onClick={onBack}>Back to email code</BackLink>
    </div>
  );
}

/** Only for accounts that switched on authenticator 2-step (optional since 2026-10-05). */
function TotpStep({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState("");
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const value = code.trim();
    const { error } = backup
      ? await authClient.twoFactor.verifyBackupCode({ code: value })
      : await authClient.twoFactor.verifyTotp({ code: value.replace(/\s/g, "") });
    if (!error) {
      window.location.assign("/admin");
      return;
    }
    setBusy(false);
    setError(
      error.status === 401 && /expired|invalid two factor cookie/i.test(error.message ?? "")
        ? "This sign-in expired. Go back and enter your password again."
        : backup
          ? "That backup code didn't work. Each code works once."
          : "That code didn't match. Check your authenticator app and try the newest code.",
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className={title}>Enter your 2-step code</h1>
        <p className={sub}>
          {backup
            ? "Enter one of the backup codes you saved when you set up 2-step sign-in."
            : "Open your authenticator app and enter the 6-digit code for TYS Global Logistics."}
        </p>
      </div>
      <form onSubmit={verify} noValidate className="mt-8 flex flex-col gap-3">
        <Input
          id="code"
          autoFocus
          autoComplete="one-time-code"
          inputMode={backup ? "text" : "numeric"}
          maxLength={backup ? 32 : 7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={!!error}
          aria-label={backup ? "Backup code" : "6-digit code"}
          className="h-12 rounded-xl text-center text-lg tracking-[0.3em]"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy || code.trim().length < 6} className={primaryBtn}>
          {busy ? "Checking…" : "Verify and log in"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setBackup(!backup);
            setCode("");
            setError(null);
          }}
          className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {backup ? "Use the authenticator code" : "Lost your phone? Use a backup code"}
        </button>
      </form>
      <BackLink onClick={onBack}>Back</BackLink>
    </div>
  );
}

function BackLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <p className="mt-8 text-center">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeftIcon size={14} /> {children}
      </button>
    </p>
  );
}
