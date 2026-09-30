"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Step = "password" | "scan" | "done";

// Three steps: confirm password → scan the QR code and save backup codes →
// enter the first code (which switches 2-step on). Nothing is enabled until
// that first code verifies, so abandoning halfway leaves the account as it was.
export function TwoStepSetup({ email }: { email: string }) {
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await authClient.twoFactor.enable({ password, method: "totp" });
    setBusy(false);
    if (error || !data || data.method !== "totp") {
      setError(error?.status === 400 || error?.status === 401 ? "That password isn't right." : error?.message ?? "Something went wrong.");
      return;
    }
    setPassword("");
    const uri = data.totpURI;
    setSecret(new URL(uri).searchParams.get("secret") ?? "");
    setBackupCodes(data.backupCodes);
    setQr(await QRCode.toDataURL(uri, { margin: 1, width: 220, errorCorrectionLevel: "M" }));
    setStep("scan");
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
    setBusy(false);
    if (error) {
      setError("That code didn't match. Make sure your phone's time is set automatically, then try the newest code.");
      return;
    }
    setStep("done");
  }

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success("Backup codes copied.");
    } catch {
      toast.error("Couldn't copy. Select the codes and copy them by hand.");
    }
  }

  if (step === "done") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">2-step sign-in is on</CardTitle>
          <CardDescription>
            From now on, signing in asks for your password and a code from your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-tys-blue text-white hover:bg-tys-blue/90" onClick={() => window.location.assign("/admin")}>
            Continue to the admin panel
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "scan") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Scan with your authenticator app</CardTitle>
          <CardDescription>
            Use Google Authenticator, Microsoft Authenticator or 1Password. Scan the code, then enter the 6-digit code it shows.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element -- data: URI generated in the browser
            <img src={qr} alt="QR code for your authenticator app" width={220} height={220} className="mx-auto rounded-lg border" />
          )}
          <p className="text-center text-xs text-muted-foreground">
            Can&apos;t scan? Enter this key instead:
            <br />
            <code className="mt-1 inline-block break-all rounded bg-muted px-2 py-1 text-[13px] text-foreground">{secret}</code>
          </p>

          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="text-sm font-medium">Save your backup codes</p>
            <p className="mt-1 text-xs text-muted-foreground">
              If you lose your phone, each code gets you in once. Keep them somewhere safe, like a password manager. They won&apos;t be shown again.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-1 font-mono text-[13px]">
              {backupCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copyCodes}>
                Copy codes
              </Button>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                I&apos;ve saved them
              </label>
            </div>
          </div>

          <form onSubmit={confirm} noValidate>
            <FieldGroup>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="code">6-digit code</FieldLabel>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={7}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-lg tracking-[0.3em]"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </Field>
              <Button
                type="submit"
                disabled={busy || !saved || code.replace(/\s/g, "").length !== 6}
                className="w-full bg-tys-blue text-white hover:bg-tys-blue/90"
              >
                {busy ? "Checking…" : "Turn on 2-step sign-in"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Set up 2-step sign-in</CardTitle>
        <CardDescription>
          The admin panel now needs a code from your phone as well as your password. It takes about a minute. Signed in as {email}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={start} noValidate>
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="password">Confirm your password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </Field>
            <Button type="submit" disabled={busy || !password} className="w-full bg-tys-blue text-white hover:bg-tys-blue/90">
              {busy ? "Starting…" : "Continue"}
            </Button>
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                window.location.assign("/login");
              }}
              className="text-xs text-muted-foreground hover:underline"
            >
              Sign out
            </button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
