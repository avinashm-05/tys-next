import type { Metadata } from "next";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { LegalSection } from "@/components/public/legal-section";

export const metadata: Metadata = { title: "Security — TYS Global Logistics" };

export default function SecurityPage() {
  return (
    <>
      <PageHeroBand title="Security" subtitle="How we protect your information" />

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-light bg-white p-6 md:p-10">
          <LegalSection title="Our Approach to Security">
            <p>
              TYS Global Logistics takes the security of your information seriously. Our website
              uses encrypted connections (HTTPS/TLS) to protect data as it travels between your
              browser and our servers, including the details you submit through our quote and
              contact forms.
            </p>
          </LegalSection>

          <LegalSection title="How to Verify a Secure Connection">
            <p>
              You can confirm you&rsquo;re on a secure connection by checking that the page address
              begins with <span className="font-mono text-ink">https://</span>{" "}
              and shows a padlock icon in your browser&rsquo;s address bar before entering any
              personal information.
            </p>
          </LegalSection>

          <LegalSection title="Account Security">
            <p>
              If you create a TYS Global Logistics account, we recommend using a strong, unique
              password and keeping your login details confidential. Contact us right away if you
              believe your account has been accessed without your permission.
            </p>
          </LegalSection>

          <LegalSection title="Still Have Concerns?">
            <p>
              If you have questions about how we protect your information, or would prefer to
              submit sensitive details over the phone instead of online, contact us at{" "}
              <a href="mailto:sales@tysgloballogistics.com">sales@tysgloballogistics.com</a> or{" "}
              <a href="tel:+14047938759">+1 (404) 793-8759</a>.
            </p>
          </LegalSection>
        </div>
      </section>
    </>
  );
}
