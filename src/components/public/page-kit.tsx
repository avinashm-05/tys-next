import type { ReactNode } from "react";
import Link from "next/link";
import { QuoteLink } from "@/components/public/quote-link";
import { ArrowRightIcon, CheckIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/public/home/reveal";

// Page kit (2026-09-29): the home page's building blocks, shared so every
// interior page is built the same way. Pages are a stack of these:
//
//   <PageHeroBand .../>            hero + the quote bar (page-hero-band.tsx)
//   <PageBody>                     the hairline "rails" the whole page sits in
//     <Section> <SectionHead/> ... </Section>
//     <CardGrid/> <Checklist/> <Steps/> <StatRow/> <Prose/> <FaqSplit/>
//     <CtaBand/>
//   </PageBody>
//
// Rules the kit follows (keep them when adding to it): hairline dividers
// (var(--line)), no grey bands, no all-caps eyebrows, headings in the
// display face with at most one accent phrase in brand blue, copy with no
// em dashes, and the blur-up Reveal on headings and blocks.

export const PAD = "px-5 sm:px-10 lg:px-14";
export const LINE = "border-[var(--line)]";
export const H2 = "text-balance text-[1.9rem] leading-[1.08] tracking-[-0.03em] text-ink sm:text-[2.3rem]";
export const LEAD = "mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-ink-muted";

/** Wrapper for the page's sections (each section draws its own rails). */
export function PageBody({ children }: { children: ReactNode }) {
  return <div className="bg-white">{children}</div>;
}

/** The content column every section sits in: max 1320px, hairline rails
 *  left and right, and a hairline on top, exactly like the home page. */
export function Rail({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rails border-t ${LINE} ${className}`}>{children}</div>;
}

/** A band of the page: a hairline on top and the standard padding. */
export function Section({
  children,
  id,
  flush = false,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  /** No inner padding (for full-bleed hairline grids). */
  flush?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-28 ${className}`}>
      <Rail>{flush ? children : <div className={`py-16 lg:py-20 ${PAD}`}>{children}</div>}</Rail>
    </section>
  );
}

/** Kicker, heading (with an optional accent phrase), lead, and an action. */
export function SectionHead({
  kicker,
  title,
  accent,
  lead,
  action,
  as = "h2",
}: {
  kicker?: string;
  title: string;
  /** Rendered after the title in brand blue, e.g. title "Ship parcels" accent "anywhere." */
  accent?: string;
  lead?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        {kicker && (
          <Reveal className="mb-4">
            <span className="tag">{kicker}</span>
          </Reveal>
        )}
        <Reveal as={as} className={H2}>
          {title}
          {accent && <span className="text-brand"> {accent}</span>}
        </Reveal>
        {lead && (
          <Reveal as="div" delay={80} className={LEAD}>
            {lead}
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={140}>{action}</Reveal>}
    </div>
  );
}

/** Running text in the site's reading style. */
export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Reveal
      className={`max-w-3xl space-y-4 text-[16.5px] leading-relaxed text-ink-muted [&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline [&_h3]:mt-8 [&_h3]:text-[19px] [&_h3]:font-semibold [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:space-y-2 ${className}`}
    >
      {children}
    </Reveal>
  );
}

export type KitCard = { icon?: ReactNode; title: string; body: ReactNode; href?: string };

const COLS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

