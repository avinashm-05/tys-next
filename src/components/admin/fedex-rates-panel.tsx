"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminApi, ApiError } from "@/lib/admin-api";
import { ALLOWED_CURRENCIES } from "@/lib/validation/quote-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

export function FedExRatesPanel({
  quoteId,
  isResidence,
  defaultCurrency,
}: {
  quoteId: number;
  isResidence: boolean;
  defaultCurrency: string;
}) {
  const router = useRouter();
  const [packagingType, setPackagingType] = useState("YOUR_PACKAGING");
  const [pickupType, setPickupType] = useState("DROPOFF_AT_FEDEX_LOCATION");
  const [shipDate, setShipDate] = useState(new Date().toISOString().slice(0, 10));
  const [residence, setResidence] = useState(isResidence);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RatesResponse | null>(null);
  const [lockingKey, setLockingKey] = useState<string | null>(null);

  // Manual entry (international / auto-failed).
  const manualCurrencyDefault = ALLOWED_CURRENCIES.includes(defaultCurrency as never)
    ? defaultCurrency
    : "USD";
  const [baseRate, setBaseRate] = useState("");
  const [manualCurrency, setManualCurrency] = useState(manualCurrencyDefault);

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

  async function lockService(rate: Rate) {
    setLockingKey(rate.service_type);
    try {
      await adminApi(`/api/admin/quotes/${quoteId}/price`, {
        method: "PATCH",
        body: JSON.stringify({
          source: "service",
          amount: rate.total_charge,
          currency: rate.currency,
        }),
      });
      toast.success(`Price locked: ${money(rate.total_charge, rate.currency)} (${rate.service_name}).`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't lock the price.");
    } finally {
      setLockingKey(null);
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
    <Card>
      <CardHeader>
        <CardTitle>FedEx live rates</CardTitle>
        <CardDescription>
          Pull automated rates (US↔US) or enter a rate manually, then lock in the quoted price.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="rp-packaging">
              Packaging type
            </label>
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

        <div>
          <Button
            onClick={getRates}
            disabled={loading}
            className="bg-tys-orange text-white hover:bg-tys-orange/90"
          >
            {loading ? "Fetching rates…" : "Get live rates"}
          </Button>
        </div>

        {result?.success && (
          <FedExRatesTable
            rates={result.rates}
            renderAction={(r) => (
              <Button
                variant="outline"
                size="sm"
                disabled={lockingKey !== null}
                onClick={() => lockService(r)}
              >
                Use this rate
              </Button>
            )}
          />
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
                className="bg-tys-orange text-white hover:bg-tys-orange/90"
              >
                Lock manual price
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The international markup is applied to your base rate on the server.
            </p>
          </FedExRateUnavailable>
        )}
      </CardContent>
    </Card>
  );
}
