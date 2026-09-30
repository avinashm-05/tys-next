import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { TrackingLookupForm } from "@/components/public/tracking-lookup-form";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { TopicScroller } from "@/components/public/topic-scroller";
import { Reveal } from "@/components/public/home/reveal";
import { ContactDetails } from "@/app/(public)/contact-us/contact-details";
import {
  Checklist,
  CtaBand,
  PAD,
  PageBody,
  Prose,
  Section,
  SectionHead,
  SplitSection,
  Steps,
} from "@/components/public/page-kit";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Shipment Tracking: Track Your Package | TYS Global Logistics",
  description:
    "Track your TYS Global Logistics shipment with the number from your confirmation email. See what each scan means, and who to call if tracking stalls.",
  path: "/tracking",
});

// Tracking page, 2026-09-29 renovation (page kit).
// The lookup form isn't wired to live tracking yet (no fulfilment/tracking
// backend; see (public)/account/tracking's stub note). It shows an honest
// "coming soon" message on submit, and the copy here says the same up
// front rather than promising real-time results. Expanded from 137 words in
// the 2026-08-21 audit: "track my shipment" is a high-intent query, and the
// copy only describes how tracking already behaves.
export default function TrackingPage() {
  return (
    <>
      {/* The lookup sits in the hero, where other pages have the quote bar:
          people land here to track, not to get a quote. */}
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Track a Shipment", path: "/tracking" },
        ]}
      />
      <PageHeroBand
        title="Track your"
        accent="shipment"
        subtitle="Use the tracking number from your confirmation email. If something looks stuck, call us and we'll chase it with the carrier."
      >
              <div className="rounded-[28px] bg-white p-6 shadow-[0_0_0_1px_rgba(3,100,255,0.14),0_40px_80px_-36px_rgba(3,100,255,0.55)] sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-brand">
                    <MagnifyingGlassIcon size={20} />
                  </span>
                  <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">Enter your tracking number</h2>
                </div>
                <TrackingLookupForm />
                <p className="mt-5 border-t border-[var(--line)] pt-5 text-[14.5px] leading-relaxed text-ink-muted">
                  Live lookup on this page is coming soon. Until then, the latest status is in your
                  confirmation email, and our team can check any shipment for you on{" "}
                  <a href="tel:+14047938759" className="font-medium text-brand underline-offset-4 hover:underline">
                    +1 (404) 793-8759
                  </a>
                  .
                </p>
              </div>
      </PageHeroBand>

      <PageBody>
        <Section id="lookup">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">

            <div>
              <Reveal as="h3" className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
                Where to find your number
              </Reveal>
              <Reveal as="p" delay={60} className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                You get a tracking number as soon as your shipment is booked.
              </Reveal>
              <div className="mt-6">
                <Checklist
                  items={[
                    "In your booking confirmation email",
                    "On the shipping label",
                    <>
                      Can&rsquo;t find it?{" "}
                      <Link href="/contact-us" className="font-medium text-brand underline-offset-4 hover:underline">
                        Ask us
                      </Link>{" "}
                      and we&rsquo;ll look it up for you
                    </>,
                  ]}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead
              kicker="Step by step"
              title="How to track your shipment"
              lead="Four simple steps, from booking to the front door."
            />
          </div>
          <div className="-mb-px">
            <Steps
              steps={[
                { title: "Find your number", body: "It's in your confirmation email and printed on your shipping label." },
                {
                  title: "Check the status",
                  body: "Updates come from the carrier handling your shipment. Signed-in customers can see every shipment in their account.",
                },
                { title: "Share it", body: "Send the number to the person receiving it, so they can follow it to their door." },
                { title: "Call us if it stalls", body: "If nothing has moved for longer than you'd expect, we'll chase it with the carrier." },
              ]}
            />
          </div>
        </Section>

        <TopicScroller
          topics={[
            {
              id: "what-the-scans-mean",
              title: "What the scans mean",
              lead: "Your tracking updates each time the carrier scans your shipment. It reflects the same information the carrier's own system holds.",
              content: (
                <Checklist
                  items={[
                    <><strong className="font-semibold">Collected.</strong> The driver has picked it up.</>,
                    <><strong className="font-semibold">Departed.</strong> It has left the origin facility.</>,
                    <><strong className="font-semibold">Arrived.</strong> It has reached the destination country.</>,
                    <><strong className="font-semibold">Customs.</strong> It is being cleared by the local authorities.</>,
                    <><strong className="font-semibold">Delivered.</strong> It has reached the door.</>,
                  ]}
                />
              ),
            },
            {
              id: "quiet-spells-are-normal",
              title: "Quiet spells are normal",
              lead: "A gap of a day or two mid-route doesn't mean anything has gone wrong.",
              content: (
                <Prose>
                  <p>
                    International shipments usually show fewer scans than domestic ones. It&rsquo;s
                    normal for tracking to go quiet while a shipment is between countries or waiting
                    on customs. It will update again at the next scan.
                  </p>
                </Prose>
              ),
            },
            {
              id: "customs-clearance",
              title: "Customs clearance",
              lead: "The stage that most often adds unexpected time.",
              content: (
                <Prose>
                  <p>
                    Customs is handled by the destination country&rsquo;s authorities, not by the
                    carrier. They may need paperwork or a duty payment before they release the
                    shipment. Our guide to <Link href="/resources/customs-duty">customs duty</Link>{" "}
                    explains what&rsquo;s usually involved.
                  </p>
                </Prose>
              ),
            },
            {
              id: "number-not-recognized",
              title: "When your number shows nothing",
              lead: "Usually the first carrier scan just hasn't happened yet.",
              content: (
                <Prose>
                  <p>
                    The first scan can take up to 24 hours after collection. If there&rsquo;s still
                    nothing after that, or your shipment has been still for longer than you&rsquo;d
                    expect, <Link href="/contact-us">contact us</Link> and we&rsquo;ll
                    chase it with the carrier directly.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <SplitSection
          kicker="Support"
          title="Need help with"
          accent="a shipment?"
          lead="Our team can help with tracking, delivery updates and any shipping question. Call or email us, and a real person picks it up."
        >
          <ContactDetails layout="stack" />
          <Reveal delay={80} className="mt-6">
            <Link href="/contact-us" className="btn btn-primary btn-lg">
              Contact support <ArrowRightIcon size={15} />
            </Link>
          </Reveal>
        </SplitSection>

        <TrustedReviewsSection />
        <CtaBand title="Shipping something new?" />
      </PageBody>
    </>
  );
}
