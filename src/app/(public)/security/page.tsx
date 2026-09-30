import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { PageBody, Prose } from "@/components/public/page-kit";
import { TopicScroller, type Topic } from "@/components/public/topic-scroller";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Security | TYS Global Logistics",
  description:
    "How TYS Global Logistics protects your personal data and your shipment, from encrypted forms on our website through collection, tracking and delivery.",
  path: "/security",
});

// Each section is a topic in the sticky table of contents (TopicScroller).
const TOPICS: Topic[] = [
  {
    id: "our-approach",
    title: "Our approach to security",
    content: (
      <Prose>
        <p>
          TYS Global Logistics takes the security of your information seriously. Our
          website uses encrypted connections (HTTPS/TLS) to protect data as it travels
          between your browser and our servers, including the details you submit through
          our quote and contact forms.
        </p>
      </Prose>
    ),
  },
  {
    id: "verify-a-secure-connection",
    title: "How to verify a secure connection",
    content: (
      <Prose>
        <p>
          You can confirm you&rsquo;re on a secure connection by checking that the page
          address begins with <span className="font-mono text-ink">https://</span> and
          shows a padlock icon in your browser&rsquo;s address bar before entering any
          personal information.
        </p>
      </Prose>
    ),
  },
  {
    id: "account-security",
    title: "Account security",
    content: (
      <Prose>
        <p>
          If you create a TYS Global Logistics account, we recommend using a strong,
          unique password and keeping your login details confidential. Contact us right
          away if you believe your account has been accessed without your permission.
        </p>
      </Prose>
    ),
  },
  {
    id: "still-have-concerns",
    title: "Still have concerns?",
    content: (
      <Prose>
        <p>
          If you have questions about how we protect your information, or would prefer to
          give us sensitive details over the phone instead of online, contact us at{" "}
          <a href="mailto:sales@tysgloballogistics.com">sales@tysgloballogistics.com</a>{" "}
          or <a href="tel:+14047938759">+1 (404) 793-8759</a>.
        </p>
      </Prose>
    ),
  },
  // Expanded from 150 words (audit, 2026-08-21). The page previously covered
  // only *data* security; "is my shipment safe" is the other half of what
  // someone landing here is asking.
  {
    id: "keeping-your-shipment-secure",
    title: "Keeping your shipment secure",
    content: (
      <Prose>
        <p>
          Every shipment we book moves through established global carrier networks, with
          the same chain of custody, facility security and scanning those carriers apply
          to their own retail traffic. Each shipment is tracked from collection to
          delivery, so there is a record of every facility it passes through.
        </p>
        <p>
          We ask for accurate contents descriptions on every booking, and we will not
          carry items that are restricted or prohibited by the carrier or the destination
          country. That is partly a legal requirement and partly practical: an inaccurate
          declaration is one of the most common reasons a shipment is held or seized at
          customs. Our{" "}
          <Link href="/resources/prohibited-items">prohibited items guide</Link> sets out
          what cannot be shipped and why.
        </p>
        <p>
          For high-value shipments we recommend arranging cover before collection.
          Standard carrier liability is limited and is not the same thing as insurance.
          Talk to us before you book and we will explain what applies to your specific
          shipment.
        </p>
      </Prose>
    ),
  },
];

export default function SecurityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Security", path: "/security" },
        ]}
      />
      <PageHeroBand
        quote={false}
        kicker="Security"
        title="How we protect your"
        accent="data and shipment."
        subtitle="Encrypted forms, tracked handovers, and a person to call if anything looks wrong."
      />

      <PageBody>
        <TopicScroller topics={TOPICS} />
      </PageBody>
    </>
  );
}
