import { GoogleReviewsStrip } from "@/components/public/google-reviews-strip";
import { H2, LEAD, PAD, Rail } from "@/components/public/page-kit";
import { Reveal } from "@/components/public/home/reveal";

// Reviews block reused below the main content of most public pages.
//
// Until 2026-09-29 this showed five invented testimonials ("M. Alvarez,
// Small Business Owner" and others) plus an "Excellent" Trustpilot badge,
// while the real Trustpilot score was 3.5 from a single review. Both are
// gone: it now shows the company's actual Google reviews, verbatim (data in
// lib/google-reviews.ts). Keep it that way; see the note there.
export function TrustedReviewsSection() {
  return (
    <section>
      <Rail>
        <div className={`py-16 lg:py-20 ${PAD}`}>
          <Reveal as="h2" className={H2}>
            What our customers <span className="text-brand">say</span>
          </Reveal>
          <Reveal as="p" delay={80} className={LEAD}>
            Real reviews from Google, shown word for word.
          </Reveal>
          <div className="mt-8">
            <GoogleReviewsStrip />
          </div>
        </div>
      </Rail>
    </section>
  );
}
