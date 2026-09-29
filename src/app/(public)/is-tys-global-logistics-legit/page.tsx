import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { TopicScroller } from "@/components/public/topic-scroller";
import { Reveal } from "@/components/public/home/reveal";
import { GoogleMark, Stars } from "@/components/public/google-reviews";
import { GOOGLE_PROFILE_URL, GOOGLE_RATING } from "@/lib/google-reviews";
import { CONTACT } from "@/app/(public)/contact-us/contact-details";
import { CtaBand, LINE, PageBody, Prose, SplitSection } from "@/components/public/page-kit";
import { PhoneIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Is TYS Legit? How to Verify Us | TYS Global Logistics",
  description:
    "Yes. TYS Global Logistics is a registered US company in Atlanta, Georgia. Here's our address, phone and Google rating, and how to check us before you book.",
  path: "/is-tys-global-logistics-legit",
});

// Brand-defence page (audit, 2026-08-21; page kit renovation 2026-09-29).
// People search "is <company> legit" before paying a company they have not
// used before. If we don't answer that query, whatever a forum or a
// competitor comparison site says ranks instead.
//
// Every fact here is verifiable and already published elsewhere on the site
// (address and phone in the footer and schema, LinkedIn in the footer, the
// Google rating from lib/google-reviews.ts). No certifications, awards or
// membership claims are made, because none have been verified. The old
// "LinkedIn page with real people attached" and "plenty of customers call
// first" lines were dropped for the same reason.
const LINKEDIN_URL = "https://www.linkedin.com/company/tys-global-logistics/";

const RED_FLAGS = [
  "Asks to be paid by wire transfer, gift card or cryptocurrency",
  "Quotes a price far below everyone else",
  "Has no address you can check, or a phone number nobody answers",
  "Pressures you to pay right away",
];

