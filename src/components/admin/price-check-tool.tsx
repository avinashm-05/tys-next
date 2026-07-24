"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminApi, ApiError } from "@/lib/admin-api";
import { calculateChargeableWeight } from "@/lib/chargeable-weight";
import { COUNTRY_LIST } from "@/lib/countries-list";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FedExRatesTable,
  FedExRateUnavailable,
  PACKAGING_TYPES,
  type Rate,
} from "@/components/admin/fedex-rates-table";

// A4.4 Price Check — ad-hoc chargeable weight + FedEx rates, no quote created.
// Per-row CW previews live client-side (same reused formula); the numbers in
// the results section are the server's (markups applied there, R27/R3).

type PackageRow = {
  weight: string;
  weight_unit: "lb" | "kg";
  length: string;
  width: string;
  height: string;
  quantity: string;
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
      <SelectTrigger id={id}>
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

export function PriceCheckTool() {
  const [fromCountry, setFromCountry] = useState("US");
  const [fromZip, setFromZip] = useState("");
  const [toCountry, setToCountry] = useState("US");
  const [toZip, setToZip] = useState("");
  const [residence, setResidence] = useState(false);
  const [packagingType, setPackagingType] = useState("YOUR_PACKAGING");
  const [rows, setRows] = useState<PackageRow[]>([emptyRow()]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<PriceCheckResponse | null>(null);

  const setRow = (i: number, patch: Partial<PackageRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  async function check() {
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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Price Check</h1>
        <p className="text-sm text-muted-foreground">
          Chargeable weight and live FedEx rates for an ad-hoc shipment — nothing is saved.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment</CardTitle>
          <CardDescription>
            US↔US rates automatically; other routes attempt international parcel rating.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="pc-from-country">
                From country
              </label>
              <CountrySelect id="pc-from-country" value={fromCountry} onChange={setFromCountry} />
              {fieldError("from_country") && (
                <p className="text-xs text-destructive">{fieldError("from_country")}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="pc-from-zip">
                From zip
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
              <label className="text-xs text-muted-foreground" htmlFor="pc-to-country">
                To country
              </label>
              <CountrySelect id="pc-to-country" value={toCountry} onChange={setToCountry} />
              {fieldError("to_country") && (
                <p className="text-xs text-destructive">{fieldError("to_country")}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="pc-to-zip">
                To zip
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
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="pc-packaging">
                Packaging type
              </label>
              <Select value={packagingType} onValueChange={setPackagingType}>
                <SelectTrigger id="pc-packaging" className="w-44">
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
            <label className="flex items-center gap-2 pb-2 text-sm">
              <Checkbox checked={residence} onCheckedChange={(v) => setResidence(v === true)} />
              Residential delivery
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Packages</h2>
              <Button variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, emptyRow()])}>
                Add package
              </Button>
            </div>
            {rows.map((row, i) => {
              const preview = rowPreview(row);
              return (
                <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
                  <span className="w-full text-xs font-medium text-muted-foreground sm:w-14 sm:pb-2">
                    #{i + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Weight</label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0.01}
                      className="w-24"
                      value={row.weight}
                      onChange={(e) => setRow(i, { weight: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Unit</label>
                    <Select
                      value={row.weight_unit}
                      onValueChange={(v) => setRow(i, { weight_unit: v as "lb" | "kg" })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lb">LB</SelectItem>
                        <SelectItem value="kg">KG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">L (in, optional)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-24"
                      value={row.length}
                      onChange={(e) => setRow(i, { length: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">W</label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-20"
                      value={row.width}
                      onChange={(e) => setRow(i, { width: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">H</label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="w-20"
                      value={row.height}
                      onChange={(e) => setRow(i, { height: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">Qty</label>
                    <Input
                      type="number"
                      min={1}
                      step="1"
                      className="w-16"
                      value={row.quantity}
                      onChange={(e) => setRow(i, { quantity: e.target.value })}
                    />
                  </div>
                  <div className="flex-1 pb-2 text-right text-xs text-muted-foreground">
                    {preview !== null && (
                      <>
                        CW ≈ <span className="font-medium">{preview}</span> {row.weight_unit}
                      </>
                    )}
                  </div>
                  {rows.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                    >
                      Remove
                    </Button>
                  )}
                  {fieldError(`packages.${i}.weight`) && (
                    <p className="w-full text-xs text-destructive">
                      {fieldError(`packages.${i}.weight`)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <Button
              onClick={check}
              disabled={loading}
              className="bg-tys-orange text-white hover:bg-tys-orange/90"
            >
              {loading ? "Checking…" : "Check price"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Chargeable weight</CardTitle>
            <CardDescription>
              max(actual, L×W×H ÷ {"{"}139 lb | 5000 kg{"}"}) per package, × quantity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
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
              <FedExRatesTable rates={result.rates.rates} />
            ) : (
              <FedExRateUnavailable message={result.rates.message} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
