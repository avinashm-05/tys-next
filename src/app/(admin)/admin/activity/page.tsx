import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Activity | TYS Global Logistics" };
export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "America/New_York",
});

const ACTIONS: Record<string, { label: string; tone: "default" | "secondary" | "destructive" | "outline" }> = {
  "sign_in.success": { label: "Signed in", tone: "secondary" },
  "sign_in.password_ok_code_pending": { label: "Password OK, waiting for code", tone: "outline" },
  "sign_in.failed": { label: "Wrong password", tone: "destructive" },
  "sign_in.blocked": { label: "Sign-in blocked (too many tries)", tone: "destructive" },
  "sign_in.locked": { label: "Account locked", tone: "destructive" },
  "two_factor.verify.success": { label: "Code accepted", tone: "secondary" },
  "two_factor.verify.failed": { label: "Wrong code", tone: "destructive" },
  "two_factor.verify_backup_code.success": { label: "Backup code used", tone: "outline" },
  "two_factor.verify_backup_code.failed": { label: "Wrong backup code", tone: "destructive" },
  "two_factor.enable_started": { label: "Started 2-step setup", tone: "outline" },
  "two_factor.disabled": { label: "Turned off 2-step", tone: "destructive" },
  "admin.api": { label: "Change", tone: "default" },
};

// What changed a record, in plain words, from the API path + method.
function describe(method: string | null, path: string | null): string {
  if (!path) return "";
  const p = path.replace(/^\/api\/admin\//, "");
  const verb = method === "DELETE" ? "Deleted" : method === "POST" ? "Created / sent" : "Updated";
  return `${verb}: ${p}`;
}

// Staff activity log (2026-09-30): sign-ins, 2-step events, and every
// change made through the admin panel. Newest first, last 500. Read-only.
export default async function ActivityPage() {
  await requireAdminPage();
  const rows = await db.adminAuditLog.findMany({
    orderBy: { id: "desc" },
    take: 500,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff sign-ins and every change made in the admin panel. Newest first.
        </p>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When (ET)</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>What</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Nothing logged yet.
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => {
              const a = ACTIONS[r.action] ?? { label: r.action, tone: "outline" as const };
              const failed = r.statusCode != null && r.statusCode >= 400;
              return (
                <TableRow key={String(r.id)}>
                  <TableCell className="whitespace-nowrap">{dateFmt.format(r.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap">{r.user?.name ?? r.user?.email ?? "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant={r.action === "admin.api" && failed ? "destructive" : a.tone}>
                      {r.action === "admin.api" && failed ? `Failed (${r.statusCode})` : a.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[420px] truncate text-sm text-muted-foreground" title={r.detail ?? r.path ?? ""}>
                    {r.action === "admin.api" ? describe(r.method, r.path) : r.detail ?? ""}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">{r.ip ?? ""}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
