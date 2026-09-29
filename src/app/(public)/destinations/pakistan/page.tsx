import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to Pakistan from the USA | TYS Global Logistics",
  description:
    "Shipping to Pakistan from the USA: Eid and wedding gifts, clothes, electronics and documents, sent door to door with tracking and help on customs paperwork.",
  path: "/destinations/pakistan",
});

export default function ShippingToPakistanPage() {
  return (
    <DestinationPage
      country="Pakistan"
      intro={
        <>
          <p>
            We handle shipping to Pakistan from the USA for families sending to loved ones in
            Karachi, Lahore, Islamabad and towns right across the country. We collect from your US
            address and send it door to door with FedEx, DHL, UPS or USPS, at discounted rates, with
            tracking the whole way.
          </p>
          <p>
            Ask for a free quote and a real person will reply, usually within 24 hours. If you would
            rather talk it through, call us on +1 (404) 793-8759.
          </p>
        </>
      }
      sections={[
        {
          heading: "Gifts for Eid, weddings and family",
          body: (
            <>
              <p>
                Much of what goes to Pakistan is for family. Clothes and shoes for Eid, outfits for a
                wedding, toys for the children, or a new phone for someone back home. All of this is
                routine to ship.
              </p>
              <p>
                Eid and wedding season are busy times for every carrier. If a parcel needs to arrive
                for a special day, send it early and leave time for customs. We will talk you through
                the options when we quote.
              </p>
              <p>
                Phones, tablets and laptops have lithium batteries, and carriers have packing rules
                for those. Just tell us what is in the box and we will make sure it is packed and
                declared the right way.
              </p>
            </>
          ),
        },
        {
          heading: "Customs and paperwork",
          body: (
            <>
              <p>
                Pakistan customs want a clear list of what is inside, with a value for each item.
                Vague words like &ldquo;gift&rdquo; or &ldquo;personal items&rdquo; can lead to
                delays, so it helps to list things properly. We help you fill in the paperwork.
              </p>
              <p>
                Customs may charge duty and tax on arrival, based on the value and type of goods.
                These are government charges, separate from what you pay us for shipping. Make sure
                the person receiving the parcel can be reached by phone, in case customs or the
                carrier need to contact them.
              </p>
              <p>
                Some things can&rsquo;t be sent at all. Check our{" "}
                <Link href="/resources/prohibited-items">prohibited items guide</Link> before you
                pack, and ask us if you are not sure.
              </p>
            </>
          ),
        },
        {
          heading: "Sending documents",
          body: (
            <>
              <p>
                We send passports, property papers, legal documents and school or university
                certificates to Pakistan by express, with tracking from pickup to delivery. For
                anything important, express is usually the safest choice.
              </p>
              <p>
                Our <Link href="/services/document-shipping">document shipping</Link> page explains
                how it works.
              </p>
            </>
          ),
        },
        {
          heading: "Choosing a service",
          body: (
            <>
              <p>
                Express is the fastest option and has the most detailed tracking. Economy costs less
                and suits heavier boxes that aren&rsquo;t urgent, like clothes and household items.
              </p>
              <p>
                Price comes down to chargeable weight, so a well packed box can save you money. Our{" "}
                <Link href="/resources/volumetric-weight">volumetric weight guide</Link> shows how
                that is worked out.
              </p>
              <p>
                Moving a whole household? Our{" "}
                <Link href="/services/international-relocation">international relocation</Link>{" "}
                service covers furniture and larger moves.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
