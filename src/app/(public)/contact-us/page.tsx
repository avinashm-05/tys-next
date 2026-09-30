import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { CardGrid, PAD, PageBody, Section, SectionHead } from "@/components/public/page-kit";
import { ContactDetails, ContactQuickActions } from "./contact-details";
import {
  CalculatorIcon,
  QuestionIcon,
  MapPinAreaIcon,
  WalletIcon,
} from "@phosphor-icons/react/dist/ssr";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us: Talk to a Real Person | TYS Global Logistics",
  description:
    "Contact TYS Global Logistics in Atlanta, Georgia. Call or email for help with a shipment, a payment or a free shipping quote.",
  path: "/contact-us",
});

// Contact page, 2026-09-29 renovation (page kit). The h1 now comes from
// PageHeroBand (this page had none before 2026-08-21, which left the main
// ranking signal unset on the page people search "contact" for).
// The message form was removed 2026-09-29 at the owner's request (call and
// email are the channels); /contact-us/support now redirects here. No opening
// hours are shown because none have been confirmed. No CtaBand at the end:
// the whole page is already a way to reach us, and the hero has call/email.
export default function ContactUsPage() {
  return (
    <>
      {/* Call / email in the hero, where other pages have the quote bar. */}
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Contact Us", path: "/contact-us" },
        ]}
      />
      <PageHeroBand
        title="Contact"
        accent="TYS Global Logistics"
        subtitle="Talk to a real person about your shipment, a payment or a new quote. Call or email us."
      >
        <ContactQuickActions />
      </PageHeroBand>

      <PageBody>
        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead kicker="Get in touch" title="Talk to us" accent="directly." lead="Pick whatever's easiest. A real person answers." />
          </div>
          <div className="-mb-px">
            <ContactDetails />
          </div>
        </Section>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead kicker="Quick links" title="What do you need help with?" />
          </div>
          <div className="-mb-px">
            <CardGrid
              columns={4}
              cards={[
                {
                  icon: <QuestionIcon size={22} />,
                  title: "Common questions",
                  body: "Transit times, customs, packing and payments, answered in plain words.",
                  href: "/faqs",
                },
                {
                  icon: <WalletIcon size={22} />,
                  title: "Make a payment",
                  body: "Pay securely in a few clicks. We accept all major credit cards, Zelle and ACH.",
                  href: "/contact-us/pay",
                },
                {
                  icon: <MapPinAreaIcon size={22} />,
                  title: "Track a shipment",
                  body: "Where to find your tracking number, and what each update means.",
                  href: "/tracking",
                },
                {
                  icon: <CalculatorIcon size={22} />,
                  title: "Get a free quote",
                  body: "Tell us what you're sending and where. It takes about 30 seconds.",
                  href: "/quotes",
                },
              ]}
            />
          </div>
        </Section>

        <TrustedReviewsSection />
      </PageBody>
    </>
  );
}
