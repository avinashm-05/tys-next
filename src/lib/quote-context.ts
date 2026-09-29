// What each page already knows about a quote (2026-09-30): the destination
// country and/or the package type. Every quote entry point on the page (the
// hero quote bar, the header's "Get a free quote" button, the phone menu's
// button and the "Get a free quote" band at the bottom) reads this, so the
// wizard opens pre-filled: "Sending to" set on country pages, and the
// "What are you sending?" step skipped on service pages (a 2-step wizard).
//
// Package values must be ones the wizard offers (PACKAGE_TYPES in
// src/lib/validation/quote-wizard.ts). Freight forwarding and pallet
// shipping are left out on purpose: none of the wizard's types describes
// freight or pallets, and a wrong label would mislead the sales team.
export type QuoteContext = { to?: string; pkg?: string };

const CONTEXT: Record<string, QuoteContext> = {
  // Moving
  "/services/packers-and-movers": { pkg: "packers_movers" },
  "/services/international-relocation": { pkg: "packers_movers" },
  "/services/domestic-moving": { to: "US", pkg: "packers_movers" },
  "/destinations/moving": { pkg: "packers_movers" },
  "/destinations/moving/india": { to: "IN", pkg: "packers_movers" },
  "/services/piano-moving": { pkg: "furniture" },
  "/services/auto-transport": { pkg: "auto" },
  // Parcels and documents
  "/services/document-shipping": { pkg: "envelope" },
  "/services/parcel-shipping": { pkg: "boxes" },
  "/services/ship-boxes-internationally": { pkg: "boxes" },
  "/services/baggage-shipping": { pkg: "boxes" },
  "/services/global-shopper": { pkg: "boxes" },
  "/services/domestic-shipping": { to: "US", pkg: "boxes" },
  // Business
  "/services/small-business-shipping": { pkg: "boxes" },
  "/services/retailer-shipping": { pkg: "boxes" },
  "/services/volume-shipping": { pkg: "boxes" },
  // Destinations
  "/destinations/canada": { to: "CA" },
  "/destinations/india": { to: "IN" },
  "/destinations/india/shipping-cost": { to: "IN", pkg: "boxes" },
  "/destinations/india/documents": { to: "IN", pkg: "envelope" },
  "/destinations/india/electronics": { to: "IN", pkg: "boxes" },
  "/destinations/uk": { to: "GB" },
  "/destinations/pakistan": { to: "PK" },
  "/destinations/uae": { to: "AE" },
  "/destinations/australia": { to: "AU" },
};

export function quoteContext(pathname: string | null | undefined): QuoteContext {
  if (!pathname) return {};
  return CONTEXT[pathname.replace(/\/+$/, "") || "/"] ?? {};
}

/** /quotes URL carrying this page's context (always from the US). */
export function quoteHref(pathname: string | null | undefined, override: QuoteContext = {}): string {
  const ctx = { ...quoteContext(pathname), ...stripEmpty(override) };
  if (!ctx.to && !ctx.pkg) return "/quotes";
  const params = new URLSearchParams({ from_country: "US" });
  if (ctx.to) params.set("to_country", ctx.to);
  if (ctx.pkg) params.set("package_type", ctx.pkg);
  return `/quotes?${params.toString()}`;
}

function stripEmpty(c: QuoteContext): QuoteContext {
  const out: QuoteContext = {};
  if (c.to) out.to = c.to;
  if (c.pkg) out.pkg = c.pkg;
  return out;
}
