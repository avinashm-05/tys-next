import { flagEmoji } from "@/lib/flag-emoji";

export type DestinationCountry = { code: string; label: string };

// The repeating "flag + Shipping/Moving to X" pill grid used on the
// /destinations pages — one row per country, 1/2/3 columns depending on
// viewport width.
export function DestinationPillGrid({
  countries,
  verb,
}: {
  countries: DestinationCountry[];
  verb: "Shipping" | "Moving";
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {countries.map((c) => (
        <div
          key={c.code + c.label}
          className="flex items-center gap-3 rounded-xl bg-brand-pale/60 px-4 py-3 text-sm text-ink"
        >
          <span className="text-lg leading-none" aria-hidden>
            {flagEmoji(c.code)}
          </span>
          <span>
            {verb} to {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