export default function IsTysLegitPage() {
  return (
    <>
      <PageHeroBand quote={false}
        title="Is TYS Global Logistics"
        accent="legit?"
        subtitle="A fair question to ask before you pay any shipping company. Here's everything you need to check us out for yourself."
      />

      <PageBody>
        <SplitSection
          kicker="The short answer"
          title="Yes. We're a real company"
          accent="in Atlanta."
          lead="TYS Global Logistics is a registered logistics company in Atlanta, Georgia. Rather than just say so, here are the details you'd need to check it."
        >
          <Reveal as="dl" className={`divide-y divide-[var(--line)] overflow-hidden rounded-2xl border ${LINE} bg-white`}>
            <Row label="Company">TYS Global Logistics LLC</Row>
            <Row label="Address">
              <a href={CONTACT.maps} target="_blank" rel="noopener noreferrer">
                {CONTACT.street}, {CONTACT.city}
              </a>
            </Row>
            <Row label="Phone">
              <a href={CONTACT.tel}>{CONTACT.phone}</a>
            </Row>
            <Row label="Email">
              <a href={CONTACT.mailto}>{CONTACT.email}</a>
            </Row>
            <Row label="Google">
              <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <GoogleMark size={14} />
                <span>{GOOGLE_RATING} out of 5</span>
                <Stars value={GOOGLE_RATING} size={13} />
              </a>
            </Row>
          </Reveal>
          <Prose className="mt-8">
            <p>
              That&rsquo;s a real street address, and a real phone line that a person answers
              during business hours. If you&rsquo;d like to talk to someone before you book, call
              us. We&rsquo;re happy to answer questions.
            </p>
            <p>
              We ship parcels, documents, household moves, vehicles and freight. You can browse{" "}
              <Link href="/services">our services</Link>, see our{" "}
              <Link href="/shipping-rates">shipping rates</Link>, or read about{" "}
              <Link href="/services/parcel-shipping">parcel shipping</Link> and{" "}
              <Link href="/services/international-relocation">international relocation</Link>.
            </p>
          </Prose>
        </SplitSection>

        <TopicScroller
          topics={[
            {
              id: "call-us",
              title: "Call us",
              lead: "The quickest test there is.",
              content: (
                <>
                  <Prose>
                    <p>
                      A company you can&rsquo;t reach by phone is a company you shouldn&rsquo;t
                      pay. Ring us before you book and ask anything you like about your shipment.
                    </p>
                  </Prose>
                  <Reveal delay={80} className="mt-6">
                    <a href={CONTACT.tel} className="btn btn-secondary btn-lg">
                      <PhoneIcon size={15} /> {CONTACT.phone}
                    </a>
                  </Reveal>
                </>
              ),
            },
            {
              id: "read-our-reviews",
              title: "Read our Google reviews",
              lead: `We're rated ${GOOGLE_RATING} out of 5 on Google.`,
              content: (
                <Prose>
                  <p>
                    Our reviews are public on our Google Business Profile, and we show them word for
                    word further down this page. Read them on Google too, where we can&rsquo;t pick
                    and choose.
                  </p>
                  <p>
                    <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer">
                      See our reviews on Google
                    </a>
                  </p>
                </Prose>
              ),
            },
            {
              id: "find-us-on-linkedin",
              title: "Find us on LinkedIn",
              lead: "Our company page is linked in the footer of every page on this site.",
              content: (
                <Prose>
                  <p>
                    <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                      TYS Global Logistics on LinkedIn
                    </a>
                  </p>
                </Prose>
              ),
            },
            {
              id: "check-the-carriers",
              title: "Check who carries it",
              lead: "Your shipment moves on a major carrier's network.",
              content: (
                <Prose>
                  <p>
                    We book through FedEx, DHL, UPS and USPS. Your shipment travels on their network
                    with their tracking, not on an in-house system you can&rsquo;t check.
                  </p>
                  <p>
                    <Link href="/carriers">See the major carriers we use</Link>
                  </p>
                </Prose>
              ),
            },
            {
              id: "read-the-terms",
              title: "Read the small print",
              lead: "Nothing is hidden behind a booking.",
              content: (
                <Prose>
                  <p>
                    Our <Link href="/terms">terms</Link> and{" "}
                    <Link href="/privacy-policy">privacy policy</Link> are published in full, so you
                    can read them before you pay anything.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <SplitSection
          kicker="Worth knowing"
          title="How to spot a"
          accent="shipping scam."
          lead="Useful whoever you ship with. Be wary of any company that does any of these."
        >
          <Reveal as="ul" className={`divide-y divide-[var(--line)] rounded-2xl border ${LINE} bg-white`}>
            {RED_FLAGS.map((f) => (
              <li key={f} className="flex items-start gap-3.5 px-5 py-4 text-[15.5px] leading-relaxed text-ink sm:px-6">
                <WarningCircleIcon size={20} weight="fill" className="mt-0.5 shrink-0 text-[#F04438]" />
                <span>{f}</span>
              </li>
            ))}
          </Reveal>
          <Prose className="mt-8">
            <h3>The fake customs fee</h3>
            <p>
              A common one: a message out of the blue says a parcel is being held and asks for a
              small &ldquo;customs fee&rdquo; by card. Real duty and tax is charged by the
              destination country&rsquo;s customs authority, and we&rsquo;ll tell you in advance if
              a shipment is likely to attract it. Our guide to{" "}
              <Link href="/resources/customs-duty">customs duty</Link> explains how it works.
            </p>
            <p>
              Got a message like that about a TYS shipment? Call us on{" "}
              <a href={CONTACT.tel}>{CONTACT.phone}</a> before you pay anything.
            </p>
          </Prose>
        </SplitSection>

        <TrustedReviewsSection />
        <CtaBand title="Checked us out?" accent="Get a free quote." />
      </PageBody>
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] items-baseline gap-4 px-5 py-4 sm:grid-cols-[110px_1fr] sm:px-6">
      <dt className="text-[13.5px] text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-[15.5px] font-medium text-ink [&_a]:text-ink [&_a]:underline-offset-4 hover:[&_a]:text-brand hover:[&_a]:underline">
        {children}
      </dd>
    </div>
  );
}
