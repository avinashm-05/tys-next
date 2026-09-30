import type { Icon } from "@phosphor-icons/react";

/**
 * The portal's page container (2026-09-30 redesign): the quote page's white
 * card with its blue-tinted edge and lift, overlapping the dark header band.
 * The page title now lives in that band (portal-header.tsx), so the card
 * carries only a small section label and an optional action.
 */
export function PortalCard({
  icon: IconCmp,
  title,
  action,
  children,
}: {
  icon: Icon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgba(3,100,255,0.14),0_40px_80px_-36px_rgba(3,100,255,0.55)] sm:p-6 md:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-[18px] font-bold tracking-[-0.01em] text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F0FF] text-brand">
            <IconCmp size={19} weight="fill" />
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}
