"use client";

import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

// The collapse/expand trigger lives in the sidebar's own header now (next to
// the logo), so this bar's only desktop job is the breadcrumb. On mobile the
// sidebar is an off-canvas sheet that starts closed, so a trigger still has
// to exist out here somewhere reachable — shown only below the md breakpoint.
export function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="md:hidden" />
      <AdminBreadcrumb />
    </header>
  );
}
