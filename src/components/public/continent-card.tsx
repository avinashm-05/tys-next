import type { ReactNode } from "react";
import { DestinationPillGrid, type DestinationCountry } from "@/components/public/destination-pill-grid";

// "TYS Global Logistics" styled inline, matching the brand mentions inside
// each continent's intro copy.
export function BrandName() {
  return <span className="font-semibold text-brand">TYS Global Logistics</span>;
}

export function ContinentCard({
  name,
  children,
  countries,
  verb = "Shipping",
}: {
  name: string;
  children: ReactNode;
  countries: DestinationCountry[];
  verb?: "Shipping" | "Moving";
}) {
  return (
    <div className="rounded-3xl border border-brand-light bg-white p-6 shadow-[0_2px_16px_rgba(16,24,40,0.04)] md:p-8">
      <h2 className="text-xl font-semibold uppercase tracking-[0.15em] text-ink">{name}</h2>
      <p className="mt-4 max-w-3xl text-ink-muted">{children}</p>
      <DestinationPillGrid countries={countries} verb={verb} />
    </div>
  );
}
