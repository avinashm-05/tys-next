import type { ElementType, ReactNode } from "react";

// Blur-up reveal (see .reveal / .reveal-hero in globals.css).
// - Default: plays once, fully, when the element scrolls into view (the
//   TARAL way). RevealObserver adds .is-in; until it's mounted, or if
//   script fails, nothing is hidden. It used to be scroll-scrubbed, which
//   left text half-blurred whenever you stopped mid-way.
// - `hero`: a short timed fade-in for content already on screen at load.
// - `delay` staggers either kind.
export function Reveal({
  as: Tag = "div",
  delay = 0,
  hero = false,
  className = "",
  children,
  ...rest
}: {
  as?: ElementType;
  delay?: number;
  hero?: boolean;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag
      className={`${hero ? "reveal-hero" : "reveal"} ${className}`}
      style={delay ? { ["--d" as string]: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
