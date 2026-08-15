import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircleIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { FaqJsonLd } from "@/components/public/faq-json-ld";
import type { Faq } from "@/lib/default-faqs";

// Shared building blocks for the "Learn More" service pages linked from the
// home page's feature-section cards (Relocation & Auto Transport, Document &
// Parcel, etc.) — content-inspired-by-competitor-sites-but-rewritten pages,
// starting with International Relocation. Small composable sections (not one
// big prop-driven template) so each new service page can pick only what it
// needs and reorder freely.

export type Highlight = { icon: string; label: string; sub: string };

export function ServiceIntro({
  eyebrow,
  heading,
  children,
  highlights,
}: {
  eyebrow: string;
  heading: string;
  children: ReactNode;
  highlights: Highlight[];
}) {
  return (
    <section className="px-4 py-14 md:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[1.6px] text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink md:text-4xl">{heading}</h1>
        <div className="mt-4 space-y-4 text-ink-muted">{children}</div>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-8">
        {highlights.map((h) => (
          <div key={h.label} className="flex items-center gap-3 text-left">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light">
              <img loading="lazy" src={h.icon} alt="" className="h-[27px] w-auto" />
            </span>
            <span className="text-xs font-semibold">
              <span className="block text-ink">{h.label}</span>
              <span className="text-ink-muted">{h.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ServiceChecklist({
  title,
  items,
  tone = "gray",
}: {
  title: string;
  items: string[];
  tone?: "gray" | "white";
}) {
  return (
    <section
      className={`px-4 py-14 md:px-8 ${tone === "gray" ? "bg-gray-50" : "bg-white"}`}
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">{title}</h2>
        <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-ink-muted">
              <CheckCircleIcon
                size={20}
                weight="fill"
                className="mt-0.5 shrink-0 text-brand"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export type ServiceCard = { icon: ReactNode; title: string; body: string };

const GRID_COLS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function ServiceCardGrid({
  title,
  cards,
  columns = 2,
}: {
  title: string;
  cards: ServiceCard[];
  columns?: 2 | 3 | 4;
}) {
  return (
    <section className="px-4 py-14 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">{title}</h2>
        <div className={`mt-6 grid gap-6 ${GRID_COLS[columns]}`}>
          {cards.map((c) => (
            <div
              key={c.title}
              className="rounded-3xl border border-brand-light bg-white p-6 shadow-[0_2px_16px_rgba(16,24,40,0.04)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand">
                {c.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export type ServiceStep = { title: string; body: string };

export function ServiceSteps({ title, steps }: { title: string; steps: ServiceStep[] }) {
  return (
    <section className="bg-gray-50 px-4 py-14 md:px-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">{title}</h2>
        <div className="mt-8 space-y-6">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServiceFaq({ title, faqs }: { title: string; faqs: readonly Faq[] }) {
  return (
    <section className="bg-gray-50 px-4 py-14 md:px-8">
      <FaqJsonLd faqs={faqs} />
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold text-ink md:text-3xl">{title}</h2>
        <div className="mt-6">
          <FaqAccordion faqs={faqs} />
        </div>
      </div>
    </section>
  );
}

export function ServiceCtaBanner({ label = "Get a Free Quote" }: { label?: string }) {
  return (
    <section className="px-4 pb-14 md:px-8">
      <Link
        href="/quotes"
        className="btn-shine mx-auto flex max-w-6xl items-center justify-end gap-2 rounded-3xl bg-gradient-to-r from-brand/50 to-brand px-10 py-8 text-2xl font-semibold text-white transition duration-300 hover:scale-[1.01] hover:opacity-95"
      >
        {label} <ArrowRightIcon size={26} />
      </Link>
    </section>
  );
}
