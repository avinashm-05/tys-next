import type { Metadata } from "next";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { LegalSection } from "@/components/public/legal-section";

export const metadata: Metadata = { title: "Privacy Policy — TYS Global Logistics" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeroBand title="Privacy Policy" subtitle="Last updated: July 2026" />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <LegalSection title="Overview">
            <p>
              TYS Global Logistics is committed to protecting the personal information you share
              with us. This policy explains what information we collect through our website and
              quote/booking forms, how we use it, and the choices you have.
            </p>
          </LegalSection>

          <LegalSection title="Information We Collect">
            <ul>
              <li>Contact details you provide, such as your name, email address, and phone number.</li>
              <li>Shipment details, such as origin/destination, package information, and tracking status.</li>
              <li>Account information, if you register for a TYS Global Logistics account.</li>
              <li>
                Basic technical information (like browser type and pages visited) collected
                automatically when you use our website.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="How We Use Your Information">
            <p>
              We use your information to provide quotes, process shipments, communicate with you
              about your booking, respond to support requests, and improve our website and
              services. We do not sell your personal information to third parties.
            </p>
          </LegalSection>

          <LegalSection title="Cookies & Tracking">
            <p>
              Our website uses essential cookies to keep you signed in and remember your session.
              If enabled, we may also use conversion-tracking tools (such as Google Ads) to
              understand how visitors reach us from advertising campaigns. You can control cookies
              through your browser settings; some parts of the site may not function properly
              without them.
            </p>
          </LegalSection>

          <LegalSection title="Communications">
            <p>
              When you request a quote or contact us, we may email you about your request,
              shipment status, or related updates. We may also call or email you regarding an
              active shipment or support request. You can ask to stop receiving non-essential
              communications at any time by contacting us.
            </p>
          </LegalSection>

          <LegalSection title="Sharing of Information">
            <p>
              We share shipment details with the carriers and partners necessary to complete your
              shipment (for example, customs brokers or delivery carriers). We do not share your
              personal information with third parties for their own marketing purposes without
              your consent, except where required by law.
            </p>
          </LegalSection>

          <LegalSection title="Data Security">
            <p>
              We use reasonable technical and organizational measures to protect your information,
              including encrypted connections (HTTPS) across our website. No method of
              transmission or storage is 100% secure, but we work to protect your data
              appropriately for its sensitivity.
            </p>
          </LegalSection>

          <LegalSection title="Your Choices">
            <p>
              You may request access to, correction of, or deletion of your personal information
              by contacting us using the details below. We will respond to reasonable requests in
              accordance with applicable law.
            </p>
          </LegalSection>

          <LegalSection title="Children's Privacy">
            <p>
              Our services are not directed to children under 13, and we do not knowingly collect
              personal information from children.
            </p>
          </LegalSection>

          <LegalSection title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Changes take effect once posted
              on this page.
            </p>
          </LegalSection>

          <LegalSection title="Contact Us">
            <p>
              Questions about this policy? Reach us at{" "}
              <a href="mailto:sales@tysgloballogistics.com">sales@tysgloballogistics.com</a> or{" "}
              <a href="tel:+14047938759">+1 (404) 793-8759</a>.
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
