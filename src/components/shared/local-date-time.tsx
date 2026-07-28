"use client";

import { useEffect, useState } from "react";
import { formatDateTime, formatLocalDateTime } from "@/lib/format";

/**
 * Same timestamp as formatDateTime, but converted to the viewing admin's own
 * system timezone with a short abbreviation (e.g. "2:06 PM EST" / "11:36 PM
 * IST") instead of a bare, unlabeled UTC value — the team spans regions, and
 * a plain "14:06" reads as "whatever timezone I'm assuming" rather than
 * anything anchored. Renders the UTC text first (byte-for-byte what the
 * server rendered, so no hydration mismatch) then swaps to local time right
 * after mount, once the browser's own timezone is available.
 */
export function LocalDateTime({ iso }: { iso: string | Date | null | undefined }) {
  const [text, setText] = useState(() => formatDateTime(iso));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the whole point: the browser's real timezone is only knowable client-side, after mount
    setText(formatLocalDateTime(iso));
  }, [iso]);

  return <span suppressHydrationWarning>{text}</span>;
}
