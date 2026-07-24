import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AccountShell } from "@/components/public/account/shell";
import { LoginForm } from "@/components/public/account/auth-forms";

export const metadata: Metadata = { title: "Log in — TYS Global Logistics" };

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const session = await getSession();
  if (session?.user) redirect("/account");
  const { verified } = await searchParams;
  return (
    <AccountShell title="Log in" subtitle="Access your quotes and profile.">
      <LoginForm verified={verified === "1"} />
    </AccountShell>
  );
}
