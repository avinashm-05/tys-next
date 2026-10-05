"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import {
  BuildingsIcon,
  EnvelopeIcon,
  GlobeIcon,
  MapPinIcon,
  UserCircleIcon,
  UserIcon,
} from "@phosphor-icons/react";
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
import { SectionIconBadge } from "@/components/admin/section-icon-badge";
import { CreatableCombobox, type ComboboxOption } from "@/components/admin/creatable-combobox";

export type VendorTypeOption = { id: number; name: string; inactive?: boolean };

export type VendorFormValues = {
  id: number;
  name: string;
  vendorTypeId: number;
  email: string;
  phoneNumber: string;
  countryCode: string;
  website: string | null;
  addedByName?: string | null;
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

// SETU reference renders filled-in values in a softer gray, not full-strength
// ink — applied to this form's fields only (not an admin-wide Input default).
const FIELD_TEXT = "text-foreground/70";

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

export const VENDOR_FORM_ID = "vendor-form";

/** Shared by /admin/vendors/new and /[id]/edit. */
export function VendorForm({
  vendor,
  typeOptions,
  onSubmittingChange,
}: {
  vendor?: VendorFormValues;
  typeOptions: VendorTypeOption[];
  onSubmittingChange?: (submitting: boolean) => void;
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
  // UI-only for now (not part of the submitted payload) — the Vendor model
  // doesn't have this column yet; wiring it up is a follow-up once the rest
  // of this layout is confirmed.
  const [formW9Required, setFormW9Required] = useState(false);
  // Starts from the server-rendered list; a type created inline (via the
  // combobox's "Add …" option) is appended so it's selectable immediately.
  const [vendorTypes, setVendorTypes] = useState<ComboboxOption[]>(
    typeOptions.map((t) => ({ id: t.id, name: t.inactive ? `${t.name} (inactive)` : t.name })),
  );

  async function createVendorType(name: string) {
    const created = await adminApi<{ id: number; name: string }>("/api/admin/vendor-types", {
      method: "POST",
      body: JSON.stringify({ name, status: "active" }),
    });
    setVendorTypes((prev) => [...prev, created]);
    return created;
  }

  async function onSubmit(values: VendorInput) {
    onSubmittingChange?.(true);
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
    } finally {
      onSubmittingChange?.(false);
    }
  }

  const text = (
    name: (typeof FIELDS)[number],
    label: string,
    extra?: {
      autoFocus?: boolean;
      placeholder?: string;
      description?: string;
      icon?: React.ComponentType<{ size?: number; className?: string }>;
    },
  ) => {

    return (
      <Field data-invalid={!!errors[name]}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <div className="relative">
          <Input
            id={name}
            autoFocus={extra?.autoFocus}
            placeholder={extra?.placeholder}
            aria-invalid={!!errors[name]}
            className={FIELD_TEXT}
            {...form.register(name)}
          />
        </div>
        {extra?.description && <FieldDescription>{extra.description}</FieldDescription>}
        <FieldError errors={[errors[name]]} />
      </Field>
    );
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-h2">{editing ? "Edit vendor" : "Add vendor"}</h1>
      <Card className="overflow-visible">
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <SectionIconBadge icon={UserCircleIcon} />
            <h2 className="font-heading text-lg font-semibold">Vendor information</h2>
          </div>
          <form id={VENDOR_FORM_ID} onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <FieldSet>
                <FieldGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {text("name", "Vendor name", { autoFocus: !editing, icon: UserIcon })}
                  {text("website", "Vendor website", { placeholder: "https://…", icon: GlobeIcon })}
                  <Field>
                    <FieldLabel htmlFor="added_by">Added by</FieldLabel>
                    <div className="relative">
                      <Input
                        id="added_by"
                        value={vendor?.addedByName ?? "You"}
                        disabled
                        className={FIELD_TEXT}
                      />
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="vendor_type_id">Vendor type</FieldLabel>
                    <Controller
                      control={form.control}
                      name="vendor_type_id"
                      render={({ field }) => (
                        <CreatableCombobox
                          id="vendor_type_id"
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                          options={vendorTypes}
                          onCreate={createVendorType}
                          placeholder="Select or add a vendor type…"
                          triggerClassName={FIELD_TEXT}
                        />
                      )}
                    />
                    <FieldError errors={[errors.vendor_type_id]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="form_w9_required">Form W-9 required?</FieldLabel>
                    <Select
                      value={formW9Required ? "yes" : "no"}
                      onValueChange={(v) => setFormW9Required(v === "yes")}
                    >
                      <SelectTrigger id="form_w9_required" className={FIELD_TEXT}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>Not saved yet — visual only for now.</FieldDescription>
                  </Field>
                  {text("ein_number", "EIN number")}
                  {text("ssn_number", "SSN number", {
                    placeholder: editing && vendor.hasSsn ? "•••••••••" : undefined,
                    description:
                      editing && vendor.hasSsn
                        ? "On file (encrypted). Leave blank to keep it."
                        : "Stored encrypted. Leave blank if not applicable.",
                  })}
                  <Field>
                    <FieldLabel htmlFor="phone_number">Phone number</FieldLabel>
                    <div className="grid grid-cols-[5rem_1fr] gap-2">
                      <Input
                        id="country_code"
                        placeholder="+1"
                        aria-invalid={!!errors.country_code}
                        className={FIELD_TEXT}
                        {...form.register("country_code")}
                      />
                      <div className="relative">
                        <Input
                          id="phone_number"
                          aria-invalid={!!errors.phone_number}
                          className={FIELD_TEXT}
                          {...form.register("phone_number")}
                        />
                      </div>
                    </div>
                    <FieldError errors={[errors.country_code, errors.phone_number]} />
                  </Field>
                  {text("email", "Email", { icon: EnvelopeIcon })}
                  {text("address_line_1", "Address line 1", { icon: MapPinIcon })}
                  {text("address_line_2", "Address line 2", { icon: MapPinIcon })}
                  {text("address_line_3", "Address line 3", { icon: MapPinIcon })}
                  {text("country", "Country", { icon: GlobeIcon })}
                  {text("postal_code", "Zip", { icon: BuildingsIcon })}
                  {text("city", "City", { icon: BuildingsIcon })}
                  {text("state", "State", { icon: GlobeIcon })}
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Controller
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <Select value={String(field.value)} onValueChange={field.onChange}>
                          <SelectTrigger id="status" aria-invalid={!!errors.status} className={FIELD_TEXT}>
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
                <FieldDescription>
                  The address is geocoded on save for the vendor map. A failed lookup never
                  blocks saving.
                </FieldDescription>
              </FieldSet>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {onSubmittingChange === undefined && (
        <VendorFormFooter editing={editing} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}

/**
 * Save/Cancel action bar. Sticky to the viewport bottom so it stays
 * reachable without scrolling back up past the tabs (Contact
 * details/Service offered/Comments/Documents) below the form. Submits the
 * form by id, so it can live outside the <form> element in the DOM.
 */
export function VendorFormFooter({
  editing,
  isSubmitting,
}: {
  editing: boolean;
  isSubmitting: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t border-tys-mist bg-background/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:shadow-[0_2px_8px_rgba(16,24,40,0.06)]">
      <Button asChild variant="outline">
        <Link href="/admin/vendors">Cancel</Link>
      </Button>
      <Button
        type="submit"
        form={VENDOR_FORM_ID}
        disabled={isSubmitting}
        className="bg-tys-blue text-white hover:bg-tys-blue/90"
      >
        {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add vendor"}
      </Button>
    </div>
  );
}
