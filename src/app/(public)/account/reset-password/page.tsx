import type { Metadata } from "next";
import { AccountShell } from "@/components/public/account/shell";
import { ResetPasswordForm } from "@/components/public/account/auth-forms";

export const metadata: Metadata = { title: "Reset password — TYS Global Logistics" };

// Customer reset page (apex) — reached from the emailed link built in
// auth.ts sendResetPassword for role "user". Admins get the admin-host page.
export default async function AccountResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AccountShell title="Set a new password">
      <ResetPasswordForm token={token ?? ""} />
    </AccountShell>
  );
}
