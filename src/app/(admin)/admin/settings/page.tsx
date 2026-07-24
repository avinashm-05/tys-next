import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import {
  getFedexMarkupInternationalPercentage,
  getFedexMarkupPercentage,
} from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "FedEx Markup — TYS Global Logistics" };

export default async function SettingsPage() {
  await requireAdminPage();
  const [domestic, international] = await Promise.all([
    getFedexMarkupPercentage(),
    getFedexMarkupInternationalPercentage(),
  ]);
  return <SettingsForm initialDomestic={domestic} initialInternational={international} />;
}
