import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to the UAE from the USA | TYS Global Logistics",
  description:
    "Shipping to the UAE from the USA: parcels, electronics and belongings for a work move, sent door to door to Dubai, Abu Dhabi and beyond, with customs help.",
  path: "/destinations/uae",
});

export default function ShippingToUaePage() {
  return (
    <DestinationPage
      country="the UAE"
      intro={
        <>
          <p>
            We handle shipping to the UAE from the USA for families, friends and people moving there
            for work. We deliver to Dubai, Abu Dhabi, Sharjah and the other emirates. We collect
            from your US address and send it door to door with FedEx, DHL, UPS or USPS, at
            discounted rates, with tracking the whole way.
          </p>
          <p>
            Ask for a free quote and a real person will reply, usually within 24 hours. If you would
            rather talk it through, call us on +1 (404) 793-8759.
          </p>
        </>
      }
      sections={[
        {
          heading: "Moving to the UAE for work",
          body: (
            <>
              <p>
                Starting a new job in Dubai or Abu Dhabi? You can send clothes, books, kitchen things
                and other belongings ahead, so they are waiting when you arrive.
              </p>
              <p>
                For a few suitcases, our{" "}
                <Link href="/services/baggage-shipping">baggage shipping</Link> service is often
                easier than paying airline excess fees. For a whole household, our{" "}
                <Link href="/services/international-relocation">international relocation</Link>{" "}
                service covers furniture and larger moves.
              </p>
            </>
          ),
        },
        {
          heading: "Medicines: check with us first",
          body: (
            <>
              <p>
                The UAE controls medicines very strictly. Some medicines that are easy to get in the
                US are controlled there, and can&rsquo;t come into the country without approval.
              </p>
              <p>
                Please don&rsquo;t pack any medicine without asking us first. We will tell you what
                can go and what can&rsquo;t. It is much easier to sort out before pickup than after
                a parcel is held at customs.
              </p>
            </>
          ),
        },
        {
          heading: "Electronics and everyday items",
          body: (
            <>
              <p>
                Phones, laptops, tablets and cameras are some of the most common things we send to
                the UAE. They have lithium batteries, and carriers have packing rules for those.
                Tell us what is in the box and we will make sure it is packed and declared the right
                way.
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
          heading: "Customs and paperwork",
          body: (
            <>
              <p>
                UAE customs want a clear list of what is inside, with a value for each item. Vague
                words like &ldquo;gift&rdquo; or &ldquo;personal items&rdquo; can lead to delays. We
                help you fill in the paperwork.
              </p>
              <p>
                Customs may charge duty and tax on arrival, based on the value and type of goods.
                These are government charges, separate from what you pay us for shipping. Make sure
                the person receiving the parcel can be reached by phone.
              </p>
              <p>
                Express is the fastest option. Economy costs less and suits heavier boxes that
                aren&rsquo;t urgent. Our{" "}
                <Link href="/resources/volumetric-weight">volumetric weight guide</Link> shows how
                the chargeable weight is worked out.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
