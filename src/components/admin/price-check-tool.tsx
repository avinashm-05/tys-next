"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CurrencyDollarIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { COUNTRY_LIST } from "@/lib/countries-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionIconBadge } from "@/components/admin/section-icon-badge";
import {
  FedExRatesTable,
  FedExRateUnavailable,
  PACKAGING_TYPES,
  type Rate,
} from "@/components/admin/fedex-rates-table";

// A4.4 Price Check — ad-hoc chargeable weight + FedEx rates, no quote created.
// Per-row CW previews live client-side (same reused formula); the numbers in
// the results section are the server's (markups applied there, R27/R3).

// FedEx Envelope is a fixed-size package — same dimensions the public quote
// wizard's "envelope" defaults use (src/lib/fedex/config.ts PACKAGE_DEFAULTS).
const ENVELOPE_DIMENSIONS_IN = { length: "12", width: "9", height: "1" };

type PackageRow = {
  weight: string;
  // Combined toggle (matches the public quote wizard): "lb" implies inches,
  // "kg" implies centimeters — one control, not two independent unit pickers.
  weight_unit: "lb" | "kg";
  length: string;
  width: string;
  height: string;
  quantity: string;
  // Reference field not sent to the API yet — visual only until the FedEx
  // integration is extended to use it.
  insuredValue: string;
};

type PriceCheckResponse = {
  chargeable: { perPackage: { chargeable: string; quantity: number }[]; total: string };
  rates:
    | { success: true; rates: Rate[]; markupPercent: number; dutiesTaxesIncluded?: boolean }
    | { success: false; message: string };
};

const emptyRow = (): PackageRow => ({
  weight: "",
  weight_unit: "lb",
  length: "",
  width: "",
  height: "",
  quantity: "1",
  insuredValue: "",
});

/** Live per-row preview — same formula the server uses; empty dims fall back to weight. */
function rowPreview(row: PackageRow): string | null {
  const weight = parseFloat(row.weight);
  if (!Number.isFinite(weight) || weight <= 0) return null;
  const cw = calculateChargeableWeight(
    weight,
    {
      length: parseFloat(row.length) || 0,
      width: parseFloat(row.width) || 0,
      height: parseFloat(row.height) || 0,
    },
    row.weight_unit,
  );
  return cw.toFixed(2);
}

function CountrySelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select country" />
      </SelectTrigger>
      <SelectContent>
        {COUNTRY_LIST.map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Auto-fills a city from a postal code via our own /api/admin/zip-lookup
 * (server-side Nominatim call — a direct browser fetch to a third-party host
 * would need a CSP connect-src exception this app deliberately doesn't grant)
 * — debounced, best-effort, never blocks typing the city in by hand instead.
 */
function useCityLookup(country: string, zip: string, setCity: (city: string) => void) {
  useEffect(() => {
    const trimmed = zip.trim();
    if (!country || trimmed.length < 3) return;
    const t = setTimeout(() => {
      adminApi<{ city: string | null }>("/api/admin/zip-lookup", {
        method: "POST",
        body: JSON.stringify({ postal_code: trimmed, country }),
      })
        .then((res) => {
          if (res.city) setCity(res.city);
        })
        .catch(() => {
          /* best-effort only — the admin can always type the city manually */
        });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, zip]);
}

const emptyState = {
  fromCountry: "US",
  fromZip: "",
  fromCity: "",
  toCountry: "US",
  toZip: "",
  toCity: "",
  residence: false,
  packagingType: "YOUR_PACKAGING",
  shipDate: new Date().toISOString().slice(0, 10),
};

export function PriceCheckTool() {
  const [fromCountry, setFromCountry] = useState(emptyState.fromCountry);
  const [fromZip, setFromZip] = useState(emptyState.fromZip);
  const [fromCity, setFromCity] = useState(emptyState.fromCity);
  const [toCountry, setToCountry] = useState(emptyState.toCountry);
  const [toZip, setToZip] = useState(emptyState.toZip);
  const [toCity, setToCity] = useState(emptyState.toCity);
  const [residence, setResidence] = useState(emptyState.residence);
  const [packagingType, setPackagingType] = useState(emptyState.packagingType);
  const [shipDate, setShipDate] = useState(emptyState.shipDate);
  const [rows, setRows] = useState<PackageRow[]>([emptyRow()]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<PriceCheckResponse | null>(null);

  useCityLookup(fromCountry, fromZip, setFromCity);
  useCityLookup(toCountry, toZip, setToCity);

  const isFixedSize = packagingType === "FEDEX_ENVELOPE";

  const setRow = (i: number, patch: Partial<PackageRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  // FedEx Envelope has one fixed size — lock every row to it the moment it's
  // selected (a direct response to that selection, not a derived effect).
  function selectPackagingType(next: string) {
    setPackagingType(next);
    if (next === "FEDEX_ENVELOPE") {
      setRows((rs) => rs.map((r) => ({ ...r, weight_unit: "lb", ...ENVELOPE_DIMENSIONS_IN })));
    }
  }

  function addRow() {
    setRows((rs) => [
      ...rs,
      isFixedSize
        ? { ...emptyRow(), weight_unit: "lb", ...ENVELOPE_DIMENSIONS_IN }
        : emptyRow(),
    ]);
  }

  function reset() {
    setFromCountry(emptyState.fromCountry);
    setFromZip(emptyState.fromZip);
    setFromCity(emptyState.fromCity);
    setToCountry(emptyState.toCountry);
    setToZip(emptyState.toZip);
    setToCity(emptyState.toCity);
    setResidence(emptyState.residence);
    setPackagingType(emptyState.packagingType);
    setShipDate(emptyState.shipDate);
    setRows([emptyRow()]);
    setErrors({});
    setResult(null);
  }

  async function check() {
    // FedEx's Rate API rejects zero-value dimensions with an opaque "service
    // unavailable" error rather than a clear validation message — catch it
    // here instead of letting the admin hit that dead end.
    const dimErrors: Record<string, string[]> = {};
    rows.forEach((r, i) => {
      const missing = (["length", "width", "height"] as const).filter(
        (k) => !(parseFloat(r[k]) > 0),
      );
      if (missing.length > 0) {
        dimErrors[`packages.${i}.dimensions`] = [
          "Length, width, and height must all be greater than 0.",
        ];
      }
    });
    if (Object.keys(dimErrors).length > 0) {
      setErrors(dimErrors);
      toast.error("Every package needs length, width, and height greater than 0.");
      return;
    }

    setLoading(true);
    setErrors({});
    setResult(null);
    try {
      const res = await adminApi<PriceCheckResponse>("/api/admin/price-check", {
        method: "POST",
        body: JSON.stringify({
          from_country: fromCountry,
          from_zip: fromZip,
          to_country: toCountry,
          to_zip: toZip,
          is_residence: residence,
          packaging_type: packagingType,
          packages: rows.map((r) => ({
            weight: r.weight,
            weight_unit: r.weight_unit,
            length: r.length || null,
            width: r.width || null,
            height: r.height || null,
            quantity: r.quantity || 1,
          })),
        }),
      });
      setResult(res);
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        setErrors(e.errors);
        toast.error(e.message);
      } else {
        toast.error(e instanceof ApiError ? e.message : "Price check failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  const fieldError = (key: string) => errors[key]?.[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-tys-blue text-white">
          <CurrencyDollarIcon size={22} weight="bold" />
        </div>
        <h1 className="text-h2">Get Rates</h1>
      </div>

      <Card className="overflow-visible">
        <div className="rounded-t-2xl bg-tys-rose py-2.5 text-center text-sm font-bold tracking-wide text-white uppercase">
          Air / Ground
        </div>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-from-country">
                From country
              </label>
              <CountrySelect id="pc-from-country" value={fromCountry} onChange={setFromCountry} />
              {fieldError("from_country") && (
                <p className="text-xs text-destructive">{fieldError("from_country")}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-from-zip">
                From zip code
              </label>
              <Input
                id="pc-from-zip"
                value={fromZip}
                onChange={(e) => setFromZip(e.target.value)}
                maxLength={20}
                placeholder="30301"
              />
              {fieldError("from_zip") && (
                <p className="text-xs text-destructive">{fieldError("from_zip")}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-from-city">
                From city
              </label>
              <Input
                id="pc-from-city"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="Fetched from zip code…"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-to-country">
                To country
              </label>
              <CountrySelect id="pc-to-country" value={toCountry} onChange={setToCountry} />
              {fieldError("to_country") && (
                <p className="text-xs text-destructive">{fieldError("to_country")}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-to-zip">
                To zip code
              </label>
              <Input
                id="pc-to-zip"
                value={toZip}
                onChange={(e) => setToZip(e.target.value)}
                maxLength={20}
                placeholder="10001"
              />
              {fieldError("to_zip") && (
                <p className="text-xs text-destructive">{fieldError("to_zip")}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-to-city">
                To city
              </label>
              <Input
                id="pc-to-city"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="Fetched from zip code…"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-residence">
                Residential
              </label>
              <Select
                value={residence ? "yes" : "no"}
                onValueChange={(v) => setResidence(v === "yes")}
              >
                <SelectTrigger id="pc-residence" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-packaging">
                Package type
              </label>
              <Select value={packagingType} onValueChange={selectPackagingType}>
                <SelectTrigger id="pc-packaging" className="w-full">
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
              {isFixedSize && (
                <p className="text-xs text-muted-foreground">
                  Fixed size — dimensions below are set automatically.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground" htmlFor="pc-ship-date">
                Ship date
              </label>
              <Input
                id="pc-ship-date"
                type="date"
                value={shipDate}
                onChange={(e) => setShipDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-base font-semibold">Package details</h2>
            <div className="overflow-x-auto rounded-xl border border-tys-mist">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-16">No.</TableHead>
                    <TableHead className="min-w-44">Weight</TableHead>
                    <TableHead className="min-w-56">Dimensions</TableHead>
                    <TableHead className="min-w-24">Qty</TableHead>
                    <TableHead className="min-w-32">Chargeable weight</TableHead>
                    <TableHead className="min-w-36">Insured value (USD)</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => {
                    const preview = rowPreview(row);
                    return (
                      <TableRow key={i}>
                        <TableCell className="text-sm text-muted-foreground">#{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            <Input
                              type="number"
                              step="0.01"
                              min={0.01}
                              className="w-20"
                              value={row.weight}
                              onChange={(e) => setRow(i, { weight: e.target.value })}
                              aria-label={`Package ${i + 1} weight`}
                            />
                            <Select
                              value={row.weight_unit}
                              onValueChange={(v) => setRow(i, { weight_unit: v as "lb" | "kg" })}
                              disabled={isFixedSize}
                            >
                              <SelectTrigger className="w-28" aria-label={`Package ${i + 1} unit`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lb">LB / IN</SelectItem>
                                <SelectItem value="kg">KG / CM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {fieldError(`packages.${i}.weight`) && (
                            <p className="mt-1 text-xs text-destructive">
                              {fieldError(`packages.${i}.weight`)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              className="w-16"
                              placeholder="L"
                              value={row.length}
                              onChange={(e) => setRow(i, { length: e.target.value })}
                              aria-label={`Package ${i + 1} length`}
                              disabled={isFixedSize}
                            />
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              className="w-16"
                              placeholder="W"
                              value={row.width}
                              onChange={(e) => setRow(i, { width: e.target.value })}
                              aria-label={`Package ${i + 1} width`}
                              disabled={isFixedSize}
                            />
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              className="w-16"
                              placeholder="H"
                              value={row.height}
                              onChange={(e) => setRow(i, { height: e.target.value })}
                              aria-label={`Package ${i + 1} height`}
                              disabled={isFixedSize}
                            />
                          </div>
                          {fieldError(`packages.${i}.dimensions`) && (
                            <p className="mt-1 text-xs text-destructive">
                              {fieldError(`packages.${i}.dimensions`)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            step="1"
                            className="w-16"
                            value={row.quantity}
                            onChange={(e) => setRow(i, { quantity: e.target.value })}
                            aria-label={`Package ${i + 1} quantity`}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {preview !== null ? `${preview} ${row.weight_unit}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            className="w-28"
                            placeholder="0.00"
                            value={row.insuredValue}
                            onChange={(e) => setRow(i, { insuredValue: e.target.value })}
                            aria-label={`Package ${i + 1} insured value`}
                          />
                        </TableCell>
                        <TableCell>
                          {rows.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                              aria-label={`Remove package ${i + 1}`}
                            >
                              <TrashIcon size={16} />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Ship date and insured value are for your reference — they aren&apos;t applied to the
              rate yet.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              className="bg-tys-blue text-white uppercase hover:bg-tys-blue/90"
              onClick={addRow}
            >
              <PlusIcon size={16} weight="bold" />
              Add new row
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="uppercase" onClick={reset} disabled={loading}>
                Reset
              </Button>
              <Button
                onClick={check}
                disabled={loading}
                className="bg-tys-rose text-white uppercase hover:bg-tys-rose/90"
              >
                {loading ? "Getting rate…" : "Get rate"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="overflow-visible">
          <CardContent>
            <div className="mb-4 flex items-center gap-4">
              <SectionIconBadge icon={CurrencyDollarIcon} className="bg-tys-teal" />
              <div>
                <h2 className="font-heading text-lg font-semibold">Chargeable weight</h2>
                <CardDescription>
                  max(actual, L×W×H ÷ {"{"}139 lb | 5000 kg{"}"}) per package, × quantity.
                </CardDescription>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-tys-mist">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead className="text-right">Chargeable</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.chargeable.perPackage.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>#{i + 1}</TableCell>
                      <TableCell className="text-right">{p.chargeable}</TableCell>
                      <TableCell className="text-right">{p.quantity}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium">Total</TableCell>
                    <TableCell className="text-right font-medium">
                      {result.chargeable.total}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping rates</CardTitle>
            <CardDescription>Markup applied server-side; retail struck through.</CardDescription>
          </CardHeader>
          <CardContent>
            {result.rates.success ? (
              <FedExRatesTable rates={result.rates.rates} markupPercent={result.rates.markupPercent} />
            ) : (
              <FedExRateUnavailable message={result.rates.message} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
