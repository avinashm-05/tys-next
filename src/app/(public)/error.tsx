"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowClockwiseIcon, PhoneIcon } from "@phosphor-icons/react";

// Shown if a page fails while loading (2026-09-29), instead of Next's bare
// "Application error" screen. Keeps the header and footer, offers a retry,
// and gives the phone number so nobody is left stuck.
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F9FF_55%,#EDF3FF_100%)]">
      <div className="relative mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center md:px-8">
        <span className="tag">Something went wrong</span>
        <h1 className="mt-5 text-balance text-[2.1rem] font-bold leading-[1.06] tracking-[-0.035em] text-ink sm:text-[2.8rem]">
          This page didn&rsquo;t load <span className="text-brand">properly.</span>
        </h1>
        <p className="mt-4 max-w-[520px] text-balance text-[17px] leading-relaxed text-[#3D4656]">
          It&rsquo;s on our side, not yours. Try again, and if it keeps happening, give us a call.
        </p>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-primary btn-lg w-full sm:w-auto">
            <ArrowClockwiseIcon size={15} /> Try again
          </button>
          <a href="tel:+14047938759" className="btn btn-secondary btn-lg w-full sm:w-auto">
            <PhoneIcon size={15} /> +1 (404) 793-8759
          </a>
        </div>
        <Link href="/" className="mt-6 text-[15px] font-medium text-brand hover:underline">
          Back to the home page
        </Link>
      </div>
    </section>
  );
}
