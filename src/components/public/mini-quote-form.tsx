"use client";

import { useState } from "react";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { SearchableSelect } from "@/components/public/searchable-select";

const COUNTRY_OPTIONS = COUNTRY_LIST.map(([code, name]) => ({
  value: code,
  label: name,
  flag: code,
}));

// "Need a Quote" mini form further down the home page — collects From/To,
// then scrolls back up to the real quote form (id="get-quote" in the hero,
// see page.tsx), which is now the only quote form on the site. There's no
// separate page to hand these values off to anymore (that used to be
// /quotes — see that route's own comment), so the selections here are a
// lightweight preview before scrolling, not passed through automatically;
// not itself a validated form either way.
//
// `layout="columns"` is the wide desktop hero treatment (From/To side by
// side, pill inputs) — unused now that the hero itself embeds the full
// form directly, kept for the narrower "Need a Quote" card's own use of
// this component. `layout="stacked"` (default) is that card's treatment.
export function MiniQuoteForm({
  className = "",
  layout = "stacked",
}: {
  className?: string;
  layout?: "stacked" | "columns";
}) {
  const [fromCountry, setFromCountry] = useState("US");
  const [toCountry, setToCountry] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    document
      .getElementById("get-quote")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
