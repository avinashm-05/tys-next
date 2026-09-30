import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { visibleSocialProviders, getSession, isCustomerSession } from "@/lib/auth";
import { AccountShell } from "@/components/public/account/shell";
import { RegisterForm } from "@/components/public/account/auth-forms";

export const metadata: Metadata = { title: "Create account | TYS Global Logistics" };

export default async function RegisterPage() {
  const session = await getSession();
  if (isCustomerSession(session)) redirect("/account");
  return (
    <AccountShell
      title="Create your"
      accent="account."
      subtitle="It takes a minute. Then book pickups online and keep every shipment in one place."
    >
      <RegisterForm socialProviders={visibleSocialProviders()} />
    </AccountShell>
  );
}
