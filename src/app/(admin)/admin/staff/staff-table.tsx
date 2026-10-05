"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeviceMobileSlashIcon, PlusIcon, UserMinusIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type StaffRow = {
  id: number;
  name: string;
  email: string;
  role: "super-admin" | "admin";
  twoStep: boolean;
  added: string;
  isYou: boolean;
};

const ROLE_LABEL: Record<StaffRow["role"], string> = {
  "super-admin": "Owner",
  admin: "Admin",
};

// Staff management screen (owner only). Everything routes through
// /api/admin/staff, which re-checks the owner role server-side; every write
// lands in the Activity log via adminRoute.
export function StaffTable({ rows }: { rows: StaffRow[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "remove" | "reset2fa"; row: StaffRow } | null>(null);

  async function changeRole(row: StaffRow, role: string) {
    try {
      await adminApi(`/api/admin/staff/${row.id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      toast.success(`${row.name} is now ${ROLE_LABEL[role as StaffRow["role"]]}.`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't change the role.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h2">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Who can open the admin panel. New members get an email to set their password, then 2-step sign-in on
            their first visit.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <PlusIcon size={16} weight="bold" /> Add staff member
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>2-step</TableHead>
              <TableHead>Added (ET)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {row.name}
                  {row.isYou && <Badge variant="outline" className="ml-2">You</Badge>}
                </TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  {row.isYou ? (
                    <Badge variant="secondary">{ROLE_LABEL[row.role]}</Badge>
                  ) : (
                    <Select value={row.role} onValueChange={(v) => changeRole(row, v)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super-admin">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {row.twoStep ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">On</Badge>
                  ) : (
                    <Badge variant="outline">Not set up</Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{row.added}</TableCell>
                <TableCell className="text-right">
                  {!row.isYou && (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Lost phone: clear their 2-step so they set it up again"
                        onClick={() => setConfirm({ kind: "reset2fa", row })}
                      >
                        <DeviceMobileSlashIcon size={16} /> Reset 2-step
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setConfirm({ kind: "remove", row })}
                      >
                        <UserMinusIcon size={16} /> Remove access
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddStaffDialog open={addOpen} onOpenChange={setAddOpen} />

      {confirm && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setConfirm(null)}
          title={confirm.kind === "remove" ? "Remove admin access" : "Reset 2-step sign-in"}
          description={
            confirm.kind === "remove"
              ? `${confirm.row.name} (${confirm.row.email}) will be signed out everywhere and lose the admin panel. Their account isn't deleted; you can re-add them later.`
              : `${confirm.row.name} will be signed out everywhere and asked to set up 2-step again with their new phone on their next sign-in.`
          }
          confirmLabel={confirm.kind === "remove" ? "Remove access" : "Reset 2-step"}
          confirmVariant={confirm.kind === "remove" ? "destructive" : "default"}
          busyLabel="Working…"
          errorFallback="That didn't work. Try again."
          onConfirm={async () => {
            if (confirm.kind === "remove") {
              await adminApi(`/api/admin/staff/${confirm.row.id}`, { method: "DELETE" });
              toast.success(`${confirm.row.name} no longer has admin access.`);
            } else {
              await adminApi(`/api/admin/staff/${confirm.row.id}/reset-two-step`, { method: "POST" });
              toast.success(`2-step reset for ${confirm.row.name}.`);
            }
            setConfirm(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function AddStaffDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await adminApi<{ emailSent: boolean }>("/api/admin/staff", {
        method: "POST",
        body: JSON.stringify({ name, email, role }),
      });
      toast.success(
        res.emailSent
          ? `${name} added. They've been emailed a link to set their password.`
          : `${name} added, but the email failed to send — use "Forgot password" on the sign-in page instead.`,
      );
      setName("");
      setEmail("");
      setRole("admin");
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't add them. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a staff member</DialogTitle>
          <DialogDescription>
            They&apos;ll get an email with a link to set their password, then set up 2-step sign-in on their first
            visit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="staff-name">Name</FieldLabel>
              <Input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field>
              <FieldLabel htmlFor="staff-email">Email</FieldLabel>
              <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (sales team)</SelectItem>
                  <SelectItem value="super-admin">Owner (full control, can manage staff)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" className="bg-tys-blue text-white hover:bg-tys-blue/90" disabled={busy || !name.trim() || !email.trim()}>
                {busy ? "Adding…" : "Add and send invite"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
