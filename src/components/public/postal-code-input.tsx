"use client";

import { useEffect, useRef, useState } from "react";
import { MapPinIcon, SpinnerGapIcon } from "@phosphor-icons/react/dist/ssr";

type Suggestion = { place: string; region: string };

// Zip/postal code lookup, backed by the free Zippopotam.us API (no key, no
// account, CORS-enabled — https://api.zippopotam.us/{country}/{postalCode}).
// It resolves one exact postal code to the locality name(s) that share it
// (a single code can cover several named areas), which is what drives the
// "type a code, see the matching place(s), pick one to confirm" list here.
// It's not a live prefix-search typeahead — the lookup only fires once the
// code looks complete-ish (debounced, min length) — and it silently shows no
// suggestions for codes/countries it doesn't have data for, since this is a
// confirmation aid, not a hard validation gate (the actual required-field
// check still happens on the plain text value via the form schema).
export function PostalCodeInput({
  value,
  onChange,
  countryCode,
  placeholder,
  name,
  invalid,
  onBlur,
  bare,
}: {
  value: string;
  onChange: (value: string) => void;
  countryCode: string | undefined;
  placeholder: string;
  name?: string;
  invalid?: boolean;
  onBlur?: () => void;
  /** No border, background or pin of its own, for sitting inside a field
   * well (the quote wizard) that draws the frame. */
  bare?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const code = value.trim();
    if (!countryCode || code.length < 3) {
      return;
    }

    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.zippopotam.us/${countryCode.toLowerCase()}/${encodeURIComponent(code)}`,
        );
        if (id !== requestId.current) return;
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const data = await res.json();
        const places = Array.isArray(data.places) ? data.places : [];
        const seen = new Set<string>();
        const next: Suggestion[] = [];
        for (const p of places) {
          const place = String(p?.["place name"] ?? "").trim();
          const region = String(p?.["state"] ?? p?.["state abbreviation"] ?? "").trim();
          if (!place) continue;
          const key = `${place}|${region}`;
          if (seen.has(key)) continue;
          seen.add(key);
          next.push({ place, region });
        }
        setSuggestions(next);
        setOpen(next.length > 0);
      } catch {
        if (id === requestId.current) setSuggestions([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, countryCode]);

  const showDropdown = open && suggestions.length > 0 && value.trim().length >= 3;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {!bare && (
        <MapPinIcon
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      )}
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={
          bare
            ? "w-full min-w-0 bg-transparent py-0.5 pr-8 text-[17px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-[#6B778A]"
            : `w-full rounded-full border bg-white py-4 pl-11 pr-10 text-base text-ink outline-none focus:border-brand ${invalid ? "border-red-400" : "border-brand-light"}`
        }
      />
      {loading && (
        <SpinnerGapIcon
          size={16}
          className={`absolute top-1/2 -translate-y-1/2 animate-spin text-ink-muted ${bare ? "right-0" : "right-4"}`}
        />
      )}
      {showDropdown && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-brand-light bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-brand-pale"
              >
                <span className="font-medium">{value.trim()}</span>
                <span className="text-ink-muted">
                  {[s.place, s.region].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
