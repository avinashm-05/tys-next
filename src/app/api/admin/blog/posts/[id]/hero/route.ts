import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { buildStorageKey, deleteFile, putFile } from "@/lib/storage";
import { HttpError } from "@/lib/validation/errors";
import { serializePost } from "../../helpers";

type Ctx = { params: Promise<{ id: string }> };

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Attaches (or replaces) a post's hero image. The post must already exist —
 * "New Post" creates the row first, then the client uploads the image
 * against the new id, same shape as attaching a FedEx label to an existing
 * shipment document row. */
export const POST = adminRoute<Ctx>(async (req, ctx) => {
  const id = parseId((await ctx.params).id);
  if (id === null) throw new HttpError(404, "Post not found.");

  const post = await db.post.findUnique({ where: { id } });
  if (!post) throw new HttpError(404, "Post not found.");

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw new HttpError(422, "No file was uploaded.");

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new HttpError(422, "Hero images must be JPEG, PNG, or WebP.");
  }
  if (file.size > MAX_BYTES) {
    throw new HttpError(422, "Hero images must be 5 MB or smaller.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const key = buildStorageKey(`blog/posts/${id}/hero`, extension);
  await putFile(key, bytes);

  // Replacing an existing hero image — drop the old file once the new one
  // is safely written, so a failed upload never leaves the post with no
  // image at all.
  if (post.heroImageKey) await deleteFile(post.heroImageKey);

  const updated = await db.post.update({
    where: { id },
    data: {
      heroImageKey: key,
      heroImageContentType: file.type,
      heroImageSizeBytes: bytes.byteLength,
      updatedAt: new Date(),
    },
  });

  return Response.json(serializePost(updated));
});

/** Removes a post's hero image entirely (not a replace — the editor's own
 * "Remove" button calls this directly, immediately, rather than deferring
 * to the next Save, since the post already has a real id to act on). */
export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const id = parseId((await ctx.params).id);
  if (id === null) throw new HttpError(404, "Post not found.");

  const post = await db.post.findUnique({ where: { id } });
  if (!post) throw new HttpError(404, "Post not found.");
  if (!post.heroImageKey) return Response.json(serializePost(post));

  await deleteFile(post.heroImageKey);
  const updated = await db.post.update({
    where: { id },
    data: {
      heroImageKey: null,
      heroImageContentType: null,
      heroImageSizeBytes: null,
      updatedAt: new Date(),
    },
  });

  return Response.json(serializePost(updated));
});
