"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Staff sign-in (2026-10-05): Attio-style screens, standard 2-step flow:
// work email + password → a 6-digit code emailed to them → in. The code is
// only sent after the password is right, so a stranger typing a staff email
// gets nothing. Staff who set up an authenticator app earlier can use it
// instead of the email code.

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
const inputCls = "h-11 rounded-xl bg-background text-[15px]";

export function LoginForm() {
  const [step, setStep] = useState<"password" | "code" | "totp">("password");
  const [email, setEmail] = useState("");
  const [hasApp, setHasApp] = useState(false);

  if (step === "code")
    return <EmailCodeStep email={email} hasApp={hasApp} onUseApp={() => setStep("totp")} onBack={() => setStep("password")} />;
  if (step === "totp") return <TotpStep onBack={() => setStep("code")} />;
  return (
    <PasswordStep
      email={email}
      setEmail={setEmail}
      onTwoStep={(methods) => {
        setHasApp(methods.includes("totp"));
        setStep("code");
      }}
    />
  );
}

function PasswordStep({
  email,
  setEmail,
  onTwoStep,
}: {
  email: string;
  setEmail: (v: string) => void;
  onTwoStep: (methods: string[]) => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL.test(value) || !password) {
      setError("Enter your work email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error } = await authClient.signIn.email({ email: value, password });
    if (!error) {
      const d = data as { twoFactorRedirect?: boolean; twoFactorMethods?: string[] } | null;
      if (d?.twoFactorRedirect) {
        setEmail(value);
        onTwoStep(d.twoFactorMethods ?? []);
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
        <h1 className={title}>Log in to TYS Admin</h1>
        <p className={sub}>Welcome back. Sign in with your work email.</p>
      </div>
      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium text-foreground/80">Work email</label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="name@tysgloballogistics.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
          className={inputCls}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className={`${primaryBtn} mt-1`}>
          {busy ? "Checking…" : "Continue"}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        For your security, we&apos;ll email you a 6-digit code next.
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

function EmailCodeStep({ email, hasApp, onUseApp, onBack }: { email: string; hasApp: boolean; onUseApp: () => void; onBack: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const sentOnce = useRef(false);

  async function send() {
    setError(null);
    setWait(RESEND_SECONDS);
    const { error } = await authClient.twoFactor.sendOtp();
    if (error) {
      setError(
        error.status === 401
          ? "This sign-in expired. Go back and enter your password again."
          : serverMessage(error, "We couldn't send the code. Try again."),
      );
      return;
    }
    setSent(true);
  }

  // The code goes out as soon as this step opens (the password was right).
  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    void send();
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function verify(otp: string) {
    setBusy(true);
    setError(null);
    const { error } = await authClient.twoFactor.verifyOtp({ code: otp });
    if (!error) {
      // Full navigation so the server sees the fresh session cookie.
      window.location.assign("/admin");
      return;
    }
    setBusy(false);
    setCode("");
    setError(
      error.status === 401 && /expired|invalid two factor cookie/i.test(error.message ?? "")
        ? "This sign-in expired. Go back and enter your password again."
        : /too many/i.test(error.message ?? "")
          ? "Too many wrong tries. Go back and sign in again."
          : serverMessage(error, "That code didn't match. Check the newest email and try again."),
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className={title}>Check your email</h1>
        <p className={sub}>
          {sent ? "We sent" : "Sending"} a 6-digit code to <span className="font-medium text-foreground">{email}</span>. It
          expires in 10 minutes.
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
          {busy ? "Signing in…" : "Verify and log in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Can&apos;t find it? Check your spam folder.{" "}
        {wait > 0 ? (
          <span>Send a new code in {wait}s</span>
        ) : (
          <button type="button" onClick={send} className="font-medium text-foreground/80 underline-offset-4 hover:underline">
            Send a new code
          </button>
        )}
      </p>
      {hasApp && (
        <p className="mt-3 text-center">
          <button type="button" onClick={onUseApp} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
            Use my authenticator app instead
          </button>
        </p>
      )}
      <BackLink onClick={onBack}>Back</BackLink>
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
