"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { SearchableSelect } from "@/components/public/searchable-select";

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({
  value: code,
  label: name,
  flag: code,
}));

// "Need a Quote" mini form — collects From/To and hands them to the full
// multi-step wizard at /quotes as prefilled Step 1 (that route reads
// from_country/to_country off the query string, mirroring what the old
// Laravel QuoteController@index did with the same params). Not itself a
// validated form: the wizard revalidates everything on Step 1 anyway.
//
// `layout="columns"` is the wide hero treatment (From/To side by side, pill
// inputs); `layout="stacked"` (default) is the narrower "Need a Quote" card.
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
    const qs = params.toString();
    router.push(qs ? `/quotes?${qs}` : "/quotes");
  }

  const pill = layout === "columns";

  return (
    <form onSubmit={submit} className={className}>
      <div className={layout === "columns" ? "grid gap-4 md:grid-cols-2" : ""}>
        <div>
          <label className="block text-lg font-medium tracking-[-0.9px] text-black">
            Sending From
          </label>
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
          <label className="block text-lg font-medium tracking-[-0.9px] text-black">
            Sending To
          </label>
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
