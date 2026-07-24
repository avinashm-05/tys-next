import { COUNTRY_LIST } from "@/lib/countries-list";

// Faithful port of partials/country-options.blade.php: a placeholder option
// plus the full ISO country list (alpha-2 code as value, English name as text).
// Server-safe (no hooks), so the hero quick-quote (page.tsx) and the Step 1
// wizard selects share it — their values match (ISO codes, as stored on quotes).
export function CountryOptions({ placeholder = "Select Country" }: { placeholder?: string }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {COUNTRY_LIST.map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </>
  );
}
