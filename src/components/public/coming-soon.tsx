import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
// Type-only import from the base package (erased at compile time — never
// pulls in the CSR runtime, so this stays safe in a server component).
import type { Icon } from "@phosphor-icons/react";

// Shared placeholder for nav destinations not yet built (Destinations,
// Tracking, Contact Us, Book Shipment). Real content lands in a later phase;
// this just keeps the new nav free of dead links in the meantime.
export function ComingSoon({
  icon: PageIcon,
  title,
  body,
}: {
  icon: Icon;
  title: string;
  body: string;
}) {
  return (
    <section className="bg-brand-light px-4 py-24 md:px-8">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale">
          <PageIcon size={26} className="text-brand" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">{title}</h1>
        <p className="mt-3 text-ink-muted">{body}</p>
        <Link
          href="/quotes"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Get a Free Quote <ArrowRightIcon size={14} />
        </Link>
      </div>
    </section>
  );
}
