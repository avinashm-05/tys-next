"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

// Volumetric weight calculator for /resources/volumetric-weight. Uses the
// same divisors the page (and the quote tool) state: L x W x H / 139 for
// inches and pounds, / 5000 for centimeters and kilograms.
type Units = "imperial" | "metric";

const UNITS: Record<Units, { len: string; wt: string; divisor: number; label: string }> = {
  imperial: { len: "in", wt: "lb", divisor: 139, label: "Inches / pounds" },
  metric: { len: "cm", wt: "kg", divisor: 5000, label: "Centimeters / kilograms" },
};

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export function VolumetricCalculator() {
  const id = useId();
  const [units, setUnits] = useState<Units>("imperial");
  const [dims, setDims] = useState({ l: "18", w: "18", h: "16", wt: "20" });
  const u = UNITS[units];

  const l = num(dims.l);
  const w = num(dims.w);
  const h = num(dims.h);
  const actual = num(dims.wt);
  const ready = l > 0 && w > 0 && h > 0;
  const volumetric = ready ? (l * w * h) / u.divisor : 0;
  const chargeable = Math.max(volumetric, actual);
  const byVolume = ready && volumetric > actual;

  const field = (key: keyof typeof dims, label: string, unit: string) => (
    <label htmlFor={`${id}-${key}`} className="block">
      <span className="text-[13px] font-medium text-ink-muted">{label}</span>
      <span className="mt-1.5 flex items-center rounded-xl border border-[var(--line)] bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
        <input
          id={`${id}-${key}`}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={dims[key]}
          onChange={(e) => setDims((d) => ({ ...d, [key]: e.target.value }))}
          className="w-full min-w-0 bg-transparent px-3.5 py-3 text-[16px] tabular-nums text-ink outline-none"
        />
        <span className="pr-3.5 text-sm text-ink-muted">{unit}</span>
      </span>
    </label>
  );

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white">
      <div className="p-5 sm:p-6">
        <div role="radiogroup" aria-label="Units" className="inline-flex rounded-xl border border-[var(--line)] p-1">
          {(Object.keys(UNITS) as Units[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={units === k}
              onClick={() => setUnits(k)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                units === k ? "bg-[#EEF4FF] text-brand" : "text-ink-muted hover:text-ink"
              }`}
            >
              {UNITS[k].label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {field("l", "Length", u.len)}
          {field("w", "Width", u.len)}
          {field("h", "Height", u.len)}
          {field("wt", "Actual weight", u.wt)}
        </div>
      </div>

      <dl className="grid grid-cols-2 border-t border-[var(--line)]" aria-live="polite">
        <div className="border-r border-[var(--line)] p-5 sm:p-6">
          <dt className="text-[13px] text-ink-muted">Volumetric weight</dt>
          <dd className="mt-1 text-[1.8rem] leading-none tracking-[-0.03em] text-ink" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
            {ready ? fmt(volumetric) : "0.00"} <span className="text-base text-ink-muted">{u.wt}</span>
          </dd>
        </div>
        <div className="p-5 sm:p-6">
          <dt className="text-[13px] text-ink-muted">Chargeable weight</dt>
          <dd className="mt-1 text-[1.8rem] leading-none tracking-[-0.03em] text-brand" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
            {fmt(chargeable)} <span className="text-base text-ink-muted">{u.wt}</span>
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-4 border-t border-[var(--line)] p-5 text-[14.5px] leading-relaxed text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p>
          {!ready
            ? "Enter the box's length, width and height to see its volumetric weight."
            : byVolume
              ? "This box is billed on its size, not its weight. A smaller box could cost less."
              : "This box is billed on its actual weight, because that's the greater number."}
        </p>
        <Link href="/quotes" className="btn btn-primary shrink-0">
          Get a price <ArrowRightIcon size={14} />
        </Link>
      </div>
    </div>
  );
}
