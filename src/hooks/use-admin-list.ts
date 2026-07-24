"use client";

import { useEffect, useRef, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { adminApi, type ListResponse } from "@/lib/admin-api";

const PAGE_SIZE = 10;

/**
 * Server-paginated list state for the admin CRUD lists: fetches
 * `{endpoint}?page&pageSize&search&sort&dir`, debounces search (which resets
 * to page 1), and exposes refresh() for after a delete.
 */
export function useAdminList<T, TExtra = Record<string, never>>(
  endpoint: string,
  defaultSorting: SortingState = [],
  // Extra query params (e.g. category/priority filters). Callers changing a
  // filter should also setPage(1). Serialized into the URL, so a plain object
  // literal per render is fine.
  extraParams: Record<string, string> = {},
) {
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  // Extra top-level keys some endpoints add (e.g. the service picker's summary).
  const [extra, setExtra] = useState<TExtra | null>(null);
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tick, setTick] = useState(0);
  // `loading` is DERIVED: the last settled request key vs. the current one —
  // no synchronous setState in the fetch effect.
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return; // don't debounce-reset on mount
    }
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  for (const [k, v] of Object.entries(extraParams)) {
    if (v) params.set(k, v);
  }
  if (debouncedSearch) params.set("search", debouncedSearch);
  if (sorting[0]) {
    params.set("sort", sorting[0].id);
    params.set("dir", sorting[0].desc ? "desc" : "asc");
  }
  const url = `${endpoint}?${params}`;
  const requestKey = `${url}#${tick}`;

  useEffect(() => {
    let cancelled = false;
    adminApi<ListResponse<T> & TExtra>(url)
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setTotal(res.total);
        setExtra(res);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          toast.error(
            e instanceof Error ? e.message : "Couldn't load the list. Refresh the page.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setSettledKey(requestKey);
      });
    return () => {
      cancelled = true;
    };
  }, [url, requestKey]);

  return {
    rows,
    total,
    extra,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    search,
    setSearch,
    sorting,
    setSorting,
    loading: settledKey !== requestKey,
    refresh: () => setTick((t) => t + 1),
  };
}
