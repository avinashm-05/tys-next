import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { FlagIcon } from "@/components/public/flag-icon";

export type DestinationCountry = { code: string; label: string };

// Countries with a page of their own; every other pill starts a quote with
// that country already chosen as the destination.
const COUNTRY_PAGES: Record<string, string> = {
  CA: "/destinations/canada",
  IN: "/destinations/india",
  GB: "/destinations/uk",
  PK: "/destinations/pakistan",
  AE: "/destinations/uae",
  AU: "/destinations/australia",
};

// The "flag + Shipping/Moving to X" pills on the /destinations pages. Each
// pill is a link (they used to be plain boxes that looked clickable but
// weren't): to the country's own page where one exists, otherwise straight
// into the quote form with the destination filled in.
export function DestinationPillGrid({
  countries,
  verb,
}: {
  countries: DestinationCountry[];
  verb: "Shipping" | "Moving";
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {countries.map((c) => {
        const href = COUNTRY_PAGES[c.code] ?? `/quotes?to_country=${c.code}`;
        return (
          <Link
            key={c.code + c.label}
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[15px] text-ink transition duration-200 hover:-translate-y-0.5 hover:border-[#C9D6EE] hover:shadow-[0_10px_24px_-14px_rgba(3,100,255,0.45)] active:scale-[0.98]"
          >
            <FlagIcon code={c.code} className="h-4 w-6 shrink-0 rounded-[2px]" />
            <span className="min-w-0 flex-1 leading-snug">
              {verb} to {c.label}
            </span>
            <ArrowRightIcon
              size={14}
              className="shrink-0 text-ink/30 transition duration-200 group-hover:translate-x-0.5 group-hover:text-brand"
            />
          </Link>
        );
      })}
    </div>
  );
}
