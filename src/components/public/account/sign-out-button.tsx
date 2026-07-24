"use client";

import { useState } from "react";

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
      style={{
        background: "none",
        border: "none",
        padding: 0,
        color: "#dc3545",
        cursor: "pointer",
        font: "inherit",
      }}
    >
      <i className="fa-solid fa-arrow-right-from-bracket me-1"></i>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
