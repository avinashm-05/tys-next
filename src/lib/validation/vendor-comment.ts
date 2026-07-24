import { z } from "zod";
import { nonBlank } from "@/lib/validation/common";

// VendorCommentStore/UpdateRequest (04-validation §VendorComment).
// Enum values are exact — they are DB enums (01-database).
export const vendorCommentCategory = z.enum([
  "general",
  "performance",
  "issues",
  "compliance",
  "communication",
]);

export const vendorCommentPriority = z.enum(["low", "normal", "high", "critical"]);

export const vendorCommentInput = z.object({
  title: nonBlank(
    "Comment title cannot be empty or contain only whitespace.",
    "The title field must not be greater than 255 characters.",
  ),
  content: z
    .string()
    .max(5000, "The content field must not be greater than 5000 characters.")
    .regex(/\S/, "Comment content cannot be empty or contain only whitespace."),
  category: vendorCommentCategory,
  priority: vendorCommentPriority,
});

export type VendorCommentInput = z.infer<typeof vendorCommentInput>;
