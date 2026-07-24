import type { Metadata } from "next";
import { HeadsetIcon, EnvelopeSimpleIcon, PhoneIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Contact Us — TYS Global Logistics" };

// Placeholder for now — real contact/help/payment sub-pages land in a later
// phase (04_Contact_us in the Figma set). This gives the nav a working link
// with the real, existing contact channels in the meantime.
export default function ContactUsPage() {
  return (
    <section className="bg-brand-light px-4 py-24 md:px-8">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale">
          <HeadsetIcon size={26} className="text-brand" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">Contact Us</h1>
        <p className="mt-3 text-ink-muted">
          Our full support center is on its way. For now, reach us directly:
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <a href="tel:+14047938759" className="flex items-center gap-2 font-semibold text-brand">
            <PhoneIcon size={16} /> +1 (404) 793-8759
          </a>
          <a
            href="mailto:hello@tysgloballogistics.com"
            className="flex items-center gap-2 font-semibold text-brand"
          >
            <EnvelopeSimpleIcon size={16} /> hello@tysgloballogistics.com
          </a>
        </div>
      </div>
    </section>
  );
}
