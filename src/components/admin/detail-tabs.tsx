"use client";

import type { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Tabs on every detail page (Vendor, Shipment, …). Since the 2026-10-05
// restyle: quiet underline tabs in the public-site blue, replacing the solid
// rose pill + diamond caret of the earlier SETU-reference look.
export const DetailTabs = TabsPrimitive.Root;
export const DetailTabsContent = TabsPrimitive.Content;

export function DetailTabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex flex-wrap gap-1 border-b", className?.replace(/\bgrid-cols-\d+\b|\bsm:grid-cols-\d+\b/g, ""))}
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
        "-mb-px border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-tys-blue data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
