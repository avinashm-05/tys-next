import type { Icon } from "@phosphor-icons/react";

/**
 * The portal's page container, matching the reference hub's arrangement: a
 * white card with a solid icon badge hanging off its top-left corner, the
 * page title beside it, and an optional action on the right.
 *
 * The badge is deliberately pulled outside the card (negative margin + the
 * card's own top padding making room for it) rather than sitting inside —
 * that overhang is the whole visual signature of the reference layout.
 *
 * Colours are TYS's, not the reference's: it uses magenta/purple, which is
 * that company's brand, not a layout decision worth copying.
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
    <div className="relative mt-7 rounded-2xl border border-brand-light bg-white px-5 pt-8 pb-6 md:px-7">
      <div className="absolute -top-7 left-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand shadow-[0_8px_20px_rgba(27,88,214,0.28)] md:left-7">
        <IconCmp size={30} weight="fill" className="text-white" />
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pl-20 md:pl-[4.75rem]">
        <h1 className="text-xl font-bold text-ink md:text-2xl">{title}</h1>
        {action}
      </div>
      {children}
    </div>
  );
}
