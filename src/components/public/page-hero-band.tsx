import { GoogleRatingPill } from "@/components/public/google-reviews";
import { MiniQuoteForm } from "@/components/public/mini-quote-form";
import { Reveal } from "@/components/public/home/reveal";

// Interior page hero, in the home page's style (2026-09-29 renovation):
// white fading to a soft blue, the Google rating, the page's h1 (with an
// optional accent phrase in brand blue), one line under it, and the wide
// From/To quote bar, so anyone landing on any marketing page (from ads or
// Google sitelinks) can start a quote without scrolling.
//
// quote={false} on pages where a quote bar doesn't belong (legal pages,
// payment, the quote flow itself, and pages people visit for something
// else: FAQs, about, locations). Pages with their own job pass it as
// children instead (tracking puts its lookup there, contact its options),
// which renders in the quote bar's place.
export function PageHeroBand({
  title,
  accent,
  subtitle,
  kicker,
  quote = true,
  quoteTo,
  quotePackage,
  children,
}: {
  title: React.ReactNode;
  /** Rendered after the title in brand blue. */
  accent?: string;
  subtitle?: string;
  /** Small tag above the title; when absent the Google rating shows there. */
  kicker?: string;
  quote?: boolean;
  /** Prefills the quote bar's "Sending to" (ISO code), e.g. "IN". */
  quoteTo?: string;
  /** Package type handed to the wizard, which then skips that step. */
  quotePackage?: string;
  /** Replaces the quote bar with the page's own tool (e.g. a tracking lookup). */
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F9FF_55%,#EDF3FF_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#C9D8F2_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(60%_70%_at_50%_100%,#000,transparent)] opacity-60"
      />
      <div className={`relative mx-auto max-w-4xl px-4 text-center md:px-8 ${quote || children ? "pb-12 pt-12 md:pb-16 md:pt-16" : "pb-12 pt-14 md:pb-16 md:pt-20"}`}>
        <Reveal hero className="flex justify-center">
          {kicker ? <span className="tag">{kicker}</span> : <GoogleRatingPill />}
        </Reveal>
        <Reveal
          hero
          as="h1"
          delay={80}
          className="mx-auto mt-5 max-w-[820px] text-balance text-[2.3rem] font-bold leading-[1.04] tracking-[-0.035em] text-ink sm:text-[3rem] lg:text-[3.4rem]"
        >
          {title}
          {accent && <span className="text-brand"> {accent}</span>}
        </Reveal>
        {subtitle && (
          <Reveal
            hero
            as="p"
            delay={140}
            className="mx-auto mt-4 max-w-[660px] text-balance text-[17px] leading-relaxed text-[#3D4656] sm:text-[18px]"
          >
            {subtitle}
          </Reveal>
        )}
        {children ? (
          <Reveal hero delay={200} className="mx-auto mt-8 max-w-[880px] text-left md:mt-10">
            {children}
          </Reveal>
        ) : (
          quote && (
            <Reveal hero delay={200} className="mx-auto mt-8 max-w-[880px] text-left md:mt-10">
              <MiniQuoteForm layout="wide" defaultTo={quoteTo} packageType={quotePackage} />
            </Reveal>
          )
        )}
      </div>
    </section>
  );
}
