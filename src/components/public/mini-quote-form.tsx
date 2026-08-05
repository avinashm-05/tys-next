"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { SearchableSelect } from "@/components/public/searchable-select";

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({
  value: code,
  label: name,
  flag: code,
}));

// Hero / "Need a Quote" mini form — collects From/To only, then hands off to
// the full /quotes wizard (Step 1 reads these as prefill query params). Not
// itself a validated form; the wizard is the single source of truth for
// quote data and validation.
//
// `layout="columns"` is the wide desktop hero treatment (From/To side by
// side, pill inputs) — stacks on mobile since it's a real design, not a
// scaled-down desktop one. `layout="stacked"` (default) is the narrower
// treatment used in the "Need a Quote" card lower on the page.
export function MiniQuoteForm({
  className = "",
  layout = "stacked",
}: {
  className?: string;
  layout?: "stacked" | "columns";
}) {
  const router = useRouter();
  const [fromCountry, setFromCountry] = useState("US");
  const [toCountry, setToCountry] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCountry) params.set("from_country", fromCountry);
    if (toCountry) params.set("to_country", toCountry);
    router.push(`/quotes?${params.toString()}`);
  }

  const pill = layout === "columns";

  return (
    <form onSubmit={submit} className={className}>
      <div className={layout === "columns" ? "grid gap-4 md:grid-cols-2" : ""}>
        <div>
          <label className="block text-lg font-medium tracking-[-0.9px] text-black">Sending From</label>
          <div className="mt-1.5">
            <SearchableSelect
              options={COUNTRY_OPTIONS}
              value={fromCountry}
              onChange={setFromCountry}
              placeholder="Select Country"
              name="from_country"
              pill={pill}
            />
          </div>
        </div>

        <div className={layout === "columns" ? "" : "mt-4"}>
          <label className="block text-lg font-medium tracking-[-0.9px] text-black">Sending To</label>
          <div className="mt-1.5">
            <SearchableSelect
              options={COUNTRY_OPTIONS}
              value={toCountry}
              onChange={setToCountry}
              placeholder="Select Country"
              name="to_country"
              pill={pill}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className={`mt-4 flex w-full items-center justify-center gap-1.5 bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark ${pill ? "rounded-full" : "rounded-xl"}`}
      >
        Get a Free Quote
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}
