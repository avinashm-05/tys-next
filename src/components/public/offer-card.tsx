"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react";

// "What We Offer" card — solid-blue radial reveal on hover, expanding from
// wherever the cursor entered the card (not just a flat color swap). Needs
// to be a client component since it reads the mouse position on enter.
export function OfferCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div
      className="group relative flex flex-col gap-5 overflow-hidden rounded-xl border border-gray-300 bg-white p-10 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-[0_16px_40px_rgba(3,100,255,0.25)]"
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--hover-x", `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty("--hover-y", `${e.clientY - rect.top}px`);
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute z-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-brand transition-transform duration-700 ease-out group-hover:scale-[70]"
        style={{ left: "var(--hover-x, 50%)", top: "var(--hover-y, 50%)" }}
      />
      <img
        src={icon}
        alt=""
        className="relative z-10 h-16 w-auto self-start transition duration-500 group-hover:scale-110 group-hover:brightness-0 group-hover:invert"
      />
      <h3 className="relative z-10 text-2xl font-semibold leading-9 text-ink transition-colors duration-500 group-hover:text-white">
        {title}
      </h3>
      <p className="relative z-10 text-base leading-7 text-ink-muted transition-colors duration-500 group-hover:text-white/85">
        {body}
      </p>
      <Link
        href="/quotes"
        className="relative z-10 mt-auto inline-flex w-fit items-center gap-1 text-base font-bold uppercase tracking-[0.4px] text-brand transition-colors duration-500 group-hover:text-white"
      >
        Read More <ArrowRightIcon size={16} />
      </Link>
    </div>
  );
}
