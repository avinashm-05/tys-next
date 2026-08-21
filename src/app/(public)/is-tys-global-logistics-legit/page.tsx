import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = pageMetadata({
  title: "Is TYS Global Logistics Legit? — TYS Global Logistics",
  description:
    "Yes. TYS Global Logistics is a registered US logistics company based in Atlanta, Georgia. Here is our address, contact details and how to verify us before you book.",
  path: "/is-tys-global-logistics-legit",
});

// Brand-defence page (audit, 2026-08-21). People search "is <company> legit"
// before paying a company they have not used before. If we do not answer that
// query, whatever a forum or a competitor comparison site says ranks instead.
//
// Every fact here is verifiable and already published elsewhere on the site
// (address and phone in the footer and schema, socials in the footer). No
// certifications, awards, ratings or membership claims are made, because none
// have been verified for this page.
export default function IsTysLegitPage() {
  return (
    <>
      <PageHeroBand
        title="Is TYS Global Logistics legit?"
        subtitle="A fair question. Here is everything you need to check us out."
      />
      <ServiceCtaBanner />

      <section className="px-4 pb-14 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-ink-muted">
          <p>
            Yes — TYS Global Logistics is a real, registered logistics company operating out of
            Atlanta, Georgia. We think you should check before handing your belongings or your
            money to any shipping company you have not used before, so rather than just assert
            it, here is the information you would need to verify it yourself.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">Who we are</h2>
          <div className="mt-4 space-y-3 text-ink-muted">
            <p>
              <strong className="text-ink">TYS Global Logistics LLC</strong>
              <br />
              6111 Morgan Pl Ct NE, Atlanta, GA 30324, United States
            </p>
            <p>
              Phone:{" "}
              <a href="tel:+14047938759" className="text-brand hover:underline">
                +1 (404) 793-8759
              </a>
              <br />
              Email:{" "}
              <a href="mailto:sales@tysgloballogistics.com" className="text-brand hover:underline">
                sales@tysgloballogistics.com
              </a>
            </p>
            <p>
              That is a real street address and a real phone number that a person answers during
              business hours. Call it before you book if you want to speak to someone first —
              plenty of customers do.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">How to check us out</h2>
          <ul className="mt-4 space-y-3 text-ink-muted">
            <li>
              <strong className="text-ink">Call us.</strong> The quickest test. A company you
              cannot reach by phone is a company you should not be paying.
            </li>
            <li>
              <strong className="text-ink">Look us up on LinkedIn.</strong> Our company page is
              linked in the footer of every page on this site, with real people attached to it.
            </li>
            <li>
              <strong className="text-ink">Check the carriers.</strong> We book through the
              major global carrier networks — see{" "}
              <Link href="/carriers" className="text-brand hover:underline">
                major carriers
              </Link>
              . Your shipment moves on their network and their tracking, not on an unverifiable
              in-house system.
            </li>
            <li>
              <strong className="text-ink">Read the terms.</strong> Our{" "}
              <Link href="/terms" className="text-brand hover:underline">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-brand hover:underline">
                privacy policy
              </Link>{" "}
              are published in full, not hidden behind a booking.
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">
            How to spot a shipping scam anywhere
          </h2>
          <div className="mt-4 space-y-4 text-ink-muted">
            <p>
              Worth knowing regardless of who you ship with. Be wary of any company that asks to
              be paid by wire transfer, gift card or cryptocurrency; that quotes a price far
              below everyone else; that has no verifiable address or a phone number nobody
              answers; or that pressures you to pay immediately.
            </p>
            <p>
              A common one: an unexpected message claiming a parcel is held and demanding a
              small &ldquo;customs fee&rdquo; by card. Real duty and tax is charged by the
              destination country&rsquo;s customs authority, and we will tell you in advance if
              a shipment is likely to attract it — see{" "}
              <Link href="/resources/customs-duty" className="text-brand hover:underline">
                customs duty explained
              </Link>
              . If you get a message like that about a TYS shipment, call us on the number above
              before paying anything.
            </p>
          </div>
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}
