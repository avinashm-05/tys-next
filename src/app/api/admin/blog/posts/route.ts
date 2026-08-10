import type { Prisma } from "@prisma/client";
import sanitizeHtml from "sanitize-html";
import { adminRoute } from "@/lib/auth";
import { db } from "@/lib/db";
import { listResponse, parseListParams } from "@/lib/list-query";
import { emptyStringsToNull } from "@/lib/validation/common";
import { postInput } from "@/lib/validation/post";
import {
  checkPostSlugUnique,
  postData,
  POST_BODY_SANITIZE_OPTIONS,
  resolvePostSlug,
  resolvePublishedAt,
  revalidatePublicBlog,
  serializePost,
} from "./helpers";

export const GET = adminRoute(async (req) => {
  const p = parseListParams(req, {
    sortable: ["createdAt", "updatedAt", "publishedAt", "title", "status"],
    defaultSort: "createdAt",
  });
  const q = new URL(req.url).searchParams;

  const statusValues = (q.get("status") ?? "").split(",").filter(Boolean);
  const titleFilter = q.get("title")?.trim();
  const categoryFilter = q.get("category")?.trim();

  const where: Prisma.PostWhereInput = {
    ...(statusValues.length ? { status: { in: statusValues as Prisma.EnumPostStatusFilter["in"] } } : {}),
    ...(titleFilter ? { title: { contains: titleFilter } } : {}),
    ...(categoryFilter ? { category: { contains: categoryFilter } } : {}),
    ...(p.search
      ? { OR: [{ title: { contains: p.search } }, { description: { contains: p.search } }] }
      : {}),
  };

  const [rows, total] = await db.$transaction([
    db.post.findMany({ where, orderBy: { [p.sort]: p.dir }, skip: p.skip, take: p.take }),
    db.post.count({ where }),
  ]);

  return listResponse(rows.map(serializePost), total, p);
});

export const POST = adminRoute(async (req, _ctx, session) => {
  const data = postInput.parse(emptyStringsToNull(await req.json()));
  const slug = resolvePostSlug(data);

  const clash = await checkPostSlugUnique(slug);
  if (clash) return clash;

  const now = new Date();
  const created = await db.post.create({
    data: {
      ...postData(data),
      slug,
      body: sanitizeHtml(data.body, POST_BODY_SANITIZE_OPTIONS),
      publishedAt: resolvePublishedAt(data, null),
      createdById: BigInt(session.user.id),
      createdAt: now,
      updatedAt: now,
    },
  });

  if (created.status === "published") revalidatePublicBlog(created.slug);

  return Response.json(serializePost(created), { status: 201 });
});
