import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogCategoryIcon } from "@/lib/blog-categories";
import { estimateReadTime, formatBlogDate } from "@/lib/blog-read-time";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { CtaBand, LINE, PageBody, Prose, Section } from "@/components/public/page-kit";
import { BlogBanner } from "@/components/public/blog-banner";
import { ArticleJsonLd } from "@/components/public/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

type Params = { slug: string };

// Pre-renders every published post at build time; new/edited posts still
// show up immediately because the admin API calls revalidatePath on
// publish/edit (src/app/api/admin/blog/posts/helpers.ts) — this only
// affects what ships as static HTML on the next full build, not whether an
// edit goes live.
export async function generateStaticParams(): Promise<Params[]> {
  // Never let the build depend on the database being reachable.
  //
  // This runs during `next build`, and on 2026-09-14 it started failing the
  // whole deploy outright:
  //   Failed to collect page data for /blog/[slug]
  //   prisma.post.findMany() -> pool timeout (active=0 idle=0 limit=5)
  // The shared MySQL host now refuses connections in bursts, so with a hard
  // dependency here every deploy became a coin flip — including the deploys
  // that FIX production problems, which is exactly when you can least afford
  // it.
  //
  // Returning [] is a safe degradation, not a loss of function: posts are
  // rendered on demand instead of prebuilt, and the page is dynamic anyway
  // (revalidatePath on publish/edit is what makes edits appear, per the note
  // above). The only cost is the first hit on each post after a deploy
  // rendering server-side rather than being served as ready-made HTML.
  try {
    const posts = await db.post.findMany({
      where: { status: "published" },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch (err) {
    console.warn(
      "[build] Could not reach the database to prerender blog posts; they will render on demand instead:",
      err instanceof Error ? `${err.name}: ${err.message}` : err,
    );
    return [];
  }
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
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = post.metaTitle ?? post.title;
  return {
    title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description: post.description,
      url,
      ...(post.publishedAt ? { publishedTime: post.publishedAt.toISOString() } : {}),
      ...(post.updatedAt ? { modifiedTime: post.updatedAt.toISOString() } : {}),
      authors: [post.authorName],
      ...(post.heroImageKey
        ? {
            images: [
              { url: `${SITE_URL}/api/blog/media/${post.heroImageKey}`, alt: post.title },
            ],
          }
        : {}),
    },
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
        dateModified={post.updatedAt ? post.updatedAt.toISOString() : undefined}
        image={post.heroImageKey ? `${SITE_URL}/api/blog/media/${post.heroImageKey}` : undefined}
      />
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <PageHeroBand
        quote={false}
        kicker={post.category}
        title={post.title}
        subtitle={post.description}
      />

      <PageBody>
        <Section>
          <article className="mx-auto max-w-[720px]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-brand"
            >
              <ArrowLeftIcon size={14} /> All articles
            </Link>

            <div
              className={`mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b ${LINE} pb-6 text-sm text-ink-muted`}
            >
              <span className="flex items-center gap-1.5">
                <UserIcon size={16} /> By {post.authorName}
              </span>
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <CalendarIcon size={16} /> {formatBlogDate(post.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <ClockIcon size={16} /> {estimateReadTime(post.body)}
              </span>
            </div>

            <BlogBanner
              icon={blogCategoryIcon(post.category)}
              imageUrl={post.heroImageKey ? `/api/blog/media/${post.heroImageKey}` : null}
              alt={post.title}
              className="mt-8 h-52 w-full md:h-72"
            />

            {/* Sanitized server-side on every write (sanitize-html against
                POST_BODY_SANITIZE_OPTIONS) before it ever reaches this
                column, so it is safe to render as-is. The editor's raw HTML
                has no per-element classes, so the reading styles hang off
                element selectors: the kit's Prose, plus the tags Prose
                doesn't cover (h2, ol, blockquote, img, tables). */}
            <Prose className="mt-10 [&>div]:space-y-5 [&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-5 [&_blockquote]:italic [&_h2]:mt-12 [&_h2]:text-balance [&_h2]:text-[1.55rem] [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_img]:my-8 [&_img]:rounded-2xl [&_ol]:space-y-2 [&_ol>li]:list-decimal [&_table]:w-full [&_table]:text-left [&_td]:border-b [&_td]:border-[var(--line)] [&_td]:py-2 [&_th]:border-b [&_th]:border-[var(--line)] [&_th]:py-2 [&_th]:font-semibold [&_th]:text-ink">
              <div dangerouslySetInnerHTML={{ __html: post.body }} />
            </Prose>

            <div className={`mt-12 border-t ${LINE} pt-6`}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-brand"
              >
                <ArrowLeftIcon size={14} /> Back to all articles
              </Link>
            </div>
          </article>
        </Section>

        <CtaBand />
      </PageBody>
    </>
  );
}
