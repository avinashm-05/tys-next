import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AccountShell } from "@/components/public/account/shell";
import { ResendVerificationForm } from "@/components/public/account/auth-forms";

export const metadata: Metadata = { title: "Verify your email — TYS Global Logistics" };

// Landing/status page. The actual verification happens on the emailed link
// (GET /api/auth/verify-email?token=…), which then redirects to
// /account/login?verified=1 — this page explains the state and offers a resend.
export default async function VerifyEmailPage() {
  const session = await getSession();
  if (session?.user.emailVerified) redirect("/account");
  return (
    <AccountShell
      title="Verify your email"
      subtitle="We sent a verification link when you registered. The portal unlocks once it's clicked."
    >
      <ResendVerificationForm />
    </AccountShell>
  );
}
