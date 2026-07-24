"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { adminApi } from "@/lib/admin-api";
import { handleFormError } from "@/lib/form";
import { emptyStringsToNull } from "@/lib/validation/common";
import { vendorInput, type VendorInput } from "@/lib/validation/vendor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type VendorTypeOption = { id: number; name: string; inactive?: boolean };

export type VendorFormValues = {
  id: number;
  name: string;
  vendorTypeId: number;
  email: string;
  phoneNumber: string;
  countryCode: string;
  website: string | null;
  einNumber: string | null;
  hasSsn: boolean;
  addressLine1: string;
  addressLine2: string | null;
  addressLine3: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: string;
};

type FormInput = z.input<typeof vendorInput>;

const FIELDS = [
  "name",
  "vendor_type_id",
  "email",
  "phone_number",
  "country_code",
  "website",
  "ein_number",
  "ssn_number",
  "address_line_1",
  "address_line_2",
  "address_line_3",
  "city",
  "state",
  "country",
  "postal_code",
  "status",
] as const;

/** Shared by /admin/vendors/new and /[id]/edit. */
export function VendorForm({
  vendor,
  typeOptions,
}: {
  vendor?: VendorFormValues;
  typeOptions: VendorTypeOption[];
}) {
  const router = useRouter();
  const editing = vendor !== undefined;
  const baseResolver = zodResolver(vendorInput);
  const form = useForm<FormInput, unknown, VendorInput>({
    // Laravel's ConvertEmptyStringsToNull runs before validation — mirror it
    // client-side so optional fields ("" in inputs) validate as null.
    resolver: (values, ctx, opts) =>
      baseResolver(emptyStringsToNull(values) as FormInput, ctx, opts),
    defaultValues: {
      name: vendor?.name ?? "",
      vendor_type_id: vendor ? String(vendor.vendorTypeId) : "",
      email: vendor?.email ?? "",
      phone_number: vendor?.phoneNumber ?? "",
      country_code: vendor?.countryCode ?? "+1",
      website: vendor?.website ?? "",
      ein_number: vendor?.einNumber ?? "",
      ssn_number: "",
      address_line_1: vendor?.addressLine1 ?? "",
      address_line_2: vendor?.addressLine2 ?? "",
      address_line_3: vendor?.addressLine3 ?? "",
      city: vendor?.city ?? "",
      state: vendor?.state ?? "",
      country: vendor?.country ?? "",
      postal_code: vendor?.postalCode ?? "",
      status: (vendor?.status as VendorInput["status"]) ?? "active",
    },
  });
  const errors = form.formState.errors as FieldErrors<VendorInput>;
  const { isSubmitting } = form.formState;

  async function onSubmit(values: VendorInput) {
    try {
      if (editing) {
        await adminApi(`/api/admin/vendors/${vendor.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        });
        toast.success("Vendor updated.");
        router.push("/admin/vendors");
      } else {
        const created = await adminApi<{ id: number }>("/api/admin/vendors", {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success("Vendor added.");
        // Laravel redirects a new vendor to its edit page (03-logic).
        router.push(`/admin/vendors/${created.id}/edit`);
      }
    } catch (e) {
      handleFormError(e, form.setError, FIELDS);
    }
  }

  const text = (
    name: (typeof FIELDS)[number],
    label: string,
    extra?: { autoFocus?: boolean; placeholder?: string; description?: string },
  ) => (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        autoFocus={extra?.autoFocus}
        placeholder={extra?.placeholder}
        aria-invalid={!!errors[name]}
        {...form.register(name)}
      />
      {extra?.description && <FieldDescription>{extra.description}</FieldDescription>}
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-h2">{editing ? "Edit vendor" : "Add vendor"}</h1>
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Identity</FieldLegend>
                <FieldGroup>
                  {text("name", "Name", { autoFocus: !editing })}
                  {text("email", "Email")}
                  <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
                    {text("country_code", "Country code", { placeholder: "+1" })}
                    {text("phone_number", "Phone number")}
                  </div>
                  {text("website", "Website", { placeholder: "https://…" })}
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Classification</FieldLegend>
                <FieldGroup>
                  <Field data-invalid={!!errors.vendor_type_id}>
                    <FieldLabel htmlFor="vendor_type_id">Vendor type</FieldLabel>
                    <Controller
                      control={form.control}
                      name="vendor_type_id"
                      render={({ field }) => (
                        <Select
                          value={String(field.value ?? "")}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="vendor_type_id"
                            aria-invalid={!!errors.vendor_type_id}
                          >
                            <SelectValue placeholder="Select a vendor type" />
                          </SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((t) => (
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.name}
                                {t.inactive ? " (inactive)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[errors.vendor_type_id]} />
                  </Field>
                  <Field data-invalid={!!errors.status}>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Controller
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <Select value={String(field.value)} onValueChange={field.onChange}>
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
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Address</FieldLegend>
                <FieldGroup>
                  {text("address_line_1", "Address line 1")}
                  {text("address_line_2", "Address line 2")}
                  {text("address_line_3", "Address line 3")}
                  <div className="grid gap-5 sm:grid-cols-2">
                    {text("city", "City")}
                    {text("state", "State")}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {text("postal_code", "Postal code")}
                    {text("country", "Country")}
                  </div>
                  <FieldDescription>
                    The address is geocoded on save for the vendor map. A failed lookup never
                    blocks saving.
                  </FieldDescription>
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Tax &amp; identifiers</FieldLegend>
                <FieldGroup>
                  {text("ein_number", "EIN")}
                  {text("ssn_number", "SSN", {
                    placeholder: editing && vendor.hasSsn ? "•••••••••" : undefined,
                    description:
                      editing && vendor.hasSsn
                        ? "An SSN is on file (stored encrypted, never shown). Leave blank to keep it; enter a new value to replace it."
                        : "Stored encrypted. Leave blank if not applicable.",
                  })}
                </FieldGroup>
              </FieldSet>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-tys-orange text-white hover:bg-tys-orange/90"
                >
                  {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add vendor"}
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/vendors">Cancel</Link>
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
