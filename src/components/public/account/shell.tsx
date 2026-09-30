import { CheckIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";

// Shared frame for the customer auth pages (/account/login, /register,
// /forgot-*, /reset-*, /verify-email and the Book now door), redesigned
// 2026-09-30 to match the quote page and the portal: a dark navy band with
// the blue glow and dot field, the title and what an account is for on the
// left, and the form in a bright white card on the right (stacked on
// phones). data-nav-dark turns the sticky header dark over it.
const PERKS = [
  "Book pickups online, any time",
  "See every shipment in one place",
  "Your addresses saved for next time",
];

export function AccountShell({
  title,
  accent,
  subtitle,
  kicker = "Your account",
  perks = true,
  children,
  wide = false,
}: {
  title: string;
  /** Shown after the title in light blue. */
  accent?: string;
  subtitle?: string;
  kicker?: string;
  /** The "what you get" list beside the form (login / sign-up). */
  perks?: boolean;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section data-nav-dark className="relative flex min-h-[calc(100svh-3.5rem)] items-center overflow-hidden bg-[#0B1220]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_15%_10%,rgba(3,100,255,0.32),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(55%_70%_at_20%_20%,#000,transparent)]"
      />
      <div
        className={`relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 md:px-8 md:py-20 ${
          wide ? "" : "lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16"
        }`}
      >
        <div className={wide ? "text-center" : "text-center lg:text-left"}>
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white/80 ring-1 ring-inset ring-white/15">
            {kicker}
          </span>
          <h1 className="mt-4 text-balance text-[2.1rem] font-bold leading-[1.05] tracking-[-0.035em] text-white sm:text-[2.8rem]">
            {title}
            {accent && <span className="text-[#6FA3FF]"> {accent}</span>}
          </h1>
          {subtitle && (
            <p className={`mt-4 max-w-[520px] text-[17px] leading-relaxed text-white/70 ${wide ? "mx-auto" : "mx-auto lg:mx-0"}`}>
              {subtitle}
            </p>
          )}
          {perks && !wide && (
            <ul className="mx-auto mt-8 hidden max-w-[420px] flex-col gap-3 text-left lg:mx-0 lg:flex">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15.5px] font-medium text-white/85">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/90 text-white">
                    <CheckIcon size={13} weight="bold" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          className={`w-full rounded-[28px] bg-white p-6 shadow-[0_0_0_1px_rgba(3,100,255,0.14),0_40px_80px_-36px_rgba(3,100,255,0.65)] sm:p-8 ${
            wide ? "mx-auto max-w-3xl" : "mx-auto max-w-[460px] lg:mx-0"
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/** Inline field error, same look as the quote wizard's. */
export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 px-1 text-[14px] font-medium text-red-700">
      <WarningCircleIcon size={15} />
      <span>{message}</span>
    </div>
  );
}
