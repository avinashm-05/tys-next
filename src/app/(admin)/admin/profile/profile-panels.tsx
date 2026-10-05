"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DesktopIcon, EnvelopeSimpleIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerAvatar } from "@/components/admin/customer-bits";

type SessionRow = { device: string; lastActive: string; current: boolean };

export function ProfilePanels({
  name,
  email,
  role,
  since,
  sessions,
}: {
  name: string;
  email: string;
  role: string;
  since: string | null;
  sessions: SessionRow[];
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-center gap-4">
        <CustomerAvatar name={name} size="lg" />
        <div>
          <h1 className="text-h2">{name}</h1>
          <p className="text-sm text-muted-foreground">
            {email} · {role}
            {since ? ` · since ${since}` : ""}
          </p>
        </div>
      </div>
      <DetailsPanel name={name} email={email} />
      <PasswordPanel />
      <SecurityPanel sessions={sessions} />
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground/70">
      {children}
    </label>
  );
}

function DetailsPanel({ name: initial, email }: { name: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(initial);
  const [busy, setBusy] = useState(false);
  const changed = name.trim() !== initial && name.trim().length > 0;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!changed) return;
    setBusy(true);
    const { error } = await authClient.updateUser({ name: name.trim() });
    setBusy(false);
    if (error) return toast.error("Couldn't save your name. Try again.");
    toast.success("Name updated.");
    router.refresh();
  }

  return (
    <Panel title="Your details" description="Your name shows on quotes you send and in the Activity log.">
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-name">Full name</Label>
          <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-email">Work email</Label>
          <Input id="pf-email" value={email} disabled />
          <span className="text-xs text-muted-foreground">To change your email, ask the owner (Staff page).</span>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={!changed || busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function strength(pw: string): { label: string; tone: string; pct: number } {
  let score = 0;
  if (pw.length >= 10) score++;
  if (pw.length >= 14) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 8) return { label: "Too short", tone: "bg-red-500", pct: 15 };
  if (score <= 2) return { label: "Weak", tone: "bg-amber-500", pct: 40 };
  if (score <= 3) return { label: "Good", tone: "bg-tys-blue", pct: 70 };
  return { label: "Strong", tone: "bg-emerald-500", pct: 100 };
}

function PasswordPanel() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const s = strength(next);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < 10) return setError("Use at least 10 characters for a staff account.");
    if (next !== confirm) return setError("The two new passwords don't match.");
    if (next === current) return setError("The new password must be different from the current one.");
    setBusy(true);
    // Other devices are signed out, so a stolen session dies with the old password.
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setBusy(false);
    if (error) {
      setError(error.status === 400 || error.status === 401 ? "Your current password is incorrect." : "Couldn't change the password. Try again.");
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Password changed. Your other devices were signed out.");
  }

  return (
    <Panel title="Password" description="Changing it signs you out everywhere else.">
      <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
          <Label htmlFor="pf-current">Current password</Label>
          <Input id="pf-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-new">New password</Label>
          <Input id="pf-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          {next && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full transition-all ${s.tone}`} style={{ width: `${s.pct}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pf-confirm">Confirm new password</Label>
          <Input id="pf-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy || !current || !next || !confirm}>
            {busy ? "Changing…" : "Change password"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function SecurityPanel({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const others = sessions.filter((s) => !s.current).length;

  async function signOutOthers() {
    setBusy(true);
    const { error } = await authClient.revokeOtherSessions();
    setBusy(false);
    if (error) return toast.error("Couldn't sign out the other devices. Try again.");
    toast.success("Signed out of all other devices.");
    router.refresh();
  }

  return (
    <Panel title="Sign-in security">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-xl border bg-brand-softer p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-tys-blue">
            <ShieldCheckIcon size={18} weight="bold" />
          </span>
          <div>
            <p className="text-sm font-semibold">2-step verification is on</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <EnvelopeSimpleIcon size={14} /> Every sign-in asks for your password and then a 6-digit code sent to your email.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Where you&apos;re signed in</p>
            {others > 0 && (
              <Button variant="outline" size="sm" onClick={signOutOthers} disabled={busy}>
                {busy ? "Signing out…" : `Sign out ${others} other ${others === 1 ? "device" : "devices"}`}
              </Button>
            )}
          </div>
          <ul className="divide-y rounded-xl border">
            {sessions.map((s, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3">
                <DesktopIcon size={18} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.device}</p>
                  <p className="text-xs text-muted-foreground">Last active {s.lastActive} ET</p>
                </div>
                {s.current && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">This device</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
