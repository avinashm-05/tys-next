import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasTwoFactor, requireAdminPageAllowingSetup } from "@/lib/auth";
import { TwoStepSetup } from "./two-step-setup";

export const metadata: Metadata = { title: "Set up 2-step sign-in — TYS Global Logistics" };

// Every admin account must switch on 2-step sign-in (2026-09-30).
// requireAdminPage sends staff here until they have; the page itself uses
// the setup-allowing guard so it doesn't redirect to itself.
export default async function TwoStepPage() {
  const session = await requireAdminPageAllowingSetup();
  if (hasTwoFactor(session)) redirect("/admin");
  return <TwoStepSetup email={session.user.email} />;
}
