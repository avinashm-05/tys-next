"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Port of the Alpine x-cft-calculator: volume per package = L×W×H / 1728
// (cubic inches → cubic feet), 2 dp, summed. A standalone staff scratchpad —
// independent of the quote's packages.
type Row = { id: number; length: string; width: string; height: string };

const cft = (r: Row): number => {
  const l = parseFloat(r.length);
  const w = parseFloat(r.width);
  const h = parseFloat(r.height);
  if ([l, w, h].some((n) => isNaN(n) || n <= 0)) return 0;
  return (l * w * h) / 1728;
};

export function CftCalculator() {
  const [rows, setRows] = useState<Row[]>([{ id: 1, length: "", width: "", height: "" }]);
  const [nextId, setNextId] = useState(2);

  const total = rows.reduce((sum, r) => sum + cft(r), 0);

  function update(id: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }
  function addRow() {
    setRows((prev) => [...prev, { id: nextId, length: "", width: "", height: "" }]);
    setNextId((n) => n + 1);
  }
  function removeRow(id: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>CFT calculator</CardTitle>
        <Button variant="outline" size="sm" onClick={addRow}>
          <PlusIcon /> Add package
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-2 font-medium">Length (in)</th>
                <th className="p-2 font-medium">Width (in)</th>
                <th className="p-2 font-medium">Height (in)</th>
                <th className="p-2 font-medium">CFT</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  {(["length", "width", "height"] as const).map((f) => (
                    <td key={f} className="p-2">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={r[f]}
                        onChange={(e) => update(r.id, f, e.target.value)}
                        aria-label={`${f} in inches`}
                        className="max-w-28"
                      />
                    </td>
                  ))}
                  <td className="p-2 font-mono">{cft(r).toFixed(2)}</td>
                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={rows.length === 1}
                      onClick={() => removeRow(r.id)}
                      aria-label="Remove package"
                    >
                      <TrashIcon />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="p-2 text-right font-medium">
                  Total CFT
                </td>
                <td className="p-2 font-mono font-medium">{total.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
