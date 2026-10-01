"use client";

import { useEffect, useState } from "react";

// "Continue with Google / Microsoft" (2026-09-30). The server decides which
// providers are configured (enabledSocialProviders in lib/auth) and passes
// them in; with none configured this renders nothing, so the email form
// looks exactly as before. Better Auth answers /sign-in/social with the
// provider's consent URL, and we send the browser there.

export type SocialProvider = "google" | "microsoft";

const LABEL: Record<SocialProvider, string> = { google: "Google", microsoft: "Microsoft" };

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

export function SocialSignIn({
  providers,
  callbackURL = "/account",
  mode = "signin",
}: {
  providers: SocialProvider[];
  /** "signup" on the register page: same flow (the first Google sign-in
   *  creates the account), just labelled "Sign up with Google". */
  mode?: "signin" | "signup";
  /** Where to land after a successful sign-in (e.g. /account/schedule from Book a shipment). */
  callbackURL?: string;
}) {
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Coming BACK from Google/Microsoft restores this page from the browser's
  // back-forward cache with the old state, leaving the button stuck on
  // "Redirecting…" (owner's report, 2026-10-01). pageshow fires on that
  // restore; reset so the form is usable again.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setBusy(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
  if (providers.length === 0) return null;

  async function go(provider: SocialProvider) {
    setBusy(provider);
    setError(null);
    try {
      const res = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // Absolute, on THIS site: relative URLs would resolve against
        // Better Auth's baseURL, which is the admin host.
        body: JSON.stringify({
          provider,
          callbackURL: `${location.origin}${callbackURL}`,
          errorCallbackURL: `${location.origin}/account/login?social_error=1`,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url); // external consent page
        return;
      }
      setError(`Couldn't start ${LABEL[provider]} sign-in. Please try again.`);
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(null);
  }

  // Sits BELOW the email form (owner's call, 2026-09-30): email first,
  // then "or continue with" and the provider buttons.
  return (
    <div className="flex flex-col gap-3">
      <div className="my-1 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-wider text-[#6B778A]">
        <span className="h-px flex-1 bg-[#DCE3EC]" />
        {mode === "signup" ? "or sign up with" : "or continue with"}
        <span className="h-px flex-1 bg-[#DCE3EC]" />
      </div>
      <div className="flex flex-col gap-3">
        {providers.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            disabled={busy !== null}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white px-4 text-[15px] font-semibold text-ink ring-[1.5px] ring-inset ring-[#AEBBCD] transition hover:bg-[#F5F8FC] hover:ring-[#7F8FA6] disabled:opacity-60"
          >
            {p === "google" ? <GoogleMark /> : <MicrosoftMark />}
            {busy === p ? "Redirecting…" : `${mode === "signup" ? "Sign up" : "Continue"} with ${LABEL[p]}`}
          </button>
        ))}
      </div>
      {error && <p className="m-0 text-sm text-red-600">{error}</p>}
    </div>
  );
}
