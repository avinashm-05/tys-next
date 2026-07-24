"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";
import { handleFormError } from "@/lib/form";
import { vendorTypeInput, type VendorTypeInput } from "@/lib/validation/vendor-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const FIELDS = ["name", "description", "status"] as const;

/** Shared by /admin/vendor-types/new and /[id]/edit. */
export function VendorTypeForm({
  vendorType,
}: {
  vendorType?: { id: number; name: string; description: string | null; status: string };
}) {
  const router = useRouter();
  const editing = vendorType !== undefined;
  const form = useForm<VendorTypeInput>({
    resolver: zodResolver(vendorTypeInput),
    defaultValues: {
      name: vendorType?.name ?? "",
      description: vendorType?.description ?? "",
      status: (vendorType?.status as VendorTypeInput["status"]) ?? "active",
    },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: VendorTypeInput) {
    try {
      if (editing) {
        await adminApi(`/api/admin/vendor-types/${vendorType.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        });
        toast.success("Vendor type updated.");
      } else {
        await adminApi("/api/admin/vendor-types", {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success("Vendor type added.");
      }
      router.push("/admin/vendor-types");
    } catch (e) {
      handleFormError(e, form.setError, FIELDS);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-h2">{editing ? "Edit vendor type" : "Add vendor type"}</h1>
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
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  rows={4}
                  aria-invalid={!!errors.description}
                  {...form.register("description")}
                />
                <FieldError errors={[errors.description]} />
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
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                  {isSubmitting
                    ? "Saving…"
                    : editing
                      ? "Save changes"
                      : "Add vendor type"}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/vendor-types">Cancel</Link>
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
