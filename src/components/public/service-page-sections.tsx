import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  BriefcaseIcon,
  ClipboardTextIcon,
  GlobeHemisphereWestIcon,
  HandshakeIcon,
  HeadsetIcon,
  HouseLineIcon,
  ShippingContainerIcon,
  SparkleIcon,
  TagIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";
import { FaqAccordion } from "@/components/public/faq-accordion";
import { FaqJsonLd } from "@/components/public/faq-json-ld";
import type { Faq } from "@/lib/default-faqs";
import { Reveal } from "@/components/public/home/reveal";
import {
  CtaBand,
  FaqSplit,
  H2,
  LEAD,
  LINE,
  PAD,
  Rail,
} from "@/components/public/page-kit";

// Service page sections (2026-09-29 renovation): the same props the service
// pages already pass, now rendered with the page kit (page-kit.tsx) so they
// match the home page: hairline sections, display headings, no grey bands.
// Wrap the page body in <PageBody> for the side rails.

export type Highlight = { icon: string; label: string; sub: string };

// The old filled "badge" illustrations, drawn as Attio-style line icons
// instead (keyed by file name, so pages don't need to change).
const HIGHLIGHT_ICONS: Record<string, Icon> = {
  "badge-trusted-carriers": HandshakeIcon,
  "badge-destinations": GlobeHemisphereWestIcon,
  "badge-door-to-door": HouseLineIcon,
  "badge-best-rates": TagIcon,
  "badge-customs": ClipboardTextIcon,
  "badge-priority-support": HeadsetIcon,
  "badge-business-accounts": BriefcaseIcon,
  "offer-worldwide-shipping": GlobeHemisphereWestIcon,
  "offer-worldwide-moving": TruckIcon,
  "offer-freight-forwarding": ShippingContainerIcon,
};
const iconFor = (path: string): Icon =>
  HIGHLIGHT_ICONS[path.split("/").pop()?.replace(/\.svg$/, "") ?? ""] ?? SparkleIcon;

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
    <section>
      <Rail>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
        <div className={`py-16 lg:py-20 ${PAD}`}>
          <Reveal className="mb-4">
            <span className="tag">{eyebrow}</span>
          </Reveal>
          <Reveal as="h2" className={H2}>
            {heading}
          </Reveal>
          <Reveal as="div" delay={80} className={`${LEAD} space-y-4`}>
            {children}
          </Reveal>
        </div>
        <div className={`flex items-center border-t ${LINE} bg-[radial-gradient(120%_90%_at_100%_0%,#EDF3FF_0%,#FFFFFF_65%)] py-10 lg:border-l lg:border-t-0 ${PAD}`}>
          <Reveal delay={120} className={`grid w-full grid-cols-1 divide-y ${LINE} divide-[var(--line)] rounded-2xl border bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0`}>
            {highlights.map((h) => (
              <div key={h.label} className="flex items-center gap-4 p-5 sm:flex-col sm:items-start sm:gap-5 sm:p-6">
                {(() => {
                  const I = iconFor(h.icon);
                  return (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-ink/70 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                      <I size={17} />
                    </span>
                  );
                })()}
                <span>
                  <span className="block text-[1.35rem] leading-none tracking-[-0.03em] text-ink" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
                    {h.label}
                  </span>
                  <span className="mt-1 block text-[13px] text-ink-muted">{h.sub}</span>
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
      </Rail>
    </section>
  );
}

export function ServiceFaq({ title, faqs }: { title: string; faqs: readonly Faq[] }) {
  return (
    <>
      <FaqJsonLd faqs={faqs} />
      <FaqSplit title={title}>
        <FaqAccordion faqs={faqs} />
      </FaqSplit>
    </>
  );
}

export function ServiceCtaBanner({ label }: { label?: string }) {
  return label ? <CtaBand title={label.replace(/\s*\.?$/, "")} accent="" /> : <CtaBand />;
}
