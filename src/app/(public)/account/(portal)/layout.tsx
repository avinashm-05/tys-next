import { requireCustomerPage } from "@/lib/auth";
import { PortalFrame } from "@/components/public/account/portal-chrome";

// Shell for the signed-in portal (2026-09-30 redesign): one connected app
// screen in the Attio manner, sidebar + top bar + page (see
// portal-chrome.tsx). The marketing header/footer are hidden on these
// routes. The session check runs once here instead of once per page.
export default async function AccountPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerPage();
  return (
    <PortalFrame name={session.user.name} email={session.user.email}>
      {children}
    </PortalFrame>
  );
}
