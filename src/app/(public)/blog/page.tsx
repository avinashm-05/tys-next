import type { Metadata } from "next";
import Link from "next/link";
import { CalendarIcon, ClockIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { db } from "@/lib/db";
import { blogCategoryIcon } from "@/lib/blog-categories";
import { estimateReadTime, formatBlogDate } from "@/lib/blog-read-time";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BlogBanner } from "@/components/public/blog-banner";

export const metadata: Metadata = {
  title: "Shipping & Moving Blog — TYS Global Logistics",
  description:
    "Practical, plain English guides on international shipping, moving abroad, auto transport, freight forwarding, and more, from the TYS Global Logistics team.",
};

// No caching directive needed beyond the default: the admin's publish/edit
// actions call revalidatePath('/blog') themselves (see
// src/app/api/admin/blog/posts/helpers.ts), which is what makes a change
// show up here immediately instead of waiting for a rebuild.
export default async function BlogPage() {
  const posts = await db.post.findMany({
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

  return (
    <>
      <PageHeroBand
        title="Blogs"
        subtitle="Practical guides on international shipping, moving abroad, and freight forwarding, written by our team."
      />

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto grid grid-cols-1 max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-3xl border border-brand-light bg-white p-6 shadow-[0_2px_16px_rgba(16,24,40,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,24,40,0.1)]"
            >
              <BlogBanner
                icon={blogCategoryIcon(post.category)}
                imageUrl={post.heroImageKey ? `/api/blog/media/${post.heroImageKey}` : null}
                alt={post.title}
                className="-mx-6 -mt-6 mb-4 h-36 rounded-b-none rounded-t-3xl"
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                {post.category}
              </span>
              <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{post.title}</h2>
              <p className="mt-2 flex-1 text-sm text-ink-muted">{post.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-brand-light pt-4 text-xs text-ink-muted">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <CalendarIcon size={14} />{" "}
                    {post.publishedAt ? formatBlogDate(post.publishedAt) : "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon size={14} /> {estimateReadTime(post.body)}
                  </span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-brand transition group-hover:translate-x-0.5">
                  Read <ArrowRightIcon size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
