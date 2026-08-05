import { requireCustomerPage } from "@/lib/auth";
import { AccountSidebar } from "@/components/public/account/account-sidebar";

// Shell for the logged-in portal pages (dashboard, quotes, shipments,
// tracking, profile) — left sidebar nav replacing the old per-page top tab
// bar (AccountNav), matching the SFL reference's arrangement. Scoped to this
// (portal) route group only — the auth pages (login/register/forgot-*/
// reset-*/verify-email) are siblings of this group under account/, so they
// don't get wrapped in a sidebar meant for an already-authenticated visitor.
// The session check runs once here instead of once per page.
export default async function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerPage();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:px-8 md:py-14">
      <AccountSidebar name={session.user.name} email={session.user.email} />
      <div className="min-w-0 flex-1">{children}</div>
    </main>
  );
}
