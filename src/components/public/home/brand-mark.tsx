"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { SimpleIcon } from "simple-icons";

// Simple Icons draws every mark in a 24x24 box, so a wide wordmark (FedEx,
// DHL, eBay) comes out as a thin strip and looks tiny next to a square icon
// (UPS, Apple). After mount this measures the path's real bounds and crops
// the viewBox to them, so every logo can be sized by one shared height, the
// way Attio's logo wall reads as one even row.
export function BrandMark({
  icon,
  className = "",
  title,
}: {
  icon: SimpleIcon;
  className?: string;
  title?: string;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [viewBox, setViewBox] = useState("0 0 24 24");

  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const b = p.getBBox();
    if (b.width > 0 && b.height > 0) {
      setViewBox(`${b.x} ${b.y} ${b.width} ${b.height}`);
    }
  }, []);

  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={title ?? icon.title}
      className={className}
      style={{ ["--brand" as string]: hoverColor(icon.hex) }}
    >
      <path ref={pathRef} d={icon.path} fill="currentColor" />
    </svg>
  );
}

// Some official brand colours are near-white (Sony's is), which would make
// the logo vanish on hover against a white tile. Fall back to ink for those.
function hoverColor(hex: string) {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#101828" : `#${hex}`;
}
