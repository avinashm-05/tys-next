"use client";

import { useState } from "react";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    } finally {
      window.location.href = "/";
    }
  }
  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
    >
      <SignOutIcon size={16} />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
