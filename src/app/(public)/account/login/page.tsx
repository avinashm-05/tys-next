import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { visibleSocialProviders, getSession, isCustomerSession } from "@/lib/auth";
import { AccountShell } from "@/components/public/account/shell";
import { LoginForm } from "@/components/public/account/auth-forms";

export const metadata: Metadata = { title: "Log in | TYS Global Logistics" };

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; social_error?: string }>;
}) {
  const session = await getSession();
  if (isCustomerSession(session)) redirect("/account");
  const { verified, social_error } = await searchParams;
  return (
    <AccountShell
      title="Welcome"
      accent="back."
      subtitle="Log in to book shipments, see everything you've sent and keep your details up to date."
    >
      <LoginForm
        verified={verified === "1"}
        socialError={social_error === "1"}
        socialProviders={visibleSocialProviders()}
      />
    </AccountShell>
  );
}
