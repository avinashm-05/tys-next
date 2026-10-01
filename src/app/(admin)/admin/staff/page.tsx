import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { StaffTable, type StaffRow } from "./staff-table";

export const metadata: Metadata = { title: "Staff | TYS Global Logistics" };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "America/New_York" });

// Staff management (2026-09-30): owner (super-admin) only — admins get the
// same 404 any non-admin gets, so the page's existence isn't revealed.
export default async function StaffPage() {
  const session = await requireAdminPage();
  if ((session.user as { role?: string | null }).role !== "super-admin") notFound();

  const staff = await db.user.findMany({
    where: { role: { in: ["super-admin", "admin"] } },
    orderBy: [{ role: "asc" }, { id: "asc" }],
    select: { id: true, name: true, email: true, role: true, twoFactorEnabled: true, createdAt: true },
  });

  const rows: StaffRow[] = staff.map((u) => ({
    id: Number(u.id),
    name: u.name,
    email: u.email,
    role: (u.role ?? "admin") as StaffRow["role"],
    twoStep: u.twoFactorEnabled,
    added: u.createdAt ? dateFmt.format(u.createdAt) : "N/A",
    isYou: String(u.id) === String(session.user.id),
  }));

  return <StaffTable rows={rows} />;
}
