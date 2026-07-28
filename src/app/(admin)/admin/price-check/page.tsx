import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { PriceCheckTool } from "@/components/admin/price-check-tool";

export const metadata: Metadata = { title: "Get Rates — TYS Global Logistics" };

// A4.4 — standalone chargeable-weight + rate calculator. Pure lookup: nothing
// is persisted (no quote, no price lock, no send).
export default async function PriceCheckPage() {
  await requireAdminPage();
  return <PriceCheckTool />;
}
