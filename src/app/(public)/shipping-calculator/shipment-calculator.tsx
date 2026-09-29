"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { COUNTRY_LIST } from "@/lib/countries-list";

// Whole-shipment weight calculator for /shipping-calculator. For one or more
// boxes it adds up the actual weight, the dimensional weight and the
// chargeable weight (the greater of the two, box by box). Same divisors as
// /resources/volumetric-weight and the quote tool: L x W x H / 139 for
// inches and pounds, / 5000 for centimeters and kilograms. No prices: the
// CTA hands off to /quotes, with the destination if one was picked.

type Units = "imperial" | "metric";
type Row = { id: number; l: string; w: string; h: string; wt: string; qty: string };
type Field = Exclude<keyof Row, "id">;

const UNITS: Record<Units, { len: string; wt: string; divisor: number; label: string }> = {
  imperial: { len: "in", wt: "lb", divisor: 139, label: "Inches and pounds" },
  metric: { len: "cm", wt: "kg", divisor: 5000, label: "Centimeters and kilograms" },
};

const IN_TO_CM = 2.54;
const LB_TO_KG = 0.45359237;

// The destination list: "United States" first (domestic), then the world.
const DESTINATIONS = COUNTRY_LIST.filter(([code]) => code !== "US");

let nextId = 1;
const blankRow = (id: number): Row => ({ id, l: "", w: "", h: "", wt: "", qty: "1" });

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
// Converted values are rounded to one decimal so the boxes stay readable.
const convert = (v: string, factor: number) => {
  const n = num(v);
  return n > 0 ? String(Math.round(n * factor * 10) / 10) : v;
};

function calcRow(r: Row, divisor: number) {
  const l = num(r.l);
  const w = num(r.w);
  const h = num(r.h);
  const actual = num(r.wt);
  const qty = Math.max(1, Math.floor(num(r.qty)) || 1);
  const hasDims = l > 0 && w > 0 && h > 0;
  const dim = hasDims ? (l * w * h) / divisor : 0;
  const chargeable = Math.max(dim, actual);
  return { qty, actual, dim, chargeable, hasDims, filled: hasDims || actual > 0, bySize: hasDims && dim > actual };
}

const INPUT =
  "w-full min-w-0 bg-transparent px-3 py-3 text-[16px] tabular-nums text-ink outline-none placeholder:text-ink-muted/60";
const FRAME =
  "mt-1.5 flex min-h-[48px] items-center rounded-xl border border-[#C9D2E0] bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20";

