"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { CheckCircleIcon, CheckIcon, CopyIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// One-time 2-step setup, simplified 2026-09-30 after the owner found the
// single tall scan screen (QR + key + ten backup codes + checkbox + code
// box) overwhelming. Now three small numbered steps, one job each:
//   1 Password  →  2 Scan & enter the first code  →  3 Save backup codes.
// 2-step turns ON when the first code verifies (end of step 2); abandoning
// before that leaves the account exactly as it was. The backup codes come
// LAST, once the hard part is done — they're held in memory from the enable
// call, shown once, with copy + download.
type Step = 1 | 2 | 3;

const STEP_LABELS = ["Password", "Scan", "Backup codes"] as const;

function StepTrail({ step }: { step: Step }) {
  return (
    <ol className="mb-1 flex items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-5 bg-border" />}
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                done ? "bg-tys-blue text-white" : current ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <CheckIcon size={11} weight="bold" /> : n}
            </span>
            <span className={`text-xs font-medium ${current ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function TwoStepSetup({ email }: { email: string }) {
  const [step, setStep] = useState<Step>(1);
  const [password, setPassword] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showKey, setShowKey] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setQr(await QRCode.toDataURL(uri, { margin: 1, width: 210, errorCorrectionLevel: "M" }));
    setStep(2);
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
    setStep(3);
  }

  const codesText = () =>
    `TYS Global Logistics — backup codes for ${email}\nEach code signs you in once if you don't have your phone.\n\n${backupCodes.join("\n")}\n`;

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(codesText());
      setCopied(true);
      toast.success("Backup codes copied.");
    } catch {
      // Clipboard blocked (unfocused window, strict browser): select the
      // list so Cmd+C works, and don't hold the Done button hostage.
      const list = document.getElementById("backup-codes");
      if (list) {
        const range = document.createRange();
        range.selectNodeContents(list);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setCopied(true);
      toast.error("Couldn't copy automatically. The codes are selected — press Cmd+C (or Ctrl+C).");
    }
  }

  function downloadCodes() {
    const url = URL.createObjectURL(new Blob([codesText()], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "tys-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
  }

  if (step === 3) {
    return (
      <Card>
        <CardHeader>
          <StepTrail step={3} />
          <CardTitle className="flex items-center gap-2 text-h3">
            <CheckCircleIcon size={22} weight="fill" className="text-green-600" />
            2-step sign-in is on
          </CardTitle>
          <CardDescription>
            One last thing: save these backup codes. If you ever lose your phone, each one signs you in once. They
            won&apos;t be shown again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ul id="backup-codes" className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-xl border bg-muted/40 p-4 font-mono text-[13px]">
            {backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={copyCodes}>
              <CopyIcon size={16} /> Copy
            </Button>
            <Button type="button" variant="outline" onClick={downloadCodes}>
              <DownloadSimpleIcon size={16} /> Download
            </Button>
          </div>
          <Button
            className="w-full bg-tys-blue text-white hover:bg-tys-blue/90"
            disabled={!copied}
            title={copied ? undefined : "Copy or download the codes first"}
            onClick={() => window.location.assign("/admin")}
          >
            Done, open the admin panel
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card>
        <CardHeader>
          <StepTrail step={2} />
          <CardTitle className="text-h3">Scan this with your phone</CardTitle>
          <CardDescription>
            Open <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong> (free on the App
            Store or Play Store), tap <strong>+</strong>, and point the camera here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element -- data: URI generated in the browser
            <img src={qr} alt="QR code for your authenticator app" width={210} height={210} className="mx-auto rounded-lg border" />
          )}
          <p className="text-center text-xs text-muted-foreground">
            {showKey ? (
              <code className="inline-block max-w-full break-all rounded bg-muted px-2 py-1 text-[12px] text-foreground">{secret}</code>
            ) : (
              <button type="button" onClick={() => setShowKey(true)} className="underline-offset-2 hover:underline">
                Can&apos;t scan? Show a key to type instead
              </button>
            )}
          </p>
          <form onSubmit={confirm} noValidate>
            <FieldGroup>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="code">Now enter the 6-digit code the app shows</FieldLabel>
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
                disabled={busy || code.replace(/\s/g, "").length !== 6}
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
        <StepTrail step={1} />
        <CardTitle className="text-h3">Protect your sign-in</CardTitle>
        <CardDescription>
          The admin panel now asks for a code from your phone as well as your password. Setting it up takes about a
          minute. Signed in as {email}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={start} noValidate>
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="password">First, confirm your password</FieldLabel>
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
