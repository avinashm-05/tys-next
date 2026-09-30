import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm, SecurityPanel } from "@/components/public/account/profile-forms";

export const metadata: Metadata = { title: "Profile | TYS Global Logistics" };

// C1.3, redesigned 2026-09-30: details + saved address (one form) beside a
// Sign-in & security panel (change/set password, sign out other devices,
// linked Google/Microsoft). Email is read-only in v1: changing it
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
      createdAt: true,
    },
  });
  const accounts = await db.account.findMany({
    where: { userId: BigInt(session.user.id) },
    select: { providerId: true },
  });
  const providers = accounts.map((a) => a.providerId);

  return (
    <div className="mx-auto grid max-w-[1100px] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
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
        // normalized one actually used to sign in.
        username={user?.displayUsername ?? user?.username ?? ""}
      />
      <SecurityPanel
        hasPassword={providers.includes("credential")}
        providers={providers.filter((p) => p !== "credential")}
        memberSince={user?.createdAt ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(user.createdAt) : null}
      />
    </div>
  );
}
