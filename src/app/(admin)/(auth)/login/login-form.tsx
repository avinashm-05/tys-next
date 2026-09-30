"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type Values = z.infer<typeof schema>;

/** Laravel-shaped 422 body ({ message, errors }) — includes the login lockout. */
type ServerError = { status: number; message?: string; errors?: Record<string, string[]> };

export function LoginForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  // 2-step sign-in (2026-09-30): a correct password on an account with
  // 2-step on returns `twoFactorRedirect` instead of a session; the form
  // then asks for the authenticator code (or a one-time backup code).
  const [codeStep, setCodeStep] = useState(false);

  async function onSubmit(values: Values) {
    const { data, error } = await authClient.signIn.email(values);
    if (!error) {
      if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
        setCodeStep(true);
        return;
      }
      // Full navigation so the server sees the fresh session cookie.
      window.location.assign("/admin");
      return;
    }

    const { errors: fieldErrors, message, status } = error as unknown as ServerError;
    if (fieldErrors) {
      // 422 — including "Too many login attempts..." on the email field (R33).
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (field === "email" || field === "password") {
          form.setError(field, { type: "server", message: messages[0] });
        } else {
          toast.error(messages[0]);
        }
      }
    } else if (status === 401) {
      // Laravel's auth.failed, verbatim (05-auth).
      form.setError("email", {
        type: "server",
        message: "These credentials do not match our records.",
      });
    } else {
      toast.error(message ?? "Sign in failed. Try again.");
    }
  }

  if (codeStep) return <CodeStep onBack={() => setCodeStep(false)} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Sign in</CardTitle>
        <CardDescription>Enter your email and password to open the admin panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={!!errors.password}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-tys-blue text-white hover:bg-tys-blue/90"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function CodeStep({ onBack }: { onBack: () => void }) {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Enter your code</CardTitle>
        <CardDescription>
          {backup
            ? "Enter one of the backup codes you saved when you set up 2-step sign-in."
            : "Open your authenticator app and enter the 6-digit code for TYS Global Logistics."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={verify} noValidate>
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="code">{backup ? "Backup code" : "6-digit code"}</FieldLabel>
              <Input
                id="code"
                autoFocus
                autoComplete="one-time-code"
                inputMode={backup ? "text" : "numeric"}
                maxLength={backup ? 32 : 7}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                aria-invalid={!!error}
                className="text-center text-lg tracking-[0.3em]"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </Field>
            <Button
              type="submit"
              disabled={busy || code.trim().length < (backup ? 6 : 6)}
              className="w-full bg-tys-blue text-white hover:bg-tys-blue/90"
            >
              {busy ? "Checking…" : "Verify and sign in"}
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={onBack} className="text-muted-foreground hover:underline">
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setBackup(!backup);
                  setCode("");
                  setError(null);
                }}
                className="text-primary hover:underline"
              >
                {backup ? "Use the authenticator code" : "Lost your phone? Use a backup code"}
              </button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
