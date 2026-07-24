import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountNav } from "@/components/public/account/account-nav";
import { ProfileForm, ChangePasswordForm } from "@/components/public/account/profile-forms";

export const metadata: Metadata = { title: "Profile — TYS Global Logistics" };

// C1.3 — edit name/phone (dedicated session-scoped endpoint) + change password
// (Better Auth, current-password check). Email is read-only in v1: changing it
// changes which quotes the account sees and needs re-verification — flagged
// for a later phase.
export default async function ProfilePage() {
  const session = await requireCustomerPage();
  // Fresh read for phone (kept out of the session's user shape on purpose).
  const user = await db.user.findUnique({
    where: { id: BigInt(session.user.id) },
    select: { name: true, email: true, phone: true },
  });

  return (
    <main className="container" style={{ paddingTop: 160, paddingBottom: 80, maxWidth: 960 }}>
      <AccountNav current="/account/profile" />
      <h1 className="quote-wizard-section-title" style={{ marginBottom: 20 }}>
        Profile
      </h1>
      <div className="d-flex flex-wrap gap-4 align-items-start">
        <div className="quote-wizard-location-card" style={{ flex: "1 1 380px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 16 }}>
            Account details
          </h2>
          <ProfileForm
            initialName={user?.name ?? session.user.name}
            initialPhone={user?.phone ?? ""}
            email={user?.email ?? session.user.email}
          />
        </div>
        <div className="quote-wizard-location-card" style={{ flex: "1 1 380px" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 16 }}>
            Change password
          </h2>
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
