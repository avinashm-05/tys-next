import type { ReactNode } from "react";
import { DestinationPillGrid, type DestinationCountry } from "@/components/public/destination-pill-grid";
import { SplitSection } from "@/components/public/page-kit";

// "TYS Global Logistics" styled inline, matching the brand mentions inside
// each continent's intro copy.
export function BrandName() {
  return <span className="font-semibold text-ink">TYS Global Logistics</span>;
}

// One continent on the /destinations pages: name and intro on the left,
// its clickable country pills on the right (page-kit SplitSection).
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
    <SplitSection title={name} lead={children}>
      <DestinationPillGrid countries={countries} verb={verb} />
    </SplitSection>
  );
}
