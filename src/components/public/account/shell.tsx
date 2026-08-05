import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { PageHeroBand } from "@/components/public/page-hero-band";

// Shared wrapper for the auth pages (/account/login, /register, /forgot-*,
// /reset-*, /verify-email) — matches the legal-page pattern (PageHeroBand +
// a centered white card) so the portal looks native to the rest of the
// Tailwind-rebuilt public site instead of the old Bootstrap-era styling.
export function AccountShell({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <>
      <PageHeroBand title={title} subtitle={subtitle} />
      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div
          className={`mx-auto rounded-3xl border border-brand-light bg-white p-6 md:p-10 ${
            wide ? "max-w-3xl" : "max-w-md"
          }`}
        >
          {children}
        </div>
      </section>
    </>
  );
}

/** Inline field error, same look as the wizard's. */
export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
      <WarningCircleIcon size={14} />
      <span>{message}</span>
    </div>
  );
}
