"use client";

import type { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// SETU reference: a full-width pill row with a solid rose active tab and a
// small diamond "caret" pointing down into the panel — different enough from
// the shared shadcn Tabs' underline look that it gets its own component.
// Shared across every tabbed detail page (Vendor, Shipment, …) so the pill
// styling stays identical everywhere it's used.
export const DetailTabs = TabsPrimitive.Root;
export const DetailTabsContent = TabsPrimitive.Content;

export function DetailTabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("grid grid-cols-2 bg-muted sm:grid-cols-4", className)}
      {...props}
    />
  );
}

export function DetailTabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative flex h-12 items-center justify-center px-2 text-xs font-bold tracking-wide text-foreground/60 uppercase transition-colors hover:text-foreground data-[state=active]:bg-tys-rose data-[state=active]:text-white",
        "after:absolute after:-bottom-1.5 after:left-1/2 after:size-3 after:-translate-x-1/2 after:rotate-45 after:bg-tys-rose after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}
