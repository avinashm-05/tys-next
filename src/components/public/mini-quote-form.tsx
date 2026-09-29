"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { quoteContext } from "@/lib/quote-context";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
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
//
// 2026-09-30: pages that already know what's being sent or where it's going
// pass it on. `defaultTo` prefills "Sending to" (country pages), and
// `packageType` rides along to the wizard (service pages), which then skips
// its "What are you sending?" step.
export function MiniQuoteForm({
  className = "",
  layout = "stacked",
  defaultTo = "",
  packageType,
}: {
  className?: string;
  layout?: "stacked" | "columns" | "hero" | "wide";
  /** ISO code to preselect in "Sending to", e.g. "IN" on the India page. */
  defaultTo?: string;
  /** Wizard package type this page is about, e.g. "packers_movers". */
  packageType?: string;
}) {
  const router = useRouter();
  // Explicit props win; otherwise the page's own context (quote-context.ts).
  const ctx = quoteContext(usePathname());
  const pkg = packageType || ctx.pkg;
  const [fromCountry, setFromCountry] = useState("US");
  const [toCountry, setToCountry] = useState(defaultTo || ctx.to || "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCountry) params.set("from_country", fromCountry);
    if (toCountry) params.set("to_country", toCountry);
    if (pkg) params.set("package_type", pkg);
    const qs = params.toString();
    router.push(qs ? `/quotes?${qs}` : "/quotes");
  }

  const pill = layout === "columns";

  // Home page hero (2026-09 redesign): the page's main action, so it gets a
  // card of its own. From and To sit side by side with a swap control, the
  // button spans the card, and three short promises sit underneath.
  // Centered home hero (picked 2026-09-29): one wide bar, From | To |
  // button, the page's centerpiece. Stacks on phones.
  if (layout === "wide") {
    const well =
      "rounded-2xl bg-[#F4F7FC] px-5 pb-3.5 pt-3.5 text-left ring-1 ring-inset ring-[#E2E9F5] transition hover:bg-[#EEF3FB] focus-within:bg-white focus-within:ring-2 focus-within:ring-brand";
    return (
      <form
        onSubmit={submit}
        className={`rounded-[28px] bg-white p-2.5 shadow-[0_0_0_1px_rgba(3,100,255,0.14),0_40px_80px_-36px_rgba(3,100,255,0.65)] ${className}`}
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
          <div className={well} data-select-anchor>
            <label className="block text-[12.5px] font-semibold text-ink-muted">Sending from</label>
            <SearchableSelect options={COUNTRY_OPTIONS} value={fromCountry} label="Sending from" onChange={setFromCountry} placeholder="Select country" name="from_country" bare />
          </div>
          <div className={well} data-select-anchor>
            <label className="block text-[12.5px] font-semibold text-ink-muted">Sending to</label>
            <SearchableSelect options={COUNTRY_OPTIONS} value={toCountry} label="Sending to" onChange={setToCountry} placeholder="Where is it going?" name="to_country" bare />
          </div>
          {/* Reads as the first step, not the finish: "Step 1 of 2" under
              the label. Until a destination is picked, a pale veil keeps
              it quiet; picking one fades the veil and the button lights
              up. Still clickable either way (the wizard asks for anything
              missing). */}
          <button
            type="submit"
            className="btn btn-primary group relative !h-auto min-h-14 flex-col !gap-0.5 overflow-hidden !rounded-2xl !px-8 !py-2.5"
          >
            <span
              aria-hidden
              className={`absolute inset-0 rounded-2xl bg-[#E4EBF7] transition-opacity duration-500 ${toCountry ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`relative flex items-center gap-2 text-[17px] font-semibold transition-colors duration-500 ${toCountry ? "text-white" : "text-[#51627F]"}`}
            >
              Get my free quote
              <ArrowRightIcon size={17} weight="bold" className={`transition-transform duration-300 ${toCountry ? "group-hover:translate-x-0.5" : ""}`} />
            </span>
            <span
              className={`relative flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-500 ${toCountry ? "text-white/75" : "text-[#7A89A3]"}`}
            >
              <span className={`h-1.5 w-3.5 rounded-full ${toCountry ? "bg-white" : "bg-[#7A89A3]"}`} />
              <span className={`h-1.5 w-1.5 rounded-full ${toCountry ? "bg-white/45" : "bg-[#7A89A3]/40"}`} />
              <span className="ml-1">Step 1 of 2</span>
            </span>
          </button>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-2 pb-1.5 pt-3.5">
          {["Free, no obligation", "No sign-up", "Quote within 24 hours"].map((t) => (
            <li key={t} className="flex items-center gap-1.5 whitespace-nowrap text-[14px] font-semibold text-ink">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#12B76A] text-white">
                <CheckIcon size={10} weight="bold" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </form>
    );
  }

  if (layout === "hero") {
    // The page's main action, so it's built to look like one: filled input
    // wells with 18px values, a tall full-width button, a blue glow, and the
    // three reasons to click on a single line beneath it.
    const well =
      "rounded-2xl bg-[#F4F7FC] px-4 pb-3 pt-3 ring-1 ring-inset ring-[#E2E9F5] transition hover:bg-[#EEF3FB] focus-within:bg-white focus-within:ring-2 focus-within:ring-brand";
    return (
      <form
        onSubmit={submit}
        className={`rounded-[26px] bg-white p-2.5 shadow-[0_0_0_1px_rgba(3,100,255,0.12),0_30px_70px_-32px_rgba(3,100,255,0.6)] ${className}`}
      >
        <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className={well} data-select-anchor>
            <label className="block text-[12.5px] font-semibold text-ink-muted">Sending from</label>
            <SearchableSelect
              options={COUNTRY_OPTIONS}
              value={fromCountry} label="Sending from"
              onChange={setFromCountry}
              placeholder="Select country"
              name="from_country"
              bare
            />
          </div>
          <div className={well} data-select-anchor>
            <label className="block text-[12.5px] font-semibold text-ink-muted">Sending to</label>
            <SearchableSelect
              options={COUNTRY_OPTIONS}
              value={toCountry} label="Sending to"
              onChange={setToCountry}
              placeholder="Where is it going?"
              name="to_country"
              bare
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-2 !h-14 w-full !rounded-2xl !text-[17px] !font-semibold">
          Get my free quote <ArrowRightIcon size={17} weight="bold" />
        </button>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 px-2 pb-1.5 pt-3">
          {["Free, no obligation", "No sign-up", "Quote within 24 hours"].map((t) => (
            <li key={t} className="flex items-center gap-1.5 whitespace-nowrap text-[13.5px] font-semibold text-ink">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#12B76A] text-white">
                <CheckIcon size={10} weight="bold" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </form>
    );
  }

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
              value={fromCountry} label="Sending from"
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
              value={toCountry} label="Sending to"
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
