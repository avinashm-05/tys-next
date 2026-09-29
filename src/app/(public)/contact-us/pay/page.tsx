import type { Metadata } from "next";
import { PhoneIcon } from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { PaymentTabs } from "@/components/public/payment-tabs";
import { PageBody, Section } from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Online Payment | TYS Global Logistics",
  description:
    "Pay your TYS Global Logistics shipping invoice online. Have your tracking number and invoice amount ready, or call +1 (404) 793-8759 for help with payment.",
  path: "/contact-us/pay",
  noIndex: true,
});

export default function PayPage() {
  return (
    <>
      <PageHeroBand
        quote={false}
        kicker="Online payment"
        title="Pay for your"
        accent="shipment."
        subtitle="Have your tracking number and invoice amount ready. If anything is unclear, call us and we will help."
      />

      <PageBody>
        <Section>
          <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-3xl border border-[var(--line)]">
              <PaymentTabs />
            </div>
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[15px] text-ink-muted">
              Questions about an invoice or payment?
              <a
                href="tel:+14047938759"
                className="inline-flex items-center gap-1.5 font-medium text-ink transition-colors hover:text-brand"
              >
                <PhoneIcon size={15} /> +1 (404) 793-8759
              </a>
            </p>
          </div>
        </Section>
      </PageBody>
    </>
  );
}
