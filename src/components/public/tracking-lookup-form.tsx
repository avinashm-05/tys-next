"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

// Live tracking lookup isn't wired up yet (no fulfillment/tracking backend —
// see (public)/account/tracking's "Empty-state stub" note), so submitting
// just surfaces an honest inline message instead of pretending to look
// anything up.
export function TrackingLookupForm() {
  const [trackingId, setTrackingId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="mt-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            value={trackingId}
            onChange={(e) => {
              setTrackingId(e.target.value);
              setSubmitted(false);
            }}
            placeholder="Tracking ID"
            className="w-full rounded-full border border-brand-light bg-white py-4 pl-11 pr-4 text-base text-ink outline-none focus:border-brand"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Track →
        </button>
      </div>
      {submitted && (
        <p className="mt-3 text-sm text-ink-muted">
          Online tracking lookup is coming soon. In the meantime, check your confirmation email
          for the latest status, or reach out on our{" "}
          <a href="/contact-us" className="font-semibold text-brand hover:underline">
            Contact Us
          </a>{" "}
          page.
        </p>
      )}
    </form>
  );
}
