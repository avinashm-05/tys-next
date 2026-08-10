import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
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
    select: {
      name: true,
      email: true,
      phone: true,
      displayUsername: true,
      username: true,
      companyName: true,
      addressLine1: true,
      addressLine2: true,
      addressLine3: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
    },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Profile</h1>
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-brand-light bg-white p-6">
          <h2 className="mb-4 text-base font-bold text-ink">Account details</h2>
          <ProfileForm
            initialName={user?.name ?? session.user.name}
            initialPhone={user?.phone ?? ""}
            initialAddress={{
              companyName: user?.companyName ?? "",
              addressLine1: user?.addressLine1 ?? "",
              addressLine2: user?.addressLine2 ?? "",
              addressLine3: user?.addressLine3 ?? "",
              city: user?.city ?? "",
              state: user?.state ?? "",
              country: user?.country ?? "",
              postalCode: user?.postalCode ?? "",
            }}
            email={user?.email ?? session.user.email}
            // displayUsername keeps the original casing; username is the
            // normalized one actually used to sign in. Only ever empty for a
            // row that predates the column and missed the backfill.
            username={user?.displayUsername ?? user?.username ?? ""}
          />
        </div>
        <div className="rounded-2xl border border-brand-light bg-white p-6">
          <h2 className="mb-4 text-base font-bold text-ink">Change password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
