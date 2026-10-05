"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CaretDownIcon,
  CaretUpIcon,
  PaperPlaneTiltIcon,
  PercentIcon,
  SlidersHorizontalIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { ALLOWED_CURRENCIES } from "@/lib/validation/quote-price";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { openQuoteComposer } from "@/lib/quote-composer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FedExRatesTable,
  FedExRateUnavailable,
  money,
  PACKAGING_TYPES,
  PICKUP_TYPES,
  type Rate,
} from "@/components/admin/fedex-rates-table";

type RatesResponse =
  | { success: true; automated: boolean; rates: Rate[]; markupPercent: number }
  | { success: false; automated: boolean; message: string };

// A callback-support discount has to apply PER service category, not to one
// vague "current price" — FedEx returns several (Ground, 2Day, Overnight…)
// at very different price points, so "10% off" only means something once you
// know which one it's off of. This computes it inline against each row (and
// against the already-locked price, for the "call back later" case) and
// locks the result through the same real price-lock endpoint "Use this rate"
// already uses (source:"service" takes a final amount directly — no markup
// re-applied, so a discounted number is safe to send as-is).
//
// A "percent" discount comes straight off TYS's own margin, not the total —
// e.g. a 40% markup with a 10% discount becomes a 30% markup, not 10% off
// the marked-up total. "flat" is a direct dollar amount off the margin
// instead (equivalent either way, since the FedEx cost itself is fixed),
// floored at the raw FedEx cost so a discount can never go below cost.
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function applyDiscount(
  rawCost: number,
  markupPercent: number,
  type: "percent" | "flat",
  value: number,
): number {
  if (type === "percent") {
    const newMarkupPercent = Math.max(0, markupPercent - value);
    return round2(rawCost * (1 + newMarkupPercent / 100));
  }
  const markedUp = rawCost * (1 + markupPercent / 100);
  return Math.max(round2(rawCost), round2(markedUp - value));
}

