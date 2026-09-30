import type { Metadata } from "next";
import { AccountShell } from "@/components/public/account/shell";
import { ForgotPasswordForm } from "@/components/public/account/auth-forms";

export const metadata: Metadata = { title: "Forgot password | TYS Global Logistics" };

export default function AccountForgotPasswordPage() {
  return (
    <AccountShell
      perks={false}
      title="Forgot your password?"
      subtitle="We'll email you a link to set a new one."
    >
      <ForgotPasswordForm />
    </AccountShell>
  );
}
