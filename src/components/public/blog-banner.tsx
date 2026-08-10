import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";

/**
 * Post title image for blog cards/posts. When the admin has uploaded a
 * hero image (`imageUrl`, from the public `/api/blog/media/...` route),
 * that renders as a real photo. Otherwise falls back to the original
 * decorative brand-colored graphic built from the post's category icon —
 * no photo library or image-generation tool available here, so that's a
 * deliberate choice for un-photographed posts, not a placeholder.
 */
export function BlogBanner({
  icon: IconCmp,
  imageUrl,
  alt = "",
  className = "",
}: {
  icon: Icon;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-3xl bg-brand-light ${className}`}>
        <Image src={imageUrl} alt={alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
      </div>
    );
  }
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
