import { useEffect, useState } from "react";

/**
 * Delays reflecting `value` by `delayMs`. Used to decouple a fast-typed
 * input from whatever's expensive downstream of it — here, an admin list's
 * per-column search box firing a server request (and the resulting
 * loading-opacity flicker + row-count/height shift) on every keystroke,
 * which is what "jittering while typing" actually was.
 *
 * The caller keeps its own live state for the input's `value` (so typing
 * itself never lags or drops a character) and only feeds this debounced
 * value into the actual query — e.g. `useAdminList`'s `extraParams`.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
