"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";
import { handleFormError } from "@/lib/form";
import { serviceInput, type ServiceInput } from "@/lib/validation/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FIELDS = ["name", "system_name", "status"] as const;

/** Shared by /admin/services/new and /[id]/edit. */
export function ServiceForm({
  service,
}: {
  service?: { id: number; name: string; systemName: string; status: string };
}) {
  const router = useRouter();
  const editing = service !== undefined;
  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceInput),
    defaultValues: {
      name: service?.name ?? "",
      system_name: service?.systemName ?? "",
      status: (service?.status as ServiceInput["status"]) ?? "active",
    },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: ServiceInput) {
    try {
      if (editing) {
        await adminApi(`/api/admin/services/${service.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        });
        toast.success("Service updated.");
      } else {
        await adminApi("/api/admin/services", {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success("Service added.");
      }
      router.push("/admin/services");
    } catch (e) {
      handleFormError(e, form.setError, FIELDS);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-h2">{editing ? "Edit service" : "Add service"}</h1>
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  autoFocus={!editing}
                  aria-invalid={!!errors.name}
                  {...form.register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field data-invalid={!!errors.system_name}>
                <FieldLabel htmlFor="system_name">System name</FieldLabel>
                <Input
                  id="system_name"
                  className="font-mono"
                  aria-invalid={!!errors.system_name}
                  {...form.register("system_name")}
                />
                {!editing && (
                  <FieldDescription>
                    Leave blank to generate it from the name.
                  </FieldDescription>
                )}
                <FieldError errors={[errors.system_name]} />
              </Field>
              <Field data-invalid={!!errors.status}>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status" aria-invalid={!!errors.status}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        {/* "deactive" is the real stored value (sic) — label matches it. */}
                        <SelectItem value="deactive">Deactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.status]} />
              </Field>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-tys-orange text-white hover:bg-tys-orange/90"
                >
                  {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add service"}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/services">Cancel</Link>
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
