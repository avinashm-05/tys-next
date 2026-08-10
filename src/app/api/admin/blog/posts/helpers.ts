import type { Post } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type sanitizeHtml from "sanitize-html";
import { db } from "@/lib/db";
import { resolvePostSlug, UNIQUE_SLUG_MESSAGE, type PostInput } from "@/lib/validation/post";
import { validationError } from "@/lib/validation/errors";

// Shared by both the create and update routes, and kept in exact lockstep
// with the admin editor's toolbar (src/components/admin/rich-text-editor.tsx)
// — the editor's StarterKit config has every one of these nodes/marks
// explicitly enabled and nothing else, so nothing a user can actually
// produce in the UI is silently dropped here, and nothing outside what the
// UI offers survives a tampered request either.
export const POST_BODY_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "s", "h2", "h3", "ul", "ol", "li", "a", "blockquote"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
};

export function serializePost(p: Post) {
  return {
    id: Number(p.id),
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    body: p.body,
    authorName: p.authorName,
    status: p.status,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    // Rendered as `/api/blog/media/${heroImageKey}` by the client — the key
    // is already a safe, public-facing path (see storage.ts), no separate
    // "hasFile" indirection needed the way the private shipment-document
    // route uses (that one hides its key; this one's whole point is to be
    // servable).
    heroImageKey: p.heroImageKey,
    heroImageSizeBytes: p.heroImageSizeBytes,
    createdAt: p.createdAt?.toISOString() ?? null,
    updatedAt: p.updatedAt?.toISOString() ?? null,
  };
}

/** snake_case wire fields → Prisma columns (slug/publishedAt handled by the
 * caller — slug because it needs the uniqueness check first, publishedAt
 * because "first publish" has to compare against the existing row). */
export function postData(data: PostInput) {
  return {
    title: data.title,
    description: data.description,
    category: data.category,
    body: data.body,
    authorName: data.author_name?.trim() || "Avinash",
    status: data.status,
  };
}

/** Slug uniqueness, ignoring self on update. Returns the 422 response, or
 * null when it passes — same shape as checkVendorRules. */
export async function checkPostSlugUnique(
  slug: string,
  ignoreId?: bigint,
): Promise<Response | null> {
  const notSelf = ignoreId !== undefined ? { id: { not: ignoreId } } : {};
  const clash = await db.post.findFirst({ where: { slug, ...notSelf }, select: { id: true } });
  return clash ? validationError({ slug: [UNIQUE_SLUG_MESSAGE] }) : null;
}

export { resolvePostSlug };

/** Sets publishedAt the first time a post goes from draft -> published;
 * leaves it alone on every other transition (including staying published,
 * where the client may have deliberately backdated it). */
export function resolvePublishedAt(
  data: PostInput,
  current: { status: string; publishedAt: Date | null } | null,
): Date | null {
  if (data.published_at) return new Date(data.published_at);
  if (data.status === "published" && (!current || current.status !== "published")) {
    return new Date();
  }
  return current?.publishedAt ?? null;
}

/** Publishing, unpublishing, or editing an already-published post all
 * change what the public site should show right now — this is what makes
 * an admin edit go live without a redeploy. A draft-only edit doesn't need
 * it (nothing public to invalidate), but it's cheap and harmless to call
 * unconditionally rather than get the "when" wrong. */
export function revalidatePublicBlog(slug: string, previousSlug?: string): void {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/blog/${previousSlug}`);
}
