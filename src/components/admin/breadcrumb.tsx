"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRightIcon } from "@phosphor-icons/react";

// Generic path → label mapping rather than a per-route table — the admin's
// URL segments are already short, kebab-case nouns (quotes, price-check,
// vendors, shipments, settings, map, new, edit) or numeric ids, so one
// lookup + a numeric fallback covers every current and future route.
const LABELS: Record<string, string> = {
  admin: "Dashboard",
  quotes: "Quotes",
  "price-check": "Get Rates",
  shipments: "Shipments",
  vendors: "Vendors",
  settings: "Settings",
  map: "Map",
  new: "New",
  edit: "Edit",
};

function labelFor(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  if (/^\d+$/.test(segment)) return `#${segment}`;
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, i) => ({
    label: labelFor(segment),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <CaretRightIcon size={12} className="text-muted-foreground" />}
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
