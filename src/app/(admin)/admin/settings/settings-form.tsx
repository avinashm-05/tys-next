"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { adminApi } from "@/lib/admin-api";
import { handleFormError } from "@/lib/form";
import { settingsInput, type SettingsInput } from "@/lib/validation/settings";
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

const FIELDS = [
  "fedex_markup_percentage",
  "fedex_markup_percentage_international",
] as const;

// The schema coerces (string → number), so the form's field type is the
// schema INPUT and submitted values are the parsed OUTPUT.
type FormInput = z.input<typeof settingsInput>;

type SavedMarkups = {
  fedexMarkupPercentage: number;
  fedexMarkupPercentageInternational: number;
};

export function SettingsForm({
  initialDomestic,
  initialInternational,
}: {
  initialDomestic: number;
  initialInternational: number;
}) {
  const form = useForm<FormInput, unknown, SettingsInput>({
    resolver: zodResolver(settingsInput),
    defaultValues: {
      fedex_markup_percentage: initialDomestic,
      fedex_markup_percentage_international: initialInternational,
    },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: SettingsInput) {
    try {
      const saved = await adminApi<SavedMarkups>("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(values),
      });
      form.reset({
        fedex_markup_percentage: saved.fedexMarkupPercentage,
        fedex_markup_percentage_international: saved.fedexMarkupPercentageInternational,
      });
      toast.success("Changes saved.");
    } catch (e) {
      handleFormError(e, form.setError, FIELDS);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-h2">FedEx Markup</h1>
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.fedex_markup_percentage}>
                <FieldLabel htmlFor="fedex_markup_percentage">
                  Domestic markup (US → US) percentage
                </FieldLabel>
                <Input
                  id="fedex_markup_percentage"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  className="max-w-36"
                  aria-invalid={!!errors.fedex_markup_percentage}
                  {...form.register("fedex_markup_percentage")}
                />
                <FieldDescription>
                  Applied to automated FedEx rates on US-to-US quotes (0–100).
                </FieldDescription>
                <FieldError errors={[errors.fedex_markup_percentage]} />
              </Field>
              <Field data-invalid={!!errors.fedex_markup_percentage_international}>
                <FieldLabel htmlFor="fedex_markup_percentage_international">
                  International markup percentage
                </FieldLabel>
                <Input
                  id="fedex_markup_percentage_international"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  className="max-w-36"
                  aria-invalid={!!errors.fedex_markup_percentage_international}
                  {...form.register("fedex_markup_percentage_international")}
                />
                <FieldDescription>
                  Applied to the staff-entered retail on non-US quotes (0–100).
                </FieldDescription>
                <FieldError errors={[errors.fedex_markup_percentage_international]} />
              </Field>
              <div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-tys-blue text-white hover:bg-tys-blue/90"
                >
                  {isSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
