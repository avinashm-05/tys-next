"use client";

import { useEffect } from "react";

/**
 * Removes the query string (e.g. a one-time password-reset ?token=) from the
 * address bar once the page has it, so it doesn't linger in browser history,
 * get copied along with the URL, or leak via Referer (2026-09-30 privacy
 * audit). The server already passed the token to the form as a prop.
 */
export function StripUrlQuery() {
  useEffect(() => {
    if (location.search) history.replaceState(history.state, "", location.pathname + location.hash);
  }, []);
  return null;
}
