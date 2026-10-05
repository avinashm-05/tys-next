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
  const { errors, isSubmitting, isDirty } = form.formState;
  // Live example so the % means something: what a $100 FedEx rate is quoted at.
  const example = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? `A $100 FedEx rate is quoted at $${(100 * (1 + n / 100)).toFixed(2).replace(/\.00$/, "")}.` : "";
  };
  const domestic = form.watch("fedex_markup_percentage");
  const international = form.watch("fedex_markup_percentage_international");

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
      <div>
        <h1 className="text-h2">FedEx markup</h1>
        <p className="text-sm text-muted-foreground">How much TYS adds on top of FedEx&rsquo;s price. Changes apply to new prices only.</p>
      </div>
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.fedex_markup_percentage}>
                <FieldLabel htmlFor="fedex_markup_percentage">
                  Domestic (within the US)
                </FieldLabel>
                <div className="relative max-w-36">
                  <Input
                    id="fedex_markup_percentage"
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    className="pr-8"
                    aria-invalid={!!errors.fedex_markup_percentage}
                    {...form.register("fedex_markup_percentage")}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
                <FieldDescription>
                  Added to live FedEx prices on US-to-US quotes. {example(domestic)}
                </FieldDescription>
                <FieldError errors={[errors.fedex_markup_percentage]} />
              </Field>
              <Field data-invalid={!!errors.fedex_markup_percentage_international}>
                <FieldLabel htmlFor="fedex_markup_percentage_international">
                  International
                </FieldLabel>
                <div className="relative max-w-36">
                  <Input
                    id="fedex_markup_percentage_international"
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    className="pr-8"
                    aria-invalid={!!errors.fedex_markup_percentage_international}
                    {...form.register("fedex_markup_percentage_international")}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
                <FieldDescription>
                  Added to the FedEx cost you type in on international quotes. {example(international)}
                </FieldDescription>
                <FieldError errors={[errors.fedex_markup_percentage_international]} />
              </Field>
              <div>
                <Button type="submit" disabled={isSubmitting || !isDirty}>
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
