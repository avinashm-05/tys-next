import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseId } from "@/lib/list-query";
import { PostForm } from "../../post-form";

export const metadata: Metadata = { title: "Edit post — TYS Global Logistics" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const id = parseId((await params).id);
  const row = id !== null ? await db.post.findUnique({ where: { id } }) : null;
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PostForm
        post={{
          id: Number(row.id),
          slug: row.slug,
          title: row.title,
          description: row.description,
          category: row.category,
          body: row.body,
          authorName: row.authorName,
          status: row.status,
          publishedAt: row.publishedAt?.toISOString() ?? null,
          heroImageKey: row.heroImageKey,
        }}
      />
    </div>
  );
}
