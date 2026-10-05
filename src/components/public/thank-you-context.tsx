"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

/**
 * What a quote/callback form hands the thank-you page (2026-09-30 privacy
 * pass). Both used to travel in the URL (?name=...&quote_id=71), which put
 * the customer's name into GA4, Clarity, browser history and Referer
 * headers, and exposed the sequential quote number (guessable, and it
 * reveals order volume). sessionStorage stays in this browser tab only and
 * never leaves the device, so /thank-you now carries nothing personal.
 */
const KEY = "tys:thank-you";
const FIRED_KEY = "tys:thank-you-fired";

type Submission = { name?: string; ref?: string; at: number };

export function rememberThankYou(s: { name?: string; ref?: string | number | null }) {
  try {
    const data: Submission = {
      name: s.name?.trim().slice(0, 80) || undefined,
      ref: s.ref != null && /^\d+$/.test(String(s.ref)) ? String(s.ref) : undefined,
      at: Date.now(),
    };
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage blocked (private mode etc.): the page just says "Thank you."
  }
}

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
const noSubscribe = () => () => {};

function useSubmission(): Submission | null {
  // Server render has no storage; the personal bits fill in on hydration.
  const raw = useSyncExternalStore(noSubscribe, readRaw, () => null);
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Submission;
    } catch {
      return null;
    }
  }, [raw]);
}

export function ThankYouTitle() {
  const s = useSubmission();
  return <>{s?.name ? `Thank you, ${s.name}.` : "Thank you."}</>;
}

/** WhatsApp link whose prefilled text carries only the quote reference. */
export function ThankYouWhatsAppLink({
  number,
  className,
  children,
}: {
  number: string;
  className?: string;
  children: React.ReactNode;
}) {
  const s = useSubmission();
  const text = s?.ref ? `Hi TYS, I just requested a quote (Quote #${s.ref}).` : "Hi TYS, I just requested a quote.";
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

// Same rule as lib/tracking-guard.ts: never fire tags from a local host.
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$|\.(localhost|test|local)$/;

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };

/**
 * Fires the Google Ads lead conversion and the GTM `generate_lead` event,
 * but ONLY for a real form submission in this tab, and only once per
 * submission. Before, anyone opening /thank-you directly (a bookmark, a
 * crawler, the back button) counted as a lead in Google Ads. The quote
 * number is still sent as transaction_id so Ads dedupes it, but it never
 * appears in the URL.
 */
export function ThankYouConversions() {
  const s = useSubmission();
  useEffect(() => {
    if (!s || LOCAL_HOST.test(location.hostname)) return;
    const stamp = `${s.at}`;
    try {
      if (sessionStorage.getItem(FIRED_KEY) === stamp) return;
      sessionStorage.setItem(FIRED_KEY, stamp);
    } catch {
      // can't dedupe locally; transaction_id still dedupes quotes in Ads
    }
    const w = window as GtagWindow;
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    w.dataLayer = w.dataLayer || [];
    if (adsId && label) {
      // gtag.js only reads real `arguments` objects from the dataLayer, so
      // the fallback (base tag not loaded yet) must push `arguments`.
      const gtag =
        w.gtag ??
        function () {
          // eslint-disable-next-line prefer-rest-params
          w.dataLayer!.push(arguments);
        };
      gtag("event", "conversion", {
        send_to: `${adsId}/${label}`,
        ...(s.ref ? { transaction_id: s.ref } : {}),
      });
    }
    if (process.env.NEXT_PUBLIC_GTM_ID) {
      w.dataLayer.push({ event: "generate_lead", transaction_id: s.ref ?? "" });
    }
  }, [s]);
  return null;
}