export function ShipmentCalculator() {
  const id = useId();
  const [units, setUnits] = useState<Units>("imperial");
  const [rows, setRows] = useState<Row[]>(() => [blankRow(0)]);
  const [country, setCountry] = useState("");
  const u = UNITS[units];

  const results = rows.map((r) => calcRow(r, u.divisor));
  const filled = results.filter((r) => r.filled);
  const boxes = filled.reduce((s, r) => s + r.qty, 0);
  const totalActual = filled.reduce((s, r) => s + r.actual * r.qty, 0);
  const totalDim = filled.reduce((s, r) => s + r.dim * r.qty, 0);
  const totalCharge = filled.reduce((s, r) => s + r.chargeable * r.qty, 0);
  const anyBySize = filled.some((r) => r.bySize);
  const missingDims = filled.some((r) => !r.hasDims);

  const setField = (rowId: number, key: Field, value: string) =>
    setRows((rs) => rs.map((r) => (r.id === rowId ? { ...r, [key]: value } : r)));

  const addRow = () => setRows((rs) => [...rs, blankRow(nextId++)]);
  const removeRow = (rowId: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== rowId) : rs));

  // Switching units converts what's already typed, so nobody has to re-enter it.
  const switchUnits = (next: Units) => {
    if (next === units) return;
    const lenF = next === "metric" ? IN_TO_CM : 1 / IN_TO_CM;
    const wtF = next === "metric" ? LB_TO_KG : 1 / LB_TO_KG;
    setRows((rs) =>
      rs.map((r) => ({ ...r, l: convert(r.l, lenF), w: convert(r.w, lenF), h: convert(r.h, lenF), wt: convert(r.wt, wtF) })),
    );
    setUnits(next);
  };

  const quoteHref = country ? `/quotes?to_country=${encodeURIComponent(country)}` : "/quotes";

  const field = (r: Row, key: Field, label: string, unit: string | null, span: string) => (
    <label htmlFor={`${id}-${r.id}-${key}`} className={`block ${span}`}>
      <span className="text-[15px] font-medium text-ink">
        {label}
        {unit && <span className="font-normal text-ink-muted"> ({unit})</span>}
      </span>
      <span className={FRAME}>
        <input
          id={`${id}-${r.id}-${key}`}
          type="number"
          inputMode={key === "qty" ? "numeric" : "decimal"}
          min={key === "qty" ? 1 : 0}
          step={key === "qty" ? 1 : "any"}
          value={r[key]}
          placeholder={key === "qty" ? "1" : "0"}
          onChange={(e) => setField(r.id, key, e.target.value)}
          className={INPUT}
        />
      </span>
    </label>
  );

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <div className="border-b border-[var(--line)] p-5 sm:p-6">
        <p id={`${id}-units`} className="text-[15px] font-medium text-ink">
          Measure in
        </p>
        <div role="radiogroup" aria-labelledby={`${id}-units`} className="mt-2 inline-flex flex-wrap gap-1 rounded-xl border border-[var(--line)] p-1">
          {(Object.keys(UNITS) as Units[]).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={units === k}
              onClick={() => switchUnits(k)}
              className={`min-h-[44px] rounded-lg px-4 text-[15px] font-medium transition-colors ${
                units === k ? "bg-[#EEF4FF] text-brand" : "text-ink-muted hover:text-ink"
              }`}
            >
              {UNITS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[var(--line)]">
        {rows.map((r, i) => {
          const res = results[i];
          return (
            <fieldset key={r.id} className="p-5 sm:p-6">
              <legend className="sr-only">Box {i + 1}</legend>
              <div className="flex min-h-[44px] items-center justify-between gap-3">
                <p aria-hidden className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  Box {i + 1}
                </p>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(r.id)}
                    aria-label={`Remove box ${i + 1}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-[15px] font-medium text-ink-muted transition-colors hover:bg-[#F3F5F9] hover:text-ink"
                  >
                    <TrashIcon size={17} aria-hidden /> Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-6 items-end gap-3 sm:grid-cols-5">
                {field(r, "l", "Length", u.len, "col-span-2 sm:col-span-1")}
                {field(r, "w", "Width", u.len, "col-span-2 sm:col-span-1")}
                {field(r, "h", "Height", u.len, "col-span-2 sm:col-span-1")}
                {field(r, "wt", "Weight of 1 box", u.wt, "col-span-3 sm:col-span-1")}
                {field(r, "qty", "How many", null, "col-span-3 sm:col-span-1")}
              </div>
              {res.filled && (
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  {res.hasDims ? (
                    <>
                      Each box: actual {fmt(res.actual)} {u.wt}, dimensional {fmt(res.dim)} {u.wt}.{" "}
                      <span className="font-medium text-ink">
                        Billed on {res.bySize ? "size" : "weight"}: {fmt(res.chargeable)} {u.wt}
                      </span>
                    </>
                  ) : (
                    "Add the length, width and height to see this box's dimensional weight."
                  )}
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      <div className="border-t border-[var(--line)] p-5 sm:p-6">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[#C9D2E0] px-4 text-[15.5px] font-medium text-ink transition-colors hover:border-brand hover:text-brand"
        >
          <PlusIcon size={17} aria-hidden /> Add another box
        </button>
      </div>

      <dl className="grid grid-cols-2 border-t border-[var(--line)] lg:grid-cols-4" aria-live="polite">
        <div className="border-b border-r border-[var(--line)] p-5 sm:p-6 lg:border-b-0">
          <dt className="text-[15px] text-ink-muted">Boxes</dt>
          <dd className="mt-1 text-[1.8rem] leading-none tracking-[-0.03em] text-ink" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
            {boxes}
          </dd>
        </div>
        <div className="border-b border-[var(--line)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <dt className="text-[15px] text-ink-muted">Actual weight</dt>
          <dd className="mt-1 text-[1.8rem] leading-none tracking-[-0.03em] text-ink" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
            {fmt(totalActual)} <span className="text-base text-ink-muted">{u.wt}</span>
          </dd>
        </div>
        <div className="border-r border-[var(--line)] p-5 sm:p-6">
          <dt className="text-[15px] text-ink-muted">Dimensional weight</dt>
          <dd className="mt-1 text-[1.8rem] leading-none tracking-[-0.03em] text-ink" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
            {fmt(totalDim)} <span className="text-base text-ink-muted">{u.wt}</span>
          </dd>
        </div>
        <div className="bg-[#F6F9FF] p-5 sm:p-6">
          <dt className="text-[15px] font-medium text-ink">Chargeable weight</dt>
          <dd className="mt-1 text-[1.8rem] leading-none tracking-[-0.03em] text-brand" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
            {fmt(totalCharge)} <span className="text-base text-ink-muted">{u.wt}</span>
          </dd>
        </div>
      </dl>

      <div className="border-t border-[var(--line)] p-5 text-[16px] leading-relaxed text-ink sm:p-6" aria-live="polite">
        <p>
          {boxes === 0
            ? "Enter the size and weight of your box to see the weight carriers will bill you on."
            : anyBySize
              ? "At least one of your boxes is billed on its size, not its weight. A smaller box, or packing more snugly, could lower the price."
              : "Your boxes are billed on their actual weight, because that's the greater number for each one."}
          {missingDims && boxes > 0 && " Some boxes are missing measurements, so their size isn't counted yet."}
        </p>
      </div>

      <div className="flex flex-col gap-4 border-t border-[var(--line)] p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <label htmlFor={`${id}-country`} className="block w-full sm:max-w-sm">
          <span className="text-[15px] font-medium text-ink">
            Where is it going? <span className="font-normal text-ink-muted">(optional)</span>
          </span>
          <span className={FRAME}>
            <select
              id={`${id}-country`}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full min-w-0 cursor-pointer bg-transparent px-3.5 py-3 text-[16px] text-ink outline-none"
            >
              <option value="">Not sure yet</option>
              <option value="US">United States (within the US)</option>
              {DESTINATIONS.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </span>
        </label>
        <Link href={quoteHref} className="btn btn-primary btn-lg min-h-[48px] shrink-0 justify-center">
          Get your exact price <ArrowRightIcon size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
