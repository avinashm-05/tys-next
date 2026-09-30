"use client";

import { useSyncExternalStore } from "react";

/**
 * sessionStorage key the quote/callback forms write the customer's
 * name to just before redirecting to /thank-you. Privacy (2026-09-30): the
 * name used to travel as ?name= in the URL, which put it into Google
 * Analytics, Clarity, browser history and Referer headers. sessionStorage
 * stays in this tab only and never leaves the browser.
 */
export const THANK_YOU_NAME_KEY = "tys:thank-you-name";

export function rememberThankYouName(fullName: string) {
  try {
    const name = fullName.trim();
    if (name) sessionStorage.setItem(THANK_YOU_NAME_KEY, name.slice(0, 80));
  } catch {
    // storage blocked (private mode etc.): the page just says "Thank you."
  }
}

function readName(): string | null {
  try {
    return sessionStorage.getItem(THANK_YOU_NAME_KEY);
  } catch {
    return null;
  }
}
const noSubscribe = () => () => {};

export function ThankYouTitle() {
  // Server render has no storage, so it says "Thank you." and the name
  // fills in on hydration.
  const name = useSyncExternalStore(noSubscribe, readName, () => null);
  return <>{name ? `Thank you, ${name}.` : "Thank you."}</>;
}
