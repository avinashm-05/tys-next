"use client";

import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { ApiError } from "@/lib/admin-api";

/**
 * The one submit-error handler every admin form uses: a 422 with field errors
 * maps to inline RHF errors (unknown fields fall through to a toast); every
 * other failure is a top-level Sonner toast.
 */
export function handleFormError<T extends FieldValues>(
  e: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): void {
  if (e instanceof ApiError && e.errors) {
    for (const [field, messages] of Object.entries(e.errors)) {
      if ((fields as readonly string[]).includes(field)) {
        setError(field as Path<T>, { type: "server", message: messages[0] });
      } else {
        toast.error(messages[0]);
      }
    }
    return;
  }
  toast.error(e instanceof Error ? e.message : "Something went wrong. Try again.");
}
