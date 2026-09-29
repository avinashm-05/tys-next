import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to the UK from the USA | TYS Global Logistics",
  description:
    "Shipping to the UK from the USA: documents, gifts and moving boxes to England, Scotland, Wales and Northern Ireland, with express or economy options.",
  path: "/destinations/uk",
});

export default function ShippingToUkPage() {
  return (
    <DestinationPage
      country="the United Kingdom"
      intro={
        <>
          <p>
            Shipping to the UK from the USA is one of the busiest routes we handle. Every major
            carrier flies it, so there is plenty of capacity, frequent departures and a real choice
            between express and economy depending on how soon it needs to arrive.
          </p>
          <p>
            We collect from any US address and deliver anywhere in England, Scotland, Wales and
            Northern Ireland, with tracking from door to door.
          </p>
        </>
      }
      sections={[
        {
          heading: "Customs and paperwork",
          body: (
            <>
              <p>
                The UK is outside the EU customs union, so everything arriving from the US is an
                import and clears UK customs on arrival. In practice that means a customs
                declaration saying what is in the shipment and what it is worth.
              </p>
              <p>
                HMRC charges import VAT, and duty where it applies, based on that declared value
                and the type of goods. Those charges are set by the UK government, not by us or the
                carrier. Our <Link href="/resources/customs-duty">customs duty guide</Link> explains
                how the calculation generally works.
              </p>
              <p>
                Personal effects and used household goods are treated differently from new retail
                goods, and people moving to the UK may qualify for relief on belongings they have
                owned and used. Tell us it is a relocation when you book and we will make sure the
                paperwork says so.
              </p>
            </>
          ),
        },
        {
          heading: "What people usually send",
          body: (
            <>
              <p>
                Mostly documents and small parcels: contracts, certificates, replacement parts,
                gifts. These go by express and are the simplest to clear.
              </p>
              <p>
                Bigger shipments are usually people moving: boxes of clothes and books, personal
                effects, sometimes furniture. If you are relocating rather than sending a one off
                parcel, see our{" "}
                <Link href="/services/international-relocation">international relocation</Link>{" "}
                service.
              </p>
              <p>
                Some things can&rsquo;t be sent with any carrier. Check the{" "}
                <Link href="/resources/prohibited-items">prohibited items guide</Link> before you
                pack.
              </p>
            </>
          ),
        },
        {
          heading: "How to keep the cost down",
          body: (
            <>
              <p>
                You pay for chargeable weight: whichever is greater, the actual weight or the
                volumetric weight worked out from the box size. A big, light box is billed for the
                space it takes up, so repacking into a smaller carton often saves more than the new
                box costs. Our <Link href="/resources/volumetric-weight">volumetric weight guide</Link>{" "}
                has a calculator.
              </p>
              <p>
                Sending several small parcels together as one shipment is almost always cheaper than
                sending them separately. And if the timing is flexible, economy costs a lot less than
                express. See <Link href="/shipping-rates">how our shipping rates work</Link> for the
                rest.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