export function FedExRatesPanel({
  quoteId,
  isResidence,
  defaultCurrency,
  currentAmount,
  packageType,
  onBeforeGetRates,
}: {
  quoteId: number;
  isResidence: boolean;
  defaultCurrency: string;
  currentAmount: number | null;
  packageType: string;
  /** Unused since the composer owns sending; kept so callers don't change. */
  sendTo?: string | null;
  // This panel always rates whatever the DB currently has (the /fedex-rates
  // route re-reads the quote fresh on every call), so the editor saves first.
  onBeforeGetRates?: () => Promise<boolean>;
}) {
  const router = useRouter();
  // Only box/television line items actually send this to FedEx (see
  // rate-quote.ts) — envelope/furniture/auto always ship in FedEx's own
  // fixed packaging, so the control is misleading (and inert) for those.
  const packagingTypeApplies = packageType
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .some((t) => t === "box" || t === "boxes" || t === "television");
  const [packagingType, setPackagingType] = useState("YOUR_PACKAGING");
  const [pickupType, setPickupType] = useState("DROPOFF_AT_FEDEX_LOCATION");
  const [shipDate, setShipDate] = useState(new Date().toISOString().slice(0, 10));
  const [residence, setResidence] = useState(isResidence);
  const [showParams, setShowParams] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RatesResponse | null>(null);

  // Manual entry (international / auto-rating failed).
  const manualCurrencyDefault = ALLOWED_CURRENCIES.includes(defaultCurrency as never) ? defaultCurrency : "USD";
  const [baseRate, setBaseRate] = useState("");
  const [manualCurrency, setManualCurrency] = useState(manualCurrencyDefault);
  const [locking, setLocking] = useState(false);

  // Optional discount (customer called back): taken off TYS's margin, never
  // below the FedEx cost. Hidden behind a link until someone needs it.
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const parsedDiscount = parseFloat(discountValue);
  const discount =
    discountOpen && !isNaN(parsedDiscount) && parsedDiscount > 0 ? { type: discountType, value: parsedDiscount } : null;

  async function getRates() {
    setLoading(true);
    setResult(null);
    if (onBeforeGetRates) {
      const saved = await onBeforeGetRates();
      if (!saved) {
        setLoading(false);
        return;
      }
    }
    try {
      const overrides = JSON.stringify({
        packaging_type: packagingType,
        pickup_type: pickupType,
        ship_date: shipDate,
        is_residence: residence,
      });
      const res = await adminApi<RatesResponse>(
        `/api/admin/quotes/${quoteId}/fedex-rates?overrides=${encodeURIComponent(overrides)}`,
      );
      setResult(res);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't fetch FedEx rates.");
    } finally {
      setLoading(false);
    }
  }

  // ONE action per price (2026-10-05): "Use this price" opens the Send quote
  // composer filled in. With a discount, the full price becomes the
  // crossed-out original.
  function pickRate(r: Rate, markupPercent: number) {
    const price = discount ? applyDiscount(r.raw_total_charge, markupPercent, discount.type, discount.value) : r.total_charge;
    openQuoteComposer({
      serviceName: r.service_name,
      price,
      currency: r.currency,
      originalAmount: price < r.total_charge ? r.total_charge : undefined,
      deliveryTime: r.estimated_delivery || undefined,
    });
  }

  async function useManualRate() {
    setLocking(true);
    try {
      // The server applies the international markup to the FedEx cost.
      const saved = await adminApi<{ estimatedCost: string; currency: string }>(`/api/admin/quotes/${quoteId}/price`, {
        method: "PATCH",
        body: JSON.stringify({ source: "manual", baseRate, currency: manualCurrency }),
      });
      setBaseRate("");
      router.refresh();
      openQuoteComposer({ price: Number(saved.estimatedCost), currency: saved.currency });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't work out the price.");
    } finally {
      setLocking(false);
    }
  }

  const showManual = result !== null && !result.success;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>FedEx prices</CardTitle>
        <CardDescription>Get today&rsquo;s FedEx prices for this shipment, then pick one to send.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setShowParams((v) => !v)}
          className="flex items-center gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontalIcon size={13} />
          {packagingTypeApplies
            ? PACKAGING_TYPES.find(([v]) => v === packagingType)?.[1]
            : "Fixed FedEx packaging"} ·{" "}
          {PICKUP_TYPES.find(([v]) => v === pickupType)?.[1]} · Ship {shipDate} ·{" "}
          {residence ? "Residential" : "Commercial"}
          {showParams ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
        </button>

        {showParams && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="rp-packaging">
                Packaging type
              </label>
              {packagingTypeApplies ? (
                <Select value={packagingType} onValueChange={setPackagingType}>
                  <SelectTrigger id="rp-packaging">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGING_TYPES.map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div
                  id="rp-packaging"
                  className="flex h-10 items-center rounded-xl border border-dashed border-input px-3.5 text-sm text-muted-foreground"
                  title="Envelope, furniture, and auto shipments always use FedEx's own fixed packaging — this doesn't apply to them."
                >
                  Fixed by FedEx — not configurable
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="rp-pickup">
                Pickup type
              </label>
              <Select value={pickupType} onValueChange={setPickupType}>
                <SelectTrigger id="rp-pickup">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PICKUP_TYPES.map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="rp-shipdate">
                Ship date
              </label>
              <Input
                id="rp-shipdate"
                type="date"
                value={shipDate}
                onChange={(e) => setShipDate(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <Checkbox
                checked={residence}
                onCheckedChange={(v) => setResidence(v === true)}
              />
              Residential delivery
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={getRates} disabled={loading}>
            {loading ? "Getting prices…" : result ? "Refresh prices" : "Get FedEx prices"}
          </Button>
          {currentAmount != null && (
            <Button variant="outline" onClick={() => openQuoteComposer({ price: currentAmount, currency: defaultCurrency })}>
              Send the saved price ({money(currentAmount, defaultCurrency)})
            </Button>
          )}
          {result?.success && (
            <button
              type="button"
              onClick={() => setDiscountOpen((v) => !v)}
              className="ml-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <TagIcon size={15} />
              {discountOpen ? "No discount" : "Give a discount"}
            </button>
          )}
        </div>

        {discountOpen && result?.success && (
          <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-brand-softer p-3">
            <div className="inline-flex rounded-lg border bg-card p-0.5">
              {(["percent", "flat"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDiscountType(t)}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm",
                    discountType === t ? "bg-tys-blue text-white" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "percent" ? <><PercentIcon size={13} /> Percent</> : `${defaultCurrency} amount`}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={0}
              step="0.01"
              className="w-28"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percent" ? "10" : "20.00"}
              aria-label="Discount"
            />
            <p className="text-xs text-muted-foreground">Taken off our margin only, never below the FedEx cost.</p>
          </div>
        )}

        {result?.success && (
          <FedExRatesTable
            rates={result.rates}
            markupPercent={result.markupPercent}
            renderAction={(r) => {
              const discounted = discount
                ? applyDiscount(r.raw_total_charge, result.markupPercent, discount.type, discount.value)
                : null;
              return (
                <div className="flex items-center justify-end gap-3">
                  {discounted != null && (
                    <span className="text-xs whitespace-nowrap">
                      <span className="text-muted-foreground line-through">{money(r.total_charge, r.currency)}</span>{" "}
                      <span className="font-semibold text-emerald-700">{money(discounted, r.currency)}</span>
                    </span>
                  )}
                  <Button size="sm" onClick={() => pickRate(r, result.markupPercent)}>
                    <PaperPlaneTiltIcon size={14} weight="bold" /> Use this price
                  </Button>
                </div>
              );
            }}
          />
        )}

        {showManual && (
          <FedExRateUnavailable message={(result as { message: string }).message}>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground" htmlFor="manual-rate">
                  FedEx cost
                </label>
                <Input
                  id="manual-rate"
                  type="number"
                  step="0.01"
                  min={0}
                  value={baseRate}
                  onChange={(e) => setBaseRate(e.target.value)}
                  className="w-36"
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground" htmlFor="manual-currency">
                  Currency
                </label>
                <Select value={manualCurrency} onValueChange={setManualCurrency}>
                  <SelectTrigger id="manual-currency" className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWED_CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={useManualRate} disabled={locking || !(Number(baseRate) > 0)}>
                <PaperPlaneTiltIcon size={14} weight="bold" />
                {locking ? "Working out price…" : "Use this price"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Our markup is added automatically.</p>
          </FedExRateUnavailable>
        )}
      </CardContent>
    </Card>
  );
}
