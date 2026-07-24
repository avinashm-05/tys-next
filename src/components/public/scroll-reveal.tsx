"use client";

import { useEffect, useRef, useState } from "react";

// Subtle fade + slide-up reveal for whole sections as they scroll into view.
// (A blur-to-sharp variant was tried — to bring it back, swap the two
// className strings below to "blur-none opacity-100" (visible) and
// "blur-sm opacity-70" (hidden).) IntersectionObserver-based (no animation
// library) — fires once, then disconnects, so it never re-triggers on
// scroll-up.
//
// Once the reveal transition finishes, the wrapper drops its `transform`
// class entirely (rather than leaving `translate-y-0`, which is visually a
// no-op but is still a non-"none" transform value). A non-"none" transform
// creates a new CSS stacking context, and every section on this page is
// wrapped in one of these — so an in-flow "settled" transform was trapping
// dropdown/popover z-index (e.g. the country selector) inside that
// section's stacking context, letting *later* sections paint over it
// regardless of how high the popover's own z-index was set.
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stateClasses = settled
    ? "opacity-100"
    : visible
      ? "translate-y-0 opacity-100"
      : "translate-y-8 opacity-0";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${stateClasses} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform" && visible) setSettled(true);
      }}
    >
      {children}
    </div>
  );
}
