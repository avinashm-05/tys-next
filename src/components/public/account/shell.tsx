import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { PageHeroBand } from "@/components/public/page-hero-band";

// Shared wrapper for the auth pages (/account/login, /register, /forgot-*,
// /reset-*, /verify-email) — matches the legal-page pattern (PageHeroBand +
// a centered white card) so the portal looks native to the rest of the
// Tailwind-rebuilt public site instead of the old Bootstrap-era styling.
// No quote bar here (2026-09-29): people come to these pages to sign in.
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
      <PageHeroBand title={title} subtitle={subtitle} kicker="Your account" quote={false} />
      <section className="bg-white px-4 py-14 md:px-8 md:py-20">
        <div
          className={`mx-auto rounded-[28px] bg-white p-6 shadow-[0_0_0_1px_rgba(3,100,255,0.12),0_30px_70px_-40px_rgba(3,100,255,0.45)] md:p-10 ${
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
