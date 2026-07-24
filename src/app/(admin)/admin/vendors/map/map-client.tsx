"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time — the map must never be
// server-rendered (ssr: false requires this wrapper to be a client component).
const VendorMap = dynamic(() => import("./vendor-map").then((m) => m.VendorMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[32rem] items-center justify-center rounded-md border text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export function MapClient() {
  return <VendorMap />;
}
