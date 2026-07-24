import { requireAdminPage } from "@/lib/auth";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminHeader } from "@/components/admin/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// THE server-side auth boundary for admin pages (CVE-2025-29927 — the proxy
// only redirects, it is never trusted).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  const { name, email } = session.user;
  const role = (session.user as { role?: string | null }).role ?? null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AdminHeader user={{ name, email, role }} />
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
