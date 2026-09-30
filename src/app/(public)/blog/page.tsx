import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { CalendarIcon, ClockIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { blogCategoryIcon } from "@/lib/blog-categories";
import { estimateReadTime, formatBlogDate } from "@/lib/blog-read-time";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BlogBanner } from "@/components/public/blog-banner";
import { Reveal } from "@/components/public/home/reveal";
import {
  CtaBand,
  LINE,
  PAD,
  PageBody,
  Section,
  SectionHead,
} from "@/components/public/page-kit";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Shipping and Moving Blog | TYS Global Logistics",
  description:
    "Plain English guides to international shipping, moving abroad, auto transport and freight forwarding, from the TYS Global Logistics team in Atlanta.",
  path: "/blog",
});

// The admin's publish/edit actions call revalidatePath('/blog') (see
// src/app/api/admin/blog/posts/helpers.ts), which is what makes a change
// show up here immediately instead of waiting for a rebuild. The time-based
// revalidate below exists for a different reason: this page is prerendered
// at build time, and the shared MySQL host intermittently refuses
// connections (see db.ts) — on 2026-09-16 that killed a deploy from here,
// the third page to do so after blog/[slug] and sitemap.xml. The query now
// degrades to an empty list instead of failing the build, and revalidate
// makes such a degraded build heal itself on the next visit after 5
// minutes rather than serving an empty blog until someone republishes.
export const revalidate = 300;

type PostCard = {
  slug: string;
  title: string;
  description: string | null;
  category: string;
  publishedAt: Date | null;
  body: string;
  heroImageKey: string | null;
};

export default async function BlogPage() {
  let posts: PostCard[] = [];
  try {
    posts = await db.post.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        description: true,
        category: true,
        publishedAt: true,
        body: true,
        heroImageKey: true,
      },
    });
  } catch (err) {
    console.warn(
      "[build] Could not reach the database for the blog index; rendering it empty until revalidation:",
      err instanceof Error ? `${err.name}: ${err.message}` : err,
    );
  }

  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <PageHeroBand quote={false}
        title="Shipping and moving"
        accent="guides."
        subtitle="Plain English guides on international shipping, moving abroad and freight forwarding, written by our team."
      />

      <PageBody>
        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="The TYS blog"
              title="Latest"
              accent="articles"
              lead="Customs, packing, costs and timelines, explained by the people who handle them every day."
            />
          </div>

          {posts.length > 0 ? (
            <div
              className={`grid grid-cols-1 border-t ${LINE} sm:grid-cols-2 lg:grid-cols-3`}
            >
              {posts.map((post, i) => (
                <Reveal
                  key={post.slug}
                  as={Link}
                  delay={(i % 3) * 60}
                  href={`/blog/${post.slug}`}
                  className={`group flex flex-col border-b ${LINE} p-6 transition-colors hover:bg-[#F8FAFE] sm:p-8 ${
                    i % 2 === 0 ? "sm:border-r" : "sm:border-r-0"
                  } ${i % 3 === 2 ? "lg:border-r-0" : "lg:border-r"}`}
                >
                  <BlogBanner
                    icon={blogCategoryIcon(post.category)}
                    imageUrl={
                      post.heroImageKey ? `/api/blog/media/${post.heroImageKey}` : null
                    }
                    alt={post.title}
                    className="mb-6 h-44"
                  />
                  <span className="tag self-start">{post.category}</span>
                  <h2 className="mt-3 text-balance text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ink transition-colors group-hover:text-brand">
                    {post.title}
                  </h2>
                  {post.description && (
                    <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-ink-muted">
                      {post.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-4 pt-6 text-[13.5px] text-ink-muted">
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon size={14} /> {formatBlogDate(post.publishedAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <ClockIcon size={14} /> {estimateReadTime(post.body)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 font-medium text-ink transition-colors group-hover:text-brand">
                      Read{" "}
                      <ArrowRightIcon
                        size={13}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className={`border-t ${LINE} py-14 ${PAD}`}>
              <p className="max-w-xl text-[16.5px] leading-relaxed text-ink-muted">
                No articles to show right now. Please check back soon, or read our{" "}
                <Link
                  href="/resources"
                  className="font-medium text-brand hover:underline"
                >
                  shipping resources
                </Link>{" "}
                in the meantime.
              </p>
            </div>
          )}
        </Section>

        <CtaBand />
      </PageBody>
    </>
  );
}
