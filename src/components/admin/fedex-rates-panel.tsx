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
  // route re-reads the quote fresh on every call) — it never saw the sibling
  // editor's in-memory package edits. Staff who typed a weight/dimension and
  // hit "Get live rates" without saving first would silently rate the OLD
  // (pre-edit) package data with no indication anything was stale — exactly
  // the kind of mismatch that prompted this investigation. Saving here first
  // closes that gap instead of just documenting it.
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
  // This is a re-rate of what the customer already told us (residential
  // comes straight from their quote) — the rest are sensible FedEx-call
  // defaults, not something to edit on every visit. Hidden unless support
  // actually needs to change one, so "Get live rates" reads as the primary
  // action instead of a form.
  const [showParams, setShowParams] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RatesResponse | null>(null);
  const [lockingKey, setLockingKey] = useState<string | null>(null);
  // Check one or more services — a single "Send quote" button below handles
  // both cases through the same endpoint (which already renders a single
  // price line vs. a comparison table depending on count), so there's no
  // separate "lock this one" vs. "email these as options" split anymore.
  const [selectedRates, setSelectedRates] = useState<Set<string>>(new Set());

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
    if (onBeforeGetRates) {
      const saved = await onBeforeGetRates();
      if (!saved) {
        // handleSave already toasted the specific error — just stop here
        // instead of rating stale (or, on a first-ever save, nonexistent)
        // package data.
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

  // Since 2026-10-05 this card no longer emails anything itself: there is ONE
  // "Send quote" (the composer at the top of the page, with preview, PDF and
  // WhatsApp text). This button hands the composer what's picked here:
  //  - checked rate(s) → the first one's price (discounted if the discount is
  //    on, with the full rate as the crossed-out original); the rest are
  //    listed as other options
  //  - a manual base rate → locked first (markup applied on the server)
  //  - neither → the price already locked on the quote
  const hasSelection = selectedRates.size > 0 && result?.success;
  const hasManualEntry = baseRate.trim() !== "";
  const canSend = hasSelection || hasManualEntry || currentAmount != null;
  const [handingOff, setHandingOff] = useState(false);

  async function handleUseInQuote() {
    if (hasSelection && result?.success) {
      const picked = result.rates.filter((r) => selectedRates.has(r.service_type));
      const priced = picked.map((r) => {
        const discounted = discount
          ? applyDiscount(r.raw_total_charge, result.markupPercent, discount.type, discount.value)
          : null;
        return { rate: r, price: discounted ?? r.total_charge };
      });
      const [first, ...rest] = priced;
      openQuoteComposer({
        serviceName: first.rate.service_name,
        price: first.price,
        currency: first.rate.currency,
        originalAmount: first.price < first.rate.total_charge ? first.rate.total_charge : undefined,
        deliveryTime: first.rate.estimated_delivery || undefined,
        otherOptions: rest.map((o) => ({ serviceName: o.rate.service_name, price: o.price, currency: o.rate.currency })),
      });
      return;
    }
    if (hasManualEntry) {
      setHandingOff(true);
      try {
        const saved = await adminApi<{ estimatedCost: string; currency: string }>(
          `/api/admin/quotes/${quoteId}/price`,
          {
            method: "PATCH",
            body: JSON.stringify({ source: "manual", baseRate, currency: manualCurrency }),
          },
        );
        setBaseRate("");
        router.refresh();
        openQuoteComposer({ price: Number(saved.estimatedCost), currency: saved.currency });
      } catch (e) {
        toast.error(e instanceof ApiError ? e.message : "Couldn't lock the price.");
      } finally {
        setHandingOff(false);
      }
      return;
    }
    openQuoteComposer({ price: currentAmount ?? undefined, currency: defaultCurrency });
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
              Check a service and press <span className="font-medium text-foreground">Use in quote email</span>{" "}
              to open it in the quote composer. Check more than one to list the others as options.
            </p>
            <FedExRatesTable
              rates={result.rates}
              markupPercent={result.markupPercent}
              selection={{ selected: selectedRates, onToggle: toggleRateSelection }}
              renderAction={(r) => {
                const discounted = discount
                  ? applyDiscount(r.raw_total_charge, result.markupPercent, discount.type, discount.value)
                  : null;
                return discounted != null ? (
                  <span className="text-xs">
                    <span className="text-muted-foreground line-through">
                      {money(r.total_charge, r.currency)}
                    </span>{" "}
                    <span className="font-semibold text-tys-rose">{money(discounted, r.currency)}</span>
                  </span>
                ) : null;
              }}
            />
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
            </div>
            <p className="text-xs text-muted-foreground">
              Use in quote email below will lock this rate (international markup applied on the server)
              and open it in the quote composer.
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

        {/* Hands the picked price to the one "Send quote" composer. */}
        <div className="flex items-center justify-end rounded-xl border border-tys-mist bg-muted/20 p-4">
          <Button
            size="lg"
            className="bg-tys-blue text-white hover:bg-tys-blue/90"
            disabled={!canSend || handingOff}
            onClick={handleUseInQuote}
          >
            <PaperPlaneTiltIcon size={16} weight="bold" />
            {handingOff ? "Locking price…" : "Use in quote email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
