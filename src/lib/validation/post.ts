import { z } from "zod";
import { nonBlank } from "@/lib/validation/common";
import { slugify } from "@/lib/slug";

export const UNIQUE_SLUG_MESSAGE = "A post with this URL slug already exists.";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Wire fields are snake_case (matches the codebase's Laravel-shaped API
// contract, e.g. postInput vs. vendorInput) — the route layer maps this
// onto Post's camelCase Prisma columns.
export const postInput = z.object({
  title: nonBlank(
    "Title cannot be empty or contain only whitespace.",
    "The title field must not be greater than 255 characters.",
  ),
  // Optional on input: the client pre-fills this from the title via the same
  // slugify() the API falls back to, but leaves it editable — an admin might
  // want a shorter/different URL than an exact title-derived one.
  slug: z
    .string()
    .max(255, "The slug field must not be greater than 255 characters.")
    .regex(SLUG_PATTERN, "The slug may only contain lowercase letters, numbers, and hyphens.")
    .nullish(),
  description: nonBlank(
    "Description cannot be empty or contain only whitespace.",
    "The description field must not be greater than 500 characters.",
  ).max(500, "The description field must not be greater than 500 characters."),
  category: nonBlank(
    "Category cannot be empty or contain only whitespace.",
    "The category field must not be greater than 100 characters.",
  ).max(100, "The category field must not be greater than 100 characters."),
  // The rich-text editor's HTML output. Sanitized server-side by the route,
  // not here — zod validates shape, not content safety.
  body: z.string().min(1, "The post body cannot be empty."),
  author_name: z
    .string()
    .max(255, "The author name field must not be greater than 255 characters.")
    .nullish(),
  status: z.enum(["draft", "published"]),
  // ISO datetime string, editable once published (to backdate). Server sets
  // it automatically on first publish if the client doesn't supply one.
  published_at: z.iso.datetime({ offset: true }).nullish(),
});

export type PostInput = z.infer<typeof postInput>;

/** Falls back to a slugified title when the client didn't supply (or
 * blanked) a slug — matches the create/edit form always sending one, but
 * keeps the API safe to call without it (e.g. the migration script). */
export function resolvePostSlug(input: PostInput): string {
  const raw = input.slug?.trim();
  return raw || slugify(input.title) || `post-${Date.now()}`;
}
