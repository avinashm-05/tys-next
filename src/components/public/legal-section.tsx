import type { ReactNode } from "react";

// Shared prose block for the legal pages (Terms, Privacy, Security) — no
// typography plugin in this project, so this is a small manual style set
// matching the rest of the site's tokens instead.
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-muted [&_a]:font-medium [&_a]:text-brand [&_a]:hover:underline [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
