"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListChecksIcon, PlusIcon } from "@phosphor-icons/react";
import { adminApi, ApiError } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SectionIconBadge } from "@/components/admin/section-icon-badge";

type ServicePickerRow = {
  id: number;
  name: string;
  status: "active" | "deactive";
  is_assigned: boolean;
};

type Summary = { total: number; assigned: number; unassigned: number };

// Matches the SETU reference: a flat checkbox grid, not a filterable table —
// the service list itself is shared/global across all vendors (Service
// model), so there's nothing vendor-specific to filter here.
export function ServicesSection({ vendorId }: { vendorId: number }) {
  const [rows, setRows] = useState<ServicePickerRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [newServiceName, setNewServiceName] = useState("");
  const [addingService, setAddingService] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminApi<{ rows: ServicePickerRow[]; summary: Summary }>(
      `/api/admin/vendors/${vendorId}/services?pageSize=200&sort=name&dir=asc`,
    )
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setSummary(res.summary);
      })
      .catch(() => {
        if (!cancelled) toast.error("Couldn't load services. Refresh the page.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  async function toggle(row: ServicePickerRow, checked: boolean) {
    setPending((prev) => new Set(prev).add(row.id));
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_assigned: checked } : r)));
    try {
      await adminApi(`/api/admin/vendors/${vendorId}/services/${checked ? "assign" : "unassign"}`, {
        method: checked ? "POST" : "DELETE",
        body: JSON.stringify({ serviceId: row.id }),
      });
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              assigned: prev.assigned + (checked ? 1 : -1),
              unassigned: prev.unassigned + (checked ? -1 : 1),
            }
          : prev,
      );
    } catch (e) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_assigned: !checked } : r)));
      toast.error(e instanceof ApiError ? e.message : "The change failed. Try again.");
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
    }
  }

  async function addNewService() {
    const name = newServiceName.trim();
    if (!name || addingService) return;
    setAddingService(true);
    try {
      const created = await adminApi<{ id: number; name: string; status: "active" | "deactive" }>(
        "/api/admin/services",
        { method: "POST", body: JSON.stringify({ name, status: "active" }) },
      );
      await adminApi(`/api/admin/vendors/${vendorId}/services/assign`, {
        method: "POST",
        body: JSON.stringify({ serviceId: created.id }),
      });
      setRows((prev) =>
        [...prev, { ...created, is_assigned: true }].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setSummary((prev) =>
        prev
          ? { total: prev.total + 1, assigned: prev.assigned + 1, unassigned: prev.unassigned }
          : prev,
      );
      setNewServiceName("");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't add the service. Try again.");
    } finally {
      setAddingService(false);
    }
  }

  return (
    <Card className="overflow-visible">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <SectionIconBadge icon={ListChecksIcon} />
          <div>
            <h2 className="font-heading text-lg font-semibold">Service offered</h2>
            {summary && (
              <p className="text-xs text-muted-foreground">
                {summary.assigned} of {summary.total} service{summary.total === 1 ? "" : "s"}{" "}
                assigned
              </p>
            )}
          </div>
        </div>
        {!loading && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No services yet — add the first one below.
          </p>
        ) : (
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {rows.map((row) => (
              <label key={row.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={row.is_assigned}
                  disabled={pending.has(row.id) || (!row.is_assigned && row.status !== "active")}
                  onCheckedChange={(on) => toggle(row, on === true)}
                  className="data-[state=checked]:border-tys-rose data-[state=checked]:bg-tys-rose"
                />
                <span className={row.status !== "active" ? "text-muted-foreground" : undefined}>
                  {row.name}
                </span>
              </label>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 border-t border-tys-mist pt-4">
          <Input
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNewService();
              }
            }}
            placeholder="Add a new service…"
            className="max-w-xs"
            aria-label="New service name"
          />
          <Button
            type="button"
            variant="outline"
            disabled={!newServiceName.trim() || addingService}
            onClick={addNewService}
          >
            <PlusIcon size={16} />
            {addingService ? "Adding…" : "Add service"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
