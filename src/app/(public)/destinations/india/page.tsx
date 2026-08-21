import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to India from the USA — TYS Global Logistics",
  description:
    "Ship parcels, documents and personal effects from the US to India. Door-to-door collection, full tracking and customs guidance. Free quote in minutes.",
  path: "/destinations/india",
});

export default function ShippingToIndiaPage() {
  return (
    <DestinationPage
      country="India"
      intro={
        <>
          <p>
            We ship from anywhere in the United States to addresses across India — from the
            major metros through to smaller cities and towns. Collection is arranged from your
            US address and the shipment is tracked the whole way.
          </p>
          <p>
            India has stricter import documentation requirements than many destinations, so the
            paperwork matters more here than on most routes. We will tell you exactly what is
            needed for your shipment before it leaves.
          </p>
        </>
      }
      sections={[
        {
          heading: "Customs and documentation",
          body: (
            <>
              <p>
                Indian customs require a clear, itemised description of the contents with a
                value against each item. Vague declarations such as &ldquo;gift&rdquo; or
                &ldquo;personal items&rdquo; are a common cause of shipments being held, so it
                is worth taking the time to list things properly.
              </p>
              <p>
                Duty and GST are assessed by Indian customs on arrival, based on the declared
                value and the category of goods. These are government charges, separate from
                what you pay us to ship. The recipient will usually need to be contactable to
                complete clearance, and for some shipment types their KYC identification may be
                requested.
              </p>
              <p>
                Deliveries to remote or rural PIN codes can take longer than to the main metros,
                and a small number of areas are outside carrier delivery networks entirely. We
                will flag that when we quote if it affects your destination.
              </p>
            </>
          ),
        },
        {
          heading: "Sending personal effects and gifts",
          body: (
            <>
              <p>
                A large share of this route is people sending things to family — clothing,
                medicines, documents, festival gifts — or moving belongings home. Those are all
                routine, but each has its own declaration requirements, and medicines in
                particular are restricted and need to be declared accurately.
              </p>
              <p>
                Some categories cannot be shipped at all. Check{" "}
                <a href="/resources/prohibited-items" className="text-brand hover:underline">
                  prohibited items
                </a>{" "}
                before packing, and ask us if you are unsure — it is far easier to resolve
                before collection than after a shipment is held at customs.
              </p>
            </>
          ),
        },
        {
          heading: "Choosing a service",
          body: (
            <>
              <p>
                Express services are the fastest and give the most detailed tracking, which is
                usually worth it for documents and anything time-sensitive. Economy air costs
                considerably less and suits heavier, non-urgent shipments such as household
                goods.
              </p>
              <p>
                For a full relocation rather than a parcel,{" "}
                <a href="/services/international-relocation" className="text-brand hover:underline">
                  international relocation
                </a>{" "}
                covers how larger moves are handled, including furniture and bulk personal
                effects.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
