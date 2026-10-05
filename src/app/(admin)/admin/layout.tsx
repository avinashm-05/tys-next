import { cookies } from "next/headers";
import { requireAdminPage } from "@/lib/auth";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminHeader } from "@/components/admin/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

// THE server-side auth boundary for admin pages (CVE-2025-29927 — the proxy
// only redirects, it is never trusted).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  const { name, email } = session.user;
  const role = (session.user as { role?: string | null }).role ?? null;

  // SidebarProvider writes its own open/closed state to this cookie on every
  // toggle, but never read it back here — so a manual expand never survived
  // a reload, and with no defaultOpen it always came back expanded. Default
  // to collapsed (icon rail) until the user opts into expanded themselves.
  // 2026-10-05: open (with labels, like the customer portal) unless the
  // user collapsed it themselves.
  const sidebarState = (await cookies()).get("sidebar_state")?.value;
  const sidebarOpen = sidebarState !== "false";

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar user={{ name, email, role }} />
        {/* min-w-0: lets wide tables scroll inside the page instead of
            pushing the whole page past the window edge now that the
            sidebar is open by default. */}
        <SidebarInset className="min-w-0">
          <AdminHeader />
          <div className="flex-1 p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
