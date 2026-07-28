"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CaretDownIcon, CaretUpIcon, PercentIcon, SlidersHorizontalIcon, TagIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { ALLOWED_CURRENCIES } from "@/lib/validation/quote-price";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
}: {
  quoteId: number;
  isResidence: boolean;
  defaultCurrency: string;
  currentAmount: number | null;
  packageType: string;
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
  // This is a re-rate of what the customer already told us (residential
  // comes straight from their quote) — the rest are sensible FedEx-call
  // defaults, not something to edit on every visit. Hidden unless support
  // actually needs to change one, so "Get live rates" reads as the primary
  // action instead of a form.
  const [showParams, setShowParams] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RatesResponse | null>(null);
  const [lockingKey, setLockingKey] = useState<string | null>(null);
  // Check a few services to email as options — nothing is locked by
  // checking a box. The customer picks one and tells us, and only THEN does
  // support lock it (per-row "Use this rate" below) and hit Send quote.
  const [selectedRates, setSelectedRates] = useState<Set<string>>(new Set());
  const [sendingOptions, setSendingOptions] = useState(false);

  // Manual entry (international / auto-failed).
  const manualCurrencyDefault = ALLOWED_CURRENCIES.includes(defaultCurrency as never)
    ? defaultCurrency
    : "USD";
  const [baseRate, setBaseRate] = useState("");
  const [manualCurrency, setManualCurrency] = useState(manualCurrencyDefault);

  // Discount for the callback-support scenario — off, until support turns it
  // on. Applies live to every rate row below, and optionally to the already-
  // locked price.
  const [discountOn, setDiscountOn] = useState(false);
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const parsedDiscount = parseFloat(discountValue);
  const discount = discountOn && !isNaN(parsedDiscount) && parsedDiscount > 0
    ? { type: discountType, value: parsedDiscount }
    : null;

  async function getRates() {
    setLoading(true);
    setResult(null);
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

  async function lockAmount(key: string, amount: number, currency: string, label: string) {
    setLockingKey(key);
    try {
      await adminApi(`/api/admin/quotes/${quoteId}/price`, {
        method: "PATCH",
        body: JSON.stringify({ source: "service", amount, currency }),
      });
      toast.success(`Price locked: ${money(amount, currency)} (${label}).`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't lock the price.");
    } finally {
      setLockingKey(null);
    }
  }

  function toggleRateSelection(serviceType: string, on: boolean) {
    setSelectedRates((prev) => {
      const next = new Set(prev);
      if (on) next.add(serviceType);
      else next.delete(serviceType);
      return next;
    });
  }

  async function sendSelectedOptions() {
    if (!result?.success) return;
    const rates = result.rates.filter((r) => selectedRates.has(r.service_type));
    if (rates.length === 0) return;
    setSendingOptions(true);
    try {
      const res = await adminApi<{ sentTo: string; count: number }>(
        `/api/admin/quotes/${quoteId}/send-options`,
        {
          method: "POST",
          body: JSON.stringify({
            rates: rates.map((r) => ({
              service_name: r.service_name,
              total_charge: r.total_charge,
              currency: r.currency,
            })),
          }),
        },
      );
      toast.success(`${res.count} option${res.count === 1 ? "" : "s"} sent to ${res.sentTo}.`);
      setSelectedRates(new Set());
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't send the options email.");
    } finally {
      setSendingOptions(false);
    }
  }

  async function lockManual() {
    setLockingKey("manual");
    try {
      const saved = await adminApi<{ estimatedCost: string; currency: string }>(
        `/api/admin/quotes/${quoteId}/price`,
        {
          method: "PATCH",
          body: JSON.stringify({ source: "manual", baseRate, currency: manualCurrency }),
        },
      );
      toast.success(`Price locked: ${saved.estimatedCost} ${saved.currency} (incl. intl markup).`);
      setBaseRate("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't lock the price.");
    } finally {
      setLockingKey(null);
    }
  }

  const showManual = result !== null && !result.success;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>FedEx live rates</CardTitle>
        <CardDescription>
          Pull automated rates (US↔US) or enter a rate manually, then lock in the quoted price.
        </CardDescription>
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

        <div>
          <Button
            onClick={getRates}
            disabled={loading}
            className="bg-tys-blue text-white hover:bg-tys-blue/90"
          >
            {loading ? "Fetching rates…" : "Get live rates"}
          </Button>
        </div>

        {result?.success && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              Check a few services and email them as options for the customer to pick from, or click{" "}
              <span className="font-medium text-foreground">Use this rate</span> to lock one in now (e.g.
              once they&rsquo;ve already told you which they want) and send it below.
            </p>
            <FedExRatesTable
              rates={result.rates}
              markupPercent={result.markupPercent}
              selection={{ selected: selectedRates, onToggle: toggleRateSelection }}
              renderAction={(r) => {
                const discounted = discount
                  ? applyDiscount(r.raw_total_charge, result.markupPercent, discount.type, discount.value)
                  : null;
                return (
                  <div className="flex flex-col items-end gap-1">
                    {discounted != null && (
                      <span className="text-xs">
                        <span className="text-muted-foreground line-through">
                          {money(r.total_charge, r.currency)}
                        </span>{" "}
                        <span className="font-semibold text-tys-rose">{money(discounted, r.currency)}</span>
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={lockingKey !== null}
                      onClick={() =>
                        lockAmount(r.service_type, discounted ?? r.total_charge, r.currency, r.service_name)
                      }
                    >
                      {discounted != null ? "Lock discounted rate" : "Use this rate"}
                    </Button>
                  </div>
                );
              }}
            />
            {selectedRates.size > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-md border border-tys-mist bg-muted/30 p-3">
                <p className="text-sm">
                  <span className="font-medium">{selectedRates.size}</span> option
                  {selectedRates.size === 1 ? "" : "s"} selected — nothing is locked yet.
                </p>
                <Button
                  className="bg-tys-indigo text-white hover:bg-tys-indigo/90"
                  disabled={sendingOptions}
                  onClick={sendSelectedOptions}
                >
                  {sendingOptions
                    ? "Sending…"
                    : `Email ${selectedRates.size} option${selectedRates.size === 1 ? "" : "s"} to customer`}
                </Button>
              </div>
            )}
          </div>
        )}

        {showManual && (
          <FedExRateUnavailable message={(result as { message: string }).message}>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground" htmlFor="manual-rate">
                  Base rate
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
              <Button
                onClick={lockManual}
                disabled={lockingKey !== null || baseRate.trim() === ""}
                className="bg-tys-blue text-white hover:bg-tys-blue/90"
              >
                Lock manual price
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The international markup is applied to your base rate on the server.
            </p>
          </FedExRateUnavailable>
        )}

        <div className="rounded-md border border-tys-mist p-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={discountOn} onCheckedChange={(v) => setDiscountOn(v === true)} />
            <TagIcon size={16} className="text-tys-rose" />
            Customer called back — apply a discount
          </label>
          {discountOn && (
            <div className="mt-3 flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Applies live to every service above — pick whichever category fits and lock the
                discounted number.
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="inline-flex rounded-md border border-input p-0.5">
                  <button
                    type="button"
                    onClick={() => setDiscountType("percent")}
                    className={cn(
                      "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm",
                      discountType === "percent"
                        ? "bg-tys-rose text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <PercentIcon size={14} />
                    Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("flat")}
                    className={cn(
                      "rounded px-3 py-1.5 text-sm",
                      discountType === "flat"
                        ? "bg-tys-rose text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {defaultCurrency} flat
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground" htmlFor="discount-value">
                    {discountType === "percent" ? "Percent off" : `Amount off (${defaultCurrency})`}
                  </label>
                  <Input
                    id="discount-value"
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-32"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percent" ? "10" : "20.00"}
                  />
                </div>
                {currentAmount != null && discount != null && result?.success && (() => {
                  // No stored breakdown for an already-locked price — back
                  // out the implied FedEx cost using the current markup
                  // setting so the same margin-based discount math applies.
                  const impliedRawCost = currentAmount / (1 + result.markupPercent / 100);
                  const newAmount = applyDiscount(impliedRawCost, result.markupPercent, discount.type, discount.value);
                  return (
                    <Button
                      variant="outline"
                      disabled={lockingKey !== null}
                      onClick={() => lockAmount("current", newAmount, defaultCurrency, "current locked price")}
                    >
                      Apply to current locked price ({money(currentAmount, defaultCurrency)} →{" "}
                      {money(newAmount, defaultCurrency)})
                    </Button>
                  );
                })()}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground" htmlFor="discount-reason">
                  Reason (internal note)
                </label>
                <Textarea
                  id="discount-reason"
                  rows={2}
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="e.g. price-matched a competitor, goodwill for a delayed callback…"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
