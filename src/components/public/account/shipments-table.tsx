"use client";

import { useMemo, useState } from "react";
import { CaretDownIcon, CaretUpIcon, TruckIcon } from "@phosphor-icons/react";
import { ShipmentStatusPill } from "@/components/public/account/account-nav";

export type PortalShipmentRow = {
  id: number;
  date: string;
  trackingNumber: string | null;
  senderName: string;
  senderCity: string;
  senderState: string;
  receiverName: string;
  receiverCity: string;
  receiverState: string;
  shipmentType: string;
  status: string;
};

const TYPE_LABELS: Record<string, string> = { air: "Air", ground: "Ground", ocean: "Ocean" };

// Column order copied from the reference hub's My Shipment table: sender and
// receiver each get their own City and State columns rather than being
// stacked into one cell, which is what makes the table scannable by lane.
const COLUMNS = [
  { key: "date", label: "Date", sortable: true, filter: true },
  { key: "trackingNumber", label: "Tracking", sortable: true, filter: true },
  { key: "senderName", label: "Sender", sortable: true, filter: true },
  { key: "senderCity", label: "City", sortable: true, filter: true },
  { key: "senderState", label: "State", sortable: true, filter: true },
  { key: "receiverName", label: "Receiver", sortable: true, filter: true },
  { key: "receiverCity", label: "City", sortable: true, filter: true },
  { key: "receiverState", label: "State", sortable: true, filter: true },
  { key: "shipmentType", label: "Type", sortable: true, filter: true },
  { key: "status", label: "Status", sortable: true, filter: true },
] as const;

type SortKey = (typeof COLUMNS)[number]["key"];

const PAGE_SIZES = [10, 25, 50] as const;

/**
 * Filtering, sorting and paging all happen client-side on purpose: the server
 * component hands over at most 50 rows (a customer's own shipments), so a
 * round trip per keystroke would be slower and buy nothing. The admin lists
 * page server-side because those tables are unbounded.
 */
export function ShipmentsTable({ rows }: { rows: PortalShipmentRow[] }) {
  const [filters, setFilters] = useState<Partial<Record<SortKey, string>>>({});
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "date",
    dir: "desc",
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const cell = (r: PortalShipmentRow, k: SortKey): string => {
    if (k === "shipmentType") return TYPE_LABELS[r.shipmentType] ?? r.shipmentType;
    return String(r[k] ?? "");
  };

  const filtered = useMemo(() => {
    const active = Object.entries(filters).filter(([, v]) => v && v.trim());
    const out = rows.filter((r) =>
      active.every(([k, v]) =>
        cell(r, k as SortKey).toLowerCase().includes(v!.trim().toLowerCase()),
      ),
    );
    out.sort((a, b) => {
      const x = cell(a, sort.key);
      const y = cell(b, sort.key);
      const c = x.localeCompare(y, undefined, { numeric: true });
      return sort.dir === "asc" ? c : -c;
    });
    return out;
  }, [rows, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize);

  function toggleSort(k: SortKey) {
    setSort((s) => (s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" }));
  }
  function setFilter(k: SortKey, v: string) {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(0);
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-light bg-gray-50 px-6 py-14 text-center">
        <TruckIcon size={40} className="text-brand-light" />
        <p className="m-0 text-sm text-ink-muted">No shipments yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-brand-light">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead>
            <tr className="bg-brand-pale">
              {COLUMNS.map((c) => {
                const active = sort.key === c.key;
                return (
                  <th key={c.key} className="px-3 py-3 align-bottom">
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className="flex items-center gap-1 text-xs font-semibold tracking-wide text-ink-muted uppercase hover:text-brand"
                    >
                      {c.label}
                      {active ? (
                        sort.dir === "asc" ? (
                          <CaretUpIcon size={11} weight="bold" />
                        ) : (
                          <CaretDownIcon size={11} weight="bold" />
                        )
                      ) : (
                        <CaretDownIcon size={11} className="opacity-25" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
            {/* Per-column filter row, same pattern the admin lists use. */}
            <tr className="bg-brand-pale/60">
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-3 pb-3">
                  <input
                    aria-label={`Filter by ${c.label}`}
                    value={filters[c.key] ?? ""}
                    onChange={(e) => setFilter(c.key, e.target.value)}
                    className="w-full min-w-[72px] rounded-md border border-brand-light bg-white px-2 py-1 text-xs text-ink outline-none placeholder:text-ink-muted/60 focus:border-brand"
                    placeholder="Filter"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {visible.map((r) => (
              <tr key={r.id} className="border-t border-brand-light">
                <td className="px-3 py-3 whitespace-nowrap text-ink-muted">{r.date}</td>
                <td className="px-3 py-3 font-medium whitespace-nowrap text-ink">
                  {r.trackingNumber ?? "—"}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-ink">{r.senderName}</td>
                <td className="px-3 py-3 whitespace-nowrap text-ink-muted">{r.senderCity}</td>
                <td className="px-3 py-3 whitespace-nowrap text-ink-muted">{r.senderState}</td>
                <td className="px-3 py-3 whitespace-nowrap text-ink">{r.receiverName}</td>
                <td className="px-3 py-3 whitespace-nowrap text-ink-muted">{r.receiverCity}</td>
                <td className="px-3 py-3 whitespace-nowrap text-ink-muted">{r.receiverState}</td>
                <td className="px-3 py-3 whitespace-nowrap text-ink-muted">
                  {TYPE_LABELS[r.shipmentType] ?? r.shipmentType}
                </td>
                <td className="px-3 py-3">
                  <ShipmentStatusPill status={r.status} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr className="border-t border-brand-light">
                <td colSpan={COLUMNS.length} className="px-3 py-10 text-center text-sm text-ink-muted">
                  No shipments match those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={current === 0}
          className="rounded-lg border border-brand-light px-4 py-2 font-medium text-ink disabled:opacity-40"
        >
          Previous
        </button>
        <div className="flex flex-wrap items-center gap-4 text-ink-muted">
          <span>
            Total rows: {filtered.length}
            {filtered.length !== rows.length && ` of ${rows.length}`}
          </span>
          <label className="flex items-center gap-2">
            <span className="sr-only">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="rounded-lg border border-brand-light bg-white px-2 py-1.5 text-ink outline-none focus:border-brand"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} rows
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={current >= pageCount - 1}
          className="rounded-lg border border-brand-light px-4 py-2 font-medium text-ink disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
