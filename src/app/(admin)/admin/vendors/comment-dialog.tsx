"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { adminApi } from "@/lib/admin-api";
import { handleFormError } from "@/lib/form";
import {
  vendorCommentInput,
  type VendorCommentInput,
} from "@/lib/validation/vendor-comment";
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
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABELS, PRIORITY_LABELS, type CommentRow } from "./comments-section";

const FIELDS = ["title", "content", "category", "priority"] as const;

/** Mounted fresh per open (parent conditional-renders it) so RHF state resets. */
export function CommentDialog({
  vendorId,
  comment,
  onClose,
  onSaved,
}: {
  vendorId: number;
  comment?: CommentRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = comment !== undefined;
  const form = useForm<VendorCommentInput>({
    resolver: zodResolver(vendorCommentInput),
    defaultValues: {
      title: comment?.title ?? "",
      content: comment?.content ?? "",
      category: comment?.category ?? "general",
      priority: comment?.priority ?? "normal",
    },
  });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: VendorCommentInput) {
    try {
      if (editing) {
        await adminApi(`/api/admin/vendors/${vendorId}/comments/${comment.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        });
        toast.success("Comment updated.");
      } else {
        await adminApi(`/api/admin/vendors/${vendorId}/comments`, {
          method: "POST",
          body: JSON.stringify(values),
        });
        toast.success("Comment added.");
      }
      onSaved();
    } catch (e) {
      handleFormError(e, form.setError, FIELDS);
    }
  }

  const enumSelect = (
    name: "category" | "priority",
    label: string,
    options: Record<string, string>,
  ) => (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={`comment-${name}`}>{label}</FieldLabel>
      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={`comment-${name}`} aria-invalid={!!errors[name]}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(options).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit comment" : "Add comment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="comment-title">Title</FieldLabel>
              <Input
                id="comment-title"
                aria-invalid={!!errors.title}
                {...form.register("title")}
              />
              <FieldError errors={[errors.title]} />
            </Field>
            <Field data-invalid={!!errors.content}>
              <FieldLabel htmlFor="comment-content">Comment</FieldLabel>
              <Textarea
                id="comment-content"
                rows={5}
                aria-invalid={!!errors.content}
                {...form.register("content")}
              />
              <FieldError errors={[errors.content]} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              {enumSelect("category", "Category", CATEGORY_LABELS)}
              {enumSelect("priority", "Priority", PRIORITY_LABELS)}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-tys-orange text-white hover:bg-tys-orange/90"
              >
                {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add comment"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
