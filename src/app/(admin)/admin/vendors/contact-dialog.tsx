"use client";

import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { adminApi } from "@/lib/admin-api";
import { handleFormError } from "@/lib/form";
import { emptyStringsToNull } from "@/lib/validation/common";
import {
  vendorContactInput,
  type VendorContactInput,
} from "@/lib/validation/vendor-contact";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactRow } from "./contacts-section";

type FormInput = z.input<typeof vendorContactInput>;

const FIELDS = [
  "name",
  "title",
  "email",
  "work_phone",
  "cell_phone",
  "city",
  "state",
  "status",
] as const;

/** Mounted fresh per open (parent conditional-renders it) so RHF state resets. */
export function ContactDialog({
  vendorId,
  contact,
  onClose,
  onSaved,
}: {
  vendorId: number;
  contact?: ContactRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = contact !== undefined;
  const baseResolver = zodResolver(vendorContactInput);
  const form = useForm<FormInput, unknown, VendorContactInput>({
    resolver: (values, ctx, opts) =>
      baseResolver(emptyStringsToNull(values) as FormInput, ctx, opts),
    defaultValues: {
      name: contact?.name ?? "",
      title: contact?.title ?? "",
      email: contact?.email ?? "",
      work_phone: contact?.workPhone ?? "",
      cell_phone: contact?.cellPhone ?? "",
      city: contact?.city ?? "",
      state: contact?.state ?? "",
      status: (contact?.status as VendorContactInput["status"]) ?? "active",
    },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: VendorContactInput) {
    try {
      if (editing) {
        await adminApi(`/api/admin/vendors/${vendorId}/contacts/${contact.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        });
        toast.success("Contact updated.");
      } else {
        await adminApi(`/api/admin/vendors/${vendorId}/contacts`, {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success("Contact added.");
      }
      onSaved();
    } catch (e) {
      handleFormError(e, form.setError, FIELDS);
    }
  }

  const text = (name: (typeof FIELDS)[number], label: string, placeholder?: string) => (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={`contact-${name}`}>{label}</FieldLabel>
      <Input
        id={`contact-${name}`}
        placeholder={placeholder}
        aria-invalid={!!errors[name]}
        {...form.register(name)}
      />
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit contact" : "Add contact"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              {text("name", "Name")}
              {text("title", "Title")}
            </div>
            {text("email", "Email")}
            <div className="grid gap-5 sm:grid-cols-2">
              {text("work_phone", "Work phone", "(555) 555-5555")}
              {text("cell_phone", "Cell phone", "(555) 555-5555")}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {text("city", "City")}
              {text("state", "State")}
            </div>
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="contact-status">Status</FieldLabel>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={field.onChange}>
                    <SelectTrigger id="contact-status" aria-invalid={!!errors.status}>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-tys-orange text-white hover:bg-tys-orange/90"
              >
                {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add contact"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
