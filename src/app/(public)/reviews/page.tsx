import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, QuotesIcon } from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { GOOGLE_PROFILE_URL, GOOGLE_RATING, GOOGLE_REVIEWS } from "@/lib/google-reviews";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { GoogleMark, Stars } from "@/components/public/google-reviews";
import { Reveal } from "@/components/public/home/reveal";
import { CtaBand, PAD, PageBody, Rail } from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Customer Reviews | TYS Global Logistics",
  description:
    "Read what TYS Global Logistics customers say on Google about shipping and moving with us from the USA. Every review shown word for word.",
  path: "/reviews",
});

// Reviews page (2026-09-30, from the SFL gap list). Google is the only
// review platform TYS is on, so this shows exactly the real Google reviews
// from lib/google-reviews.ts, verbatim, and links to the live profile.
//
// Deliberately NOT here: a review count (the owner asked to hide it while
// it's small), any other platform, invented testimonials, and
// AggregateRating/Review structured data. Google ignores rating markup a
// business publishes about itself ("self-serving reviews") and can treat it
// as spam, so the page earns trust with people, not rich snippets.
export default function ReviewsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Customer Reviews", path: "/reviews" },
        ]}
      />
      <PageHeroBand
        title="What our customers"
        accent="say about us."
        subtitle="Real reviews from people who shipped and moved with TYS, shown word for word from our Google profile."
        quote={false}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={GOOGLE_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg w-full sm:w-auto"
          >
            <GoogleMark size={16} /> Read them on Google <ArrowUpRightIcon size={14} />
          </a>
          <Link href="/quotes" className="btn btn-secondary btn-lg w-full sm:w-auto">
            Get a free quote <ArrowRightIcon size={15} />
          </Link>
        </div>
      </PageHeroBand>

      <PageBody>
        <section>
          <Rail>
            <div className={`py-14 lg:py-20 ${PAD}`}>
              <Reveal className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white">
                  <GoogleMark size={20} />
                </span>
                <span className="text-[2rem] font-semibold leading-none tracking-[-0.03em] text-ink">{GOOGLE_RATING}</span>
                <Stars value={GOOGLE_RATING} size={20} />
                <span className="text-[15px] text-ink-muted">on Google</span>
              </Reveal>

              {/* Masonry-style columns: reviews run very different lengths. */}
              <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
                {GOOGLE_REVIEWS.map((r, i) => (
                  <Reveal
                    key={r.name}
                    delay={(i % 3) * 60}
                    as="figure"
                    className="mb-4 break-inside-avoid rounded-2xl border border-[var(--line)] bg-white p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Stars value={r.stars} size={15} />
                      <QuotesIcon size={20} weight="fill" className="text-[#DCE7FA]" />
                    </div>
                    <blockquote className="mt-4 text-[15.5px] leading-relaxed text-ink">{r.text}</blockquote>
                    <figcaption className="mt-5 flex items-center gap-3 border-t border-[var(--line)] pt-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF4FF] text-[14px] font-semibold text-brand">
                        {r.name.charAt(0)}
                      </span>
                      <span>
                        <span className="block text-[15px] font-semibold text-ink">{r.name}</span>
                        <span className="block text-[13px] text-ink-muted">
                          {r.badge ? `${r.badge} · ` : ""}Google review
                        </span>
                      </span>
                    </figcaption>
                  </Reveal>
                ))}
              </div>

              <Reveal className="mt-8 text-[15px] text-ink-muted">
                Shipped with us?{" "}
                <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">
                  Share your experience on Google
                </a>
                . It helps other families find a shipper they can trust.
              </Reveal>
            </div>
          </Rail>
        </section>

        <CtaBand title="Ready to ship?" />
      </PageBody>
    </>
  );
}
