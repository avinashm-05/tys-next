import type { Metadata } from "next";
import {
  PhoneIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ContactSupportForm } from "@/components/public/contact-support-form";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = { title: "Contact Support — TYS Global Logistics" };

export default function ContactSupportPage() {
  return (
    <>
      <section className="bg-gray-50 px-4 py-12 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoCard icon={PhoneIcon} label="Call Us" value="+1 (404) 793-8759" />
            <InfoCard
              icon={EnvelopeSimpleIcon}
              label="Email"
              value="sales@tysgloballogistics.com"
            />
            <InfoCard
              icon={MapPinIcon}
              label="Address"
              value="6111 Morgan Pl Ct NE, Atlanta, GA 30324, USA"
            />
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <h1 className="text-2xl font-bold text-ink md:text-3xl">Contact Support</h1>
              <div className="mt-6">
                <ContactSupportForm />
              </div>
            </div>
            <img
              loading="lazy"
              src="/frontend/images/redesign/support-illustration.svg"
              alt=""
              aria-hidden
              className="mx-auto hidden max-w-md self-center md:block"
            />
          </div>
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PhoneIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(16,24,40,0.04)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-pale">
        <Icon size={18} className="text-brand" />
      </span>
      <span>
        <span className="block text-xs text-ink-muted">{label}</span>
        <span className="block text-sm font-semibold text-ink">{value}</span>
      </span>
    </div>
  );
}
