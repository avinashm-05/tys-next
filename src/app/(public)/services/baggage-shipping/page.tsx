import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceCtaBanner } from "@/components/public/service-page-sections";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";

export const metadata: Metadata = pageMetadata({
  title: "Baggage Shipping — Send Luggage Ahead | TYS Global Logistics",
  description:
    "Ship your luggage instead of checking it. Door-to-door baggage shipping from the US worldwide — collected from home, tracked all the way, no airport queues.",
  path: "/services/baggage-shipping",
});

// Added 2026-08-21. Highest-volume gap found in the keyword research
// (~70,530 monthly searches) with no competing page from SFL, so this is the
// single best organic opening identified in the audit.
export default function BaggageShippingPage() {
  return (
    <>
      <ServiceJsonLd
        name="Baggage Shipping"
        description="Door-to-door luggage and excess baggage shipping from the United States worldwide."
        slug="baggage-shipping"
      />
      <PageHeroBand
        title="Baggage Shipping"
        subtitle="Send your luggage ahead instead of dragging it through the airport"
      />
      <ServiceCtaBanner />

      <section className="px-4 pb-14 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4 text-ink-muted">
          <p>
            Airline baggage allowances are tight, and the charges for going over them are steep
            — particularly on a second or third bag, or when you are flying with everything you
            own because you are moving. Shipping your luggage separately is often cheaper than
            paying those fees, and it means you travel with nothing but a carry-on.
          </p>
          <p>
            We collect your bags or boxes from your home, hotel or university address, and
            deliver them to the address you are heading to. Everything is tracked door to door,
            so you can see where your belongings are rather than hoping they made the transfer.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">Who this suits</h2>
          <ul className="mt-4 space-y-3 text-ink-muted">
            <li>
              <strong className="text-ink">Students.</strong> Moving to or from university with
              more than one term&rsquo;s worth of belongings, especially internationally.
            </li>
            <li>
              <strong className="text-ink">People relocating.</strong> When you are flying to a
              new country to live, the excess baggage bill on the clothes and kit you actually
              need can rival the airfare.
            </li>
            <li>
              <strong className="text-ink">Long trips.</strong> Extended stays, sabbaticals and
              seasonal moves where you need more than a suitcase for a fortnight.
            </li>
            <li>
              <strong className="text-ink">Sports and specialist equipment.</strong> Golf clubs,
              skis, bikes and instruments, all of which airlines charge oversize fees for and
              handle roughly.
            </li>
            <li>
              <strong className="text-ink">Anyone who would rather not queue.</strong> No bag
              drop, no carousel, no lost-luggage desk.
            </li>
          </ul>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">How it works</h2>
          <ol className="mt-4 space-y-3 text-ink-muted">
            <li>
              <strong className="text-ink">1. Get a quote.</strong> Tell us where the bags are
              going and roughly what they weigh.
            </li>
            <li>
              <strong className="text-ink">2. We book the collection.</strong> A driver comes to
              your address at an agreed time — you do not need to go anywhere.
            </li>
            <li>
              <strong className="text-ink">3. Track it.</strong> You get a reference and can
              follow the shipment the whole way on our{" "}
              <Link href="/tracking" className="text-brand hover:underline">
                tracking page
              </Link>
              .
            </li>
            <li>
              <strong className="text-ink">4. It arrives.</strong> Delivered to the destination
              address, wherever you are staying.
            </li>
          </ol>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">Worth knowing before you book</h2>
          <div className="mt-4 space-y-4 text-ink-muted">
            <p>
              Send your bags early. Shipping is not same-day — allow enough time for the
              shipment to arrive before or shortly after you do, and remember that international
              shipments clear customs on arrival, which can add time outside anyone&rsquo;s
              control.
            </p>
            <p>
              Pack as if it is freight, not as if it is going in an aircraft hold. A hard case
              or a well-taped box survives the journey better than a soft holdall, and bags
              travelling internationally are handled more times than checked luggage is.
            </p>
            <p>
              Declare the contents accurately. Baggage crossing a border is an import like any
              other shipment, and the same{" "}
              <Link href="/resources/prohibited-items" className="text-brand hover:underline">
                prohibited item rules
              </Link>{" "}
              apply. Do not send cash, passports or anything irreplaceable — carry those.
            </p>
            <p>
              Price is based on chargeable weight, so an oversized but light bag is billed on
              the space it takes up. See{" "}
              <Link href="/resources/volumetric-weight" className="text-brand hover:underline">
                how volumetric weight works
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <TrustedReviewsSection />
    </>
  );
}
