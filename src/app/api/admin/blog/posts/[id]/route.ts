import sanitizeHtml from "sanitize-html";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { postInput } from "@/lib/validation/post";
import { HttpError } from "@/lib/validation/errors";
import { deleteFile } from "@/lib/storage";
import {
  checkPostSlugUnique,
  postData,
  resolvePostSlug,
  resolvePublishedAt,
  revalidatePublicBlog,
  serializePost,
} from "../helpers";

type Ctx = { params: Promise<{ id: string }> };

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "a", "blockquote"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
};

async function findOr404(param: string) {
  const id = parseId(param);
  const row = id !== null ? await db.post.findUnique({ where: { id } }) : null;
  if (!row) throw new HttpError(404, "Post not found.");
  return row;
}

export const GET = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  return Response.json(serializePost(row));
});

export const PATCH = adminRoute<Ctx>(async (req, ctx) => {
  const existing = await findOr404((await ctx.params).id);
  const data = postInput.parse(emptyStringsToNull(await req.json()));
  const slug = resolvePostSlug(data);

  const clash = await checkPostSlugUnique(slug, existing.id);
  if (clash) return clash;

  const updated = await db.post.update({
    where: { id: existing.id },
    data: {
      ...postData(data),
      slug,
      body: sanitizeHtml(data.body, SANITIZE_OPTIONS),
      publishedAt: resolvePublishedAt(data, existing),
      updatedAt: new Date(),
    },
  });

  // Both slugs need invalidating on a rename: the new URL should start
  // working immediately, and the old one (now 404ing) shouldn't keep
  // serving a stale cached copy.
  if (updated.status === "published" || existing.status === "published") {
    revalidatePublicBlog(updated.slug, existing.slug);
  }

  return Response.json(serializePost(updated));
});

export const DELETE = adminRoute<Ctx>(async (_req, ctx) => {
  const row = await findOr404((await ctx.params).id);
  if (row.heroImageKey) await deleteFile(row.heroImageKey);
  await db.post.delete({ where: { id: row.id } });
  if (row.status === "published") revalidatePublicBlog(row.slug);
  return Response.json({ success: true });
});
