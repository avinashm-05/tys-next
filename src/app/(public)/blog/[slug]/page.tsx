import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogCategoryIcon } from "@/lib/blog-categories";
import { estimateReadTime, formatBlogDate } from "@/lib/blog-read-time";
import { BlogPostHero } from "@/components/public/blog-post-hero";
import { BlogBanner } from "@/components/public/blog-banner";
import { ArticleJsonLd } from "@/components/public/article-json-ld";

type Params = { slug: string };

// Pre-renders every published post at build time; new/edited posts still
// show up immediately because the admin API calls revalidatePath on
// publish/edit (src/app/api/admin/blog/posts/helpers.ts) — this only
// affects what ships as static HTML on the next full build, not whether an
// edit goes live.
export async function generateStaticParams(): Promise<Params[]> {
  const posts = await db.post.findMany({ where: { status: "published" }, select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

async function getPost(slug: string) {
  const post = await db.post.findUnique({ where: { slug } });
  // A draft (or a slug that never existed) 404s — no logged-out preview of
  // unpublished content.
  if (!post || post.status !== "published") return null;
  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  // No "— TYS Blog" suffix: Google truncates titles around 60 characters and
  // every one of these ran 66–82, so the suffix was pushing the actual
  // subject off the end of the result. Dropping it recovers 11 characters on
  // every post (audited 2026-08-21). Canonical is self-referencing so a post
  // reached with UTM parameters doesn't read as a separate page.
  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <>
      <ArticleJsonLd
        headline={post.title}
        description={post.description}
        datePublished={(post.publishedAt ?? post.createdAt ?? new Date()).toISOString()}
        slug={post.slug}
        authorName={post.authorName}
      />
      <BlogPostHero
        category={post.category}
        title={post.title}
        subtitle={post.description}
        date={post.publishedAt ? formatBlogDate(post.publishedAt) : ""}
        readTime={estimateReadTime(post.body)}
      />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <BlogBanner
            icon={blogCategoryIcon(post.category)}
            imageUrl={post.heroImageKey ? `/api/blog/media/${post.heroImageKey}` : null}
            alt={post.title}
            className="mb-8 h-48 w-full md:h-56"
          />
          {/* Sanitized server-side on every write (sanitize-html against
              POST_BODY_SANITIZE_OPTIONS) before it ever reaches this
              column — safe to render as-is. `prose` styles the raw editor
              output; unlike LegalSection above, there are no per-element
              classes on this HTML to hang manual styling off of. */}
          <div
            className="prose prose-slate max-w-none prose-headings:font-heading prose-a:text-brand"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </div>
      </section>
    </>
  );
}