/** Attio-style hairline grid of cards. Cards with an href are links. */
export function CardGrid({ cards, columns = 3 }: { cards: KitCard[]; columns?: 2 | 3 | 4 }) {
  return (
    // -mb-px: the last row's bottom hairline overlaps the next section's top
    // hairline instead of doubling it.
    <div className={`-mb-px grid grid-cols-1 border-t ${LINE} ${COLS[columns]}`}>
      {cards.map((c, i) => {
        const inner = (
          <>
            {c.icon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-ink/70 shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition duration-300 group-hover:border-[#C9D6EE] group-hover:text-brand [&_svg]:h-[19px] [&_svg]:w-[19px]">
                {c.icon}
              </span>
            )}
            <h3 className={`${c.icon ? "mt-5" : ""} text-[18px] font-semibold tracking-[-0.015em] text-ink`}>{c.title}</h3>
            <div className="mt-2 text-[15px] leading-relaxed text-ink-muted">{c.body}</div>
            {c.href && (
              // mt-auto: pinned to the card's bottom, so every "Learn more" in a
              // row lines up however long each card's text runs.
              <span className="mt-auto inline-flex items-center gap-1.5 self-start pt-5 text-sm font-medium text-ink transition-colors group-hover:text-brand">
                Learn more <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
          </>
        );
        // Dividers worked out per card (not nth-child rules, which clashed
        // between the 3- and 4-column layouts and dropped a divider): a right
        // hairline on every card that isn't last in its row.
        const smRight = i % 2 === 0 ? "sm:border-r" : "sm:border-r-0";
        const lgRight = columns === 2 ? "" : (i + 1) % columns === 0 ? "lg:border-r-0" : "lg:border-r";
        const cls = `group relative flex flex-col border-b ${LINE} p-6 sm:p-8 ${smRight} ${lgRight} ${
          c.href ? "transition-colors hover:bg-[#F8FAFE]" : ""
        }`;
        // The Reveal IS the card (not a wrapper), so the nth-child border
        // rules and the blur-up both apply to the card itself.
        return c.href ? (
          <Reveal key={c.title} as={Link} href={c.href} delay={(i % 3) * 60} className={cls}>
            {inner}
          </Reveal>
        ) : (
          <Reveal key={c.title} delay={(i % 3) * 60} className={cls}>
            {inner}
          </Reveal>
        );
      })}
    </div>
  );
}

/** A hairline list of points, each with a blue check badge. */
export function Checklist({ items }: { items: ReactNode[] }) {
  return (
    <Reveal as="ul" className={`divide-y ${LINE} divide-[var(--line)] rounded-2xl border bg-white`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3.5 px-5 py-4 text-[15.5px] leading-relaxed text-ink sm:px-6">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-brand">
            <CheckIcon size={11} weight="bold" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Reveal>
  );
}

/** Heading on the left (sticky on desktop), content on the right: the
 *  home page's feature-row layout, which keeps sections dense. */
export function SplitSection({
  kicker,
  title,
  accent,
  lead,
  children,
  id,
}: {
  kicker?: string;
  title: string;
  accent?: string;
  lead?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <Rail>
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className={`py-14 lg:py-20 ${PAD}`}>
            <div className="lg:sticky lg:top-32">
              <SectionHead kicker={kicker} title={title} accent={accent} lead={lead} />
            </div>
          </div>
          <div className={`border-t ${LINE} bg-[radial-gradient(120%_80%_at_100%_0%,#F2F6FF_0%,#FFFFFF_60%)] py-10 lg:border-l lg:border-t-0 lg:py-20 ${PAD}`}>
            {children}
          </div>
        </div>
      </Rail>
    </section>
  );
}

/** Numbered steps as a hairline row. */
export function Steps({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <div className={`-mb-px grid grid-cols-1 border-t ${LINE} sm:grid-cols-2 ${steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {steps.map((s, i) => (
        <Reveal
          key={s.title}
          delay={i * 60}
          className={`border-b ${LINE} p-6 sm:p-8 ${i % 2 === 0 ? "sm:border-r" : ""} lg:border-r lg:last:border-r-0`}
        >
          <span className="text-[2.4rem] leading-none tracking-[-0.04em] text-brand" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
          <div className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{s.body}</div>
        </Reveal>
      ))}
    </div>
  );
}

/** Big-number stats in a hairline grid (like the home page's). */
export function StatRow({ stats }: { stats: { n: string; s?: string; label: string }[] }) {
  return (
    <dl className={`-mb-px grid grid-cols-2 border-t ${LINE} ${stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {stats.map((st, i) => (
        <div
          key={st.label}
          className={`flex flex-col-reverse gap-2 border-b ${LINE} px-5 py-8 sm:px-10 lg:px-14 ${i % 2 === 0 ? "border-r" : ""} lg:border-r lg:last:border-r-0`}
        >
          <dt className="text-[15px] text-ink-muted">{st.label}</dt>
          <dd className="text-[2.6rem] leading-none tracking-[-0.035em] text-ink sm:text-[3rem]" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
            {st.n}
            {st.s && <span className="text-brand">{st.s}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Home-page style FAQ: heading and a call button left, accordion right. */
export function FaqSplit({ title = "Frequently asked questions", children }: { title?: string; children: ReactNode }) {
  return (
    <section id="faq" className="scroll-mt-28">
      <Rail>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr]">
        <div className={`border-b ${LINE} py-14 lg:border-b-0 lg:border-r lg:py-20 ${PAD}`}>
          <div className="lg:sticky lg:top-32">
            <Reveal as="h2" className={H2}>
              {title}
            </Reveal>
            <Reveal as="p" delay={80} className={LEAD}>
              Can&rsquo;t find yours? Call us and talk to a person.
            </Reveal>
            <Reveal delay={140} className="mt-8 flex flex-wrap gap-3">
              <a href="tel:+14047938759" className="btn btn-secondary btn-lg">
                <PhoneIcon size={15} /> +1 (404) 793-8759
              </a>
              <Link href="/faqs" className="btn btn-lg text-ink hover:bg-[#F3F5F9]">
                All questions <ArrowRightIcon size={14} />
              </Link>
            </Reveal>
          </div>
        </div>
        <div className={`py-8 lg:py-16 ${PAD}`}>{children}</div>
      </div>
      </Rail>
    </section>
  );
}

/** Closing call to action, the same everywhere. */
export function CtaBand({
  title = "Ready to ship?",
  accent = "Get a free quote.",
  lead = "Takes 30 seconds. A real person replies, usually within 24 hours.",
}: {
  title?: string;
  accent?: string;
  lead?: string;
}) {
  return (
    <section>
      <Rail className="bg-[radial-gradient(80%_120%_at_50%_0%,#EEF4FF_0%,#FFFFFF_70%)]">
      <div className={`flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center lg:py-20 ${PAD}`}>
        <div>
          <Reveal as="h2" className={H2}>
            {title} <span className="text-brand">{accent}</span>
          </Reveal>
          <Reveal as="p" delay={80} className={LEAD}>
            {lead}
          </Reveal>
        </div>
        <Reveal delay={140} className="flex flex-wrap gap-3">
          <a href="tel:+14047938759" className="btn btn-secondary btn-lg">
            <PhoneIcon size={15} /> Call us
          </a>
          <QuoteLink className="btn btn-primary btn-lg">
            Get a free quote <ArrowRightIcon size={15} />
          </QuoteLink>
        </Reveal>
      </div>
      </Rail>
    </section>
  );
}
