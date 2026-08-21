import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  ScalesIcon,
  ProhibitIcon,
  ReceiptIcon,
  HouseIcon,
  FileTextIcon,
  QuestionIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Resources — TYS Global Logistics",
  description: "Practical guides to international shipping — volumetric weight, customs duty, prohibited items and what paperwork you actually need.",
  path: "/resources",
});

const GUIDES = [
  {
    href: "/resources/volumetric-weight",
    icon: ScalesIcon,
    title: "Volumetric Weight",
    body: "How dimensional weight is calculated, and why it affects your rate.",
  },
  {
    href: "/resources/prohibited-items",
    icon: ProhibitIcon,
    title: "Prohibited Shipping Items",
    body: "What you can't ship due to carrier and customs regulations.",
  },
  {
    href: "/resources/customs-duty",
    icon: ReceiptIcon,
    title: "Guide to Customs Duty",
    body: "How customs duty works, and what affects the amount you owe.",
  },
  {
    href: "/services/international-relocation",
    icon: HouseIcon,
    title: "Relocation Process",
    body: "What to expect, step by step, when you move internationally with us.",
  },
  {
    href: "/services/parcel-shipping",
    icon: FileTextIcon,
    title: "Shipping Documentation",
    body: "The documents you'll need for a smooth international shipment.",
  },
  {
    href: "/faqs",
    icon: QuestionIcon,
    title: "FAQs",
    body: "Quick answers to the questions we hear most often.",
  },
] as const;

export default function ResourcesPage() {
  return (
    <>
      <PageHeroBand
        title="Resources"
        subtitle="Guides to help you ship and move with confidence."
      />
      <ServiceCtaBanner />

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto grid grid-cols-1 max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="rounded-3xl border border-brand-light bg-white p-6 shadow-[0_2px_16px_rgba(16,24,40,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,24,40,0.1)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand">
                <g.icon size={22} />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">{g.title}</h2>
              <p className="mt-1.5 text-sm text-ink-muted">{g.body}</p>
            </Link>
          ))}
        </div>
      </section>


      <TrustedReviewsSection />
    </>
  );
}
