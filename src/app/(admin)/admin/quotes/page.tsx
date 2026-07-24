import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { QuotesList } from "./quotes-list";

export const metadata: Metadata = { title: "Quotes — TYS Global Logistics" };

export default async function QuotesPage() {
  await requireAdminPage();
  return <QuotesList />;
}
