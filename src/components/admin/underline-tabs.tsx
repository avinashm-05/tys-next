"use client";

import type { ComponentProps } from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Quiet underline tabs for the new admin look (2026-10-05, first used on the
// customer profile). The older pill tabs (detail-tabs.tsx) stay on the other
// pages until the new look is approved and rolled out.
export const UnderlineTabs = TabsPrimitive.Root;
export const UnderlineTabsContent = TabsPrimitive.Content;

export function UnderlineTabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("flex gap-1 border-b px-3", className)} {...props} />;
}

export function UnderlineTabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "-mb-px border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-tys-blue data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
