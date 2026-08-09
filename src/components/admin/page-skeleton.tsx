import { Skeleton } from "@/components/ui/skeleton";

/**
 * The shared admin route-loading fallback. Every admin route folder has a
 * one-line loading.tsx re-exporting this.
 *
 * Why one per folder rather than a single one at admin/: a Suspense boundary
 * that has already resolved does not re-show its fallback when a *sibling*
 * segment swaps into it during a transition — that's React deliberately not
 * hiding content you can already see. So a lone admin/loading.tsx only ever
 * covers the first entry into /admin, never Quotes -> Customers. Verified
 * exactly that live before splitting it up: the fallback never appeared on a
 * tab switch, even across a ~6s dev-server compile.
 *
 * There was no loading.tsx anywhere in the app before this, so a sidebar
 * click left the *previous* page on screen for the whole round-trip with no
 * visible change — which reads as a dead click, and is the "click a tab, no
 * response, have to refresh" report (2026-08-09).
 *
 * Deliberately one generic shape (title row / toolbar / card) instead of a
 * skeleton per route: it stands in for the lists, the dashboard, the detail
 * editors and the settings forms alike, and a rough shape that shows up
 * instantly is worth more here than an exact one that needs its own file.
 */
export default function AdminPageSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading…</span>

      {/* Page title row: icon badge + heading, primary action on the right. */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-2xl" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      {/* Search + filter toolbar. */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Skeleton className="h-11 w-72 rounded-full" />
        <Skeleton className="h-11 w-40 rounded-full" />
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>

      {/* Content card — column header, then rows. */}
      <div className="mt-6 rounded-2xl border border-tys-mist bg-card p-4">
        <Skeleton className="h-6 w-full rounded-md" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
