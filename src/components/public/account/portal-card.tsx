import type { Icon } from "@phosphor-icons/react";

/**
 * A page's main surface in the customer portal (2026-09-30 redesign): one
 * white panel with a hairline border on the grey canvas, Attio-style. The
 * page title lives in the portal's top bar, so the panel only carries an
 * optional section heading and action.
 */
export function PortalCard({
  icon: IconCmp,
  title,
  action,
  children,
  className = "",
}: {
  icon?: Icon;
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#E3E7ED] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F3] px-5 py-3.5 md:px-6">
          {title && (
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              {IconCmp && <IconCmp size={17} weight="duotone" className="text-brand" />}
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}
