import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Icon badge that pokes above its card via negative margin, sitting inline
 * next to the section heading (flex + items-center handles the vertical
 * centering) rather than absolutely overlapping the heading text. Parent
 * Card needs `overflow-visible` so the negative margin isn't clipped.
 *
 * Usage: <div className="mb-4 flex items-center gap-4">
 *          <SectionIconBadge icon={...} />
 *          <h2 className="font-heading text-lg font-semibold">Title</h2>
 *        </div>
 */
export function SectionIconBadge({
  icon: IconComponent,
  className,
}: {
  icon: Icon;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "-mt-10 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-tys-indigo text-white shadow-md",
        className,
      )}
    >
      <IconComponent size={28} weight="bold" />
    </div>
  );
}
