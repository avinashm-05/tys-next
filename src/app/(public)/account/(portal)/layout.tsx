import { requireCustomerPage } from "@/lib/auth";
import { PortalHeader } from "@/components/public/account/portal-header";

// Shell for the logged-in portal pages (2026-09-30 redesign): a dark navy
// header band (greeting, page title, the Schedule / Shipments / Profile
// tabs) like the quote page, and the page's white card overlapping its
// bottom edge. Scoped to this (portal) route group only; the auth pages
// (login/register/forgot/reset/verify) are siblings and don't get it.
// The session check runs once here instead of once per page.
export default async function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerPage();

  return (
    <main className="bg-[#F4F7FB]">
      <PortalHeader name={session.user.name} email={session.user.email} />
      <div className="relative mx-auto -mt-16 max-w-6xl px-4 pb-16 md:-mt-20 md:px-8 md:pb-24">{children}</div>
    </main>
  );
}
