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
        "-mt-10 flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-tys-blue ring-4 ring-background",
        className,
      )}
    >
      <IconComponent size={24} weight="bold" />
    </div>
  );
}
