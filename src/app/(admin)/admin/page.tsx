import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard — TYS Global Logistics" };

// Placeholder stats — wired to real counts in a later phase (the old
// dashboard was a stub, so there is nothing to port yet).
const STATS = ["Quotes", "Vendors", "Services"] as const;

export default async function AdminDashboardPage() {
  const session = await getSession();
  const firstName = session?.user.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h2">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{firstName ? `, ${firstName}` : ""}.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map((label) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-h2 text-muted-foreground">—</CardTitle>
              <CardDescription>Live counts arrive in a later phase.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
