import type { Icon } from "@phosphor-icons/react";

// Decorative title image for blog cards/posts. No photo library or
// image-generation tool available here, so this is a brand-colored graphic
// banner built from the same icon used for that post elsewhere on the
// site, rather than a stock or fabricated photo.
export function BlogBanner({ icon: IconCmp, className = "" }: { icon: Icon; className?: string }) {
  return (
    <div
      aria-hidden
      className={`relative flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-dark ${className}`}
    >
      <div className="absolute -left-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-white/10" />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 md:h-20 md:w-20">
        <IconCmp size={36} weight="duotone" />
      </span>
    </div>
  );
}
