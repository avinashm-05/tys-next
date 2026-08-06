import type { Metadata } from "next";
import Link from "next/link";
import { HeadsetIcon, WalletIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = { title: "Contact Us — TYS Global Logistics" };

export default function ContactUsPage() {
  return (
    <>
      <section className="bg-gray-50 px-4 py-16 md:px-8">
        <div className="mx-auto grid grid-cols-1 max-w-4xl gap-6 md:grid-cols-2">
          <ContactCard
            icon={HeadsetIcon}
            title="Help & Support"
            body="Need an update on your shipment or have a question about an existing booking? Contact our team or request a callback from one of our logistics experts."
            href="/contact-us/support"
            cta="Contact Support"
          />
          <ContactCard
            icon={WalletIcon}
            title="Pay"
            body="Need to make a payment? Complete your transaction securely in just a few clicks. We accept all major credit cards, Zelle, and ACH payments."
            href="/contact-us/pay"
            cta="Pay Online"
          />
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}

function ContactCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: typeof HeadsetIcon;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-3xl border border-brand-light bg-white p-8 shadow-[0_2px_16px_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale">
          <Icon size={22} className="text-brand" />
        </span>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
      </div>
      <hr className="mt-5 border-brand-light" />
      <p className="mt-5 text-ink-muted">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-brand hover:text-brand-dark"
      >
        {cta} <ArrowRightIcon size={14} weight="bold" />
      </Link>
    </div>
  );
}
