import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { PageBody, Prose } from "@/components/public/page-kit";
import { TopicScroller, type Topic } from "@/components/public/topic-scroller";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | TYS Global Logistics",
  description:
    "How TYS Global Logistics collects, uses and protects the personal information you share through our website, quote forms and shipments, and your choices.",
  path: "/privacy-policy",
});

// Each section of the policy is a topic in the sticky table of contents
// (TopicScroller). Wording is the policy's own; only punctuation and
// headings were tidied in the 2026-09-29 renovation.
const TOPICS: Topic[] = [
  {
    id: "overview",
    title: "Overview",
    content: (
      <Prose>
        <p>
          TYS Global Logistics is committed to protecting the personal information you
          share with us. This policy explains what information we collect through our
          website and our quote and booking forms, how we use it, and the choices you
          have.
        </p>
      </Prose>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <Prose>
        <ul>
          <li>
            Contact details you provide, such as your name, email address, and phone
            number. When you fill in the first step of our quote form (name, email and
            phone), we save those details even if you don&apos;t finish the form, so our
            team can follow up and help you complete your quote.
          </li>
          <li>
            Shipment details, such as origin and destination, package information, and
            tracking status.
          </li>
          <li>
            Account information, if you register for a TYS Global Logistics account.
          </li>
          <li>
            Basic technical information (like browser type and pages visited) collected
            automatically when you use our website.
          </li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "how-we-use-your-information",
    title: "How we use your information",
    content: (
      <Prose>
        <p>
          We use your information to provide quotes, process shipments, communicate with
          you about your booking, respond to support requests, and improve our website and
          services. We do not sell your personal information to third parties.
        </p>
      </Prose>
    ),
  },
  {
    id: "cookies-and-tracking",
    title: "Cookies and tracking",
    content: (
      <Prose>
        <p>
          Our website uses essential cookies to keep you signed in and remember your
          session. If enabled, we may also use conversion-tracking tools (such as Google
          Ads) to understand how visitors reach us from advertising campaigns. You can
          control cookies through your browser settings; some parts of the site may not
          function properly without them.
        </p>
      </Prose>
    ),
  },
  {
    id: "communications",
    title: "Communications",
    content: (
      <Prose>
        <p>
          When you request a quote or contact us, we may email you about your request,
          shipment status, or related updates. We may also call or email you regarding an
          active shipment or support request. You can ask to stop receiving non-essential
          communications at any time by contacting us.
        </p>
      </Prose>
    ),
  },
  {
    id: "sharing-of-information",
    title: "Sharing of information",
    content: (
      <Prose>
        <p>
          We share shipment details with the carriers and partners necessary to complete
          your shipment (for example, customs brokers or delivery carriers). We do not
          share your personal information with third parties for their own marketing
          purposes without your consent, except where required by law.
        </p>
      </Prose>
    ),
  },
  {
    id: "signing-in",
    title: "Signing in and your account",
    content: (
      <Prose>
        <ul>
          <li>
            If you sign in with Google or Microsoft, we receive only your name and email
            address from them, and nothing else. We never see or store your Google or
            Microsoft password, and we get no access to your contacts, files, calendar or
            anything in those accounts.
          </li>
          <li>
            If you sign in with a password, we store it only in a scrambled (hashed) form
            that cannot be turned back into your password, and we never send it by email
            or show it to anyone, including our own staff.
          </li>
          <li>
            Staying signed in uses a cookie that contains only a random session number,
            never your email, password or any personal details. Signing out, changing
            your password, or using &ldquo;Sign out other devices&rdquo; ends those
            sessions immediately.
          </li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "data-security",
    title: "Data security",
    content: (
      <Prose>
        <p>
          We use reasonable technical and organizational measures to protect your
          information, including encrypted connections (HTTPS) across our website. No
          method of transmission or storage is 100% secure, but we work to protect your
          data appropriately for its sensitivity.
        </p>
      </Prose>
    ),
  },
  {
    id: "your-choices",
    title: "Your choices",
    content: (
      <Prose>
        <p>
          You may request access to, correction of, or deletion of your personal
          information by contacting us using the details below. We will respond to
          reasonable requests in accordance with applicable law.
        </p>
      </Prose>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children’s privacy",
    content: (
      <Prose>
        <p>
          Our services are not directed to children under 13, and we do not knowingly
          collect personal information from children.
        </p>
      </Prose>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to this policy",
    content: (
      <Prose>
        <p>
          We may update this Privacy Policy from time to time. Changes take effect once
          posted on this page.
        </p>
      </Prose>
    ),
  },
  {
    id: "contact-us",
    title: "Contact us",
    content: (
      <Prose>
        <p>
          Questions about this policy? Reach us at{" "}
          <a href="mailto:sales@tysgloballogistics.com">sales@tysgloballogistics.com</a>{" "}
          or <a href="tel:+14047938759">+1 (404) 793-8759</a>.
        </p>
      </Prose>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy-policy" },
        ]}
      />
      <PageHeroBand
        quote={false}
        kicker="Legal"
        title="Privacy policy"
        subtitle="Last updated: July 2026"
      />

      <PageBody>
        <TopicScroller topics={TOPICS} />
      </PageBody>
    </>
  );
}
