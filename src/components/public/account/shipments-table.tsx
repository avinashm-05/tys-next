"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AirplaneTiltIcon,
  ArrowRightIcon,
  BoatIcon,
  CaretDownIcon,
  CaretUpIcon,
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
  TruckIcon,
} from "@phosphor-icons/react";
import { ShipmentStatusPill } from "@/components/public/account/account-nav";

export type PortalShipmentRow = {
  id: number;
  date: string;
  sortDate: number;
  trackingNumber: string | null;
  senderName: string;
  senderCity: string;
  senderState: string;
  receiverName: string;
  receiverCity: string;
  receiverState: string;
  receiverCountry: string;
  shipmentType: string;
  status: string;
};

const TYPE: Record<string, { label: string; icon: typeof TruckIcon }> = {
  air: { label: "Air", icon: AirplaneTiltIcon },
  ground: { label: "Ground", icon: TruckIcon },
  ocean: { label: "Ocean", icon: BoatIcon },
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "new_request", label: "Booked" },
  { value: "ready_for_pickup", label: "Ready for pickup" },
  { value: "in_transit", label: "In transit" },
  { value: "delivered", label: "Delivered" },
  { value: "on_hold", label: "On hold" },
] as const;

type SortKey = "sortDate" | "trackingNumber" | "senderName" | "receiverName" | "status";
const PAGE_SIZE = 10;

// My Shipments (2026-09-30 redesign). SFL's column set (date, tracking,
// sender + city/state, receiver + city/state, type, status) folded into
// five columns that fit the screen with no sideways scrolling: each party's
// city and state sit under the name. One search box and status chips
// replace the old filter-per-column row. Phones get stacked cards. All
// client-side on purpose: a customer has at most 50 rows here.
export function ShipmentsTable({ rows }: { rows: PortalShipmentRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "sortDate", dir: "desc" });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (!term) return true;
      return [r.trackingNumber, r.senderName, r.senderCity, r.senderState, r.receiverName, r.receiverCity, r.receiverState, r.receiverCountry]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
    out.sort((a, b) => {
      const x = a[sort.key] ?? "";
      const y = b[sort.key] ?? "";
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
      return sort.dir === "asc" ? c : -c;
    });
    return out;
  }, [rows, q, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF2FF] text-brand">
          <TruckIcon size={28} />
        </span>
        <p className="text-[16px] font-semibold text-ink">No shipments yet</p>
        <p className="max-w-[360px] text-[14.5px] text-[#5B6472]">When you book one, it shows up here with its tracking number and status.</p>
        <Link href="/account/schedule" className="mt-1 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-[14.5px] font-semibold text-white hover:bg-brand-dark">
          <PaperPlaneTiltIcon size={16} weight="fill" /> Schedule a shipment
        </Link>
      </div>
    );
  }

  const th = (key: SortKey, label: string, cls = "") => {
    const active = sort.key === key;
    return (
      <th className={`px-4 py-2.5 ${cls}`}>
        <button
          type="button"
          onClick={() => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))}
          className={`inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.06em] ${active ? "text-ink" : "text-[#6B778A] hover:text-ink"}`}
        >
          {label}
          {active ? sort.dir === "asc" ? <CaretUpIcon size={11} weight="bold" /> : <CaretDownIcon size={11} weight="bold" /> : null}
        </button>
      </th>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-[#EEF0F3] px-5 py-3.5 md:px-6">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-3 ring-[1.5px] ring-inset ring-[#DCE0E6] focus-within:ring-2 focus-within:ring-brand sm:max-w-[320px]">
          <MagnifyingGlassIcon size={16} className="shrink-0 text-[#6B778A]" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Search tracking, name or city"
            className="w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-[#8A94A6]"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatus(f.value);
                setPage(0);
              }}
              className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                status === f.value ? "bg-[#0B1220] text-white" : "bg-[#F2F4F7] text-[#3A4353] hover:bg-[#E6E9EE]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop/tablet table: five columns, fixed layout, never wider than the panel. */}
      <table className="hidden w-full table-fixed text-left md:table">
        <colgroup>
          <col className="w-[16%]" />
          <col className="w-[18%]" />
          <col className="w-[24%]" />
          <col className="w-[24%]" />
          <col className="w-[18%]" />
        </colgroup>
        <thead className="border-b border-[#EEF0F3] bg-[#FAFBFC]">
          <tr>
            {th("sortDate", "Booked")}
            {th("trackingNumber", "Tracking")}
            {th("senderName", "From")}
            {th("receiverName", "To")}
            {th("status", "Status")}
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => {
            const t = TYPE[r.shipmentType];
            return (
              <tr key={r.id} className="border-b border-[#F0F2F5] last:border-0 hover:bg-[#FAFBFC]">
                <td className="px-4 py-3 align-top">
                  <span className="block text-[14.5px] font-medium text-ink">{r.date}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[13px] text-[#5B6472]">
                    {t && <t.icon size={14} />} {t?.label ?? r.shipmentType}
                  </span>
                </td>
                <td className="truncate px-4 py-3 align-top text-[14.5px] font-semibold text-ink">
                  {r.trackingNumber ?? <span className="font-medium text-[#8A94A6]">Not assigned yet</span>}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="block truncate text-[14.5px] font-medium text-ink">{r.senderName}</span>
                  <span className="block truncate text-[13px] text-[#5B6472]">{[r.senderCity, r.senderState].filter(Boolean).join(", ")}</span>
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="block truncate text-[14.5px] font-medium text-ink">{r.receiverName}</span>
                  <span className="block truncate text-[13px] text-[#5B6472]">
                    {[r.receiverCity, r.receiverState, r.receiverCountry].filter(Boolean).join(", ")}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <ShipmentStatusPill status={r.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Phones: one card per shipment. */}
      <ul className="divide-y divide-[#F0F2F5] md:hidden">
        {visible.map((r) => (
          <li key={r.id} className="px-5 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[14.5px] font-semibold text-ink">{r.trackingNumber ?? "Tracking pending"}</span>
              <ShipmentStatusPill status={r.status} />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[14px] text-[#3A4353]">
              <span className="truncate">{r.senderCity || r.senderName}</span>
              <ArrowRightIcon size={13} className="shrink-0 text-[#8A94A6]" />
              <span className="truncate">{[r.receiverCity, r.receiverCountry].filter(Boolean).join(", ") || r.receiverName}</span>
            </p>
            <p className="mt-0.5 text-[13px] text-[#6B778A]">
              {r.date} · {TYPE[r.shipmentType]?.label ?? r.shipmentType}
            </p>
          </li>
        ))}
      </ul>

      {visible.length === 0 && <p className="px-6 py-10 text-center text-[14.5px] text-[#5B6472]">No shipments match that search.</p>}

      <div className="flex items-center justify-between gap-3 border-t border-[#EEF0F3] px-5 py-3 text-[13.5px] text-[#5B6472] md:px-6">
        <span>
          {filtered.length} shipment{filtered.length === 1 ? "" : "s"}
          {filtered.length !== rows.length && ` of ${rows.length}`}
        </span>
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage(current - 1)} disabled={current === 0} className="rounded-lg px-3 py-1.5 font-semibold text-ink ring-1 ring-inset ring-[#DCE0E6] hover:bg-[#F2F4F7] disabled:opacity-40">
              Previous
            </button>
            <span>
              {current + 1} / {pageCount}
            </span>
            <button type="button" onClick={() => setPage(current + 1)} disabled={current >= pageCount - 1} className="rounded-lg px-3 py-1.5 font-semibold text-ink ring-1 ring-inset ring-[#DCE0E6] hover:bg-[#F2F4F7] disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
