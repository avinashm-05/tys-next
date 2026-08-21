import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to the UK from the USA — TYS Global Logistics",
  description:
    "Ship parcels, documents and personal effects from the US to the United Kingdom. Door-to-door collection, full tracking and customs guidance. Free quote in minutes.",
  path: "/destinations/uk",
});

export default function ShippingToUkPage() {
  return (
    <DestinationPage
      country="the United Kingdom"
      intro={
        <>
          <p>
            The US to UK route is one of the busiest we handle. It is well served by every major
            carrier, which means plenty of capacity, frequent departures and a choice between
            express and economy depending on how quickly you need the shipment there.
          </p>
          <p>
            We collect from any US address and deliver to any UK address — England, Scotland,
            Wales and Northern Ireland — with tracking from door to door.
          </p>
        </>
      }
      sections={[
        {
          heading: "Customs and paperwork",
          body: (
            <>
              <p>
                The UK is outside the EU customs union, so every shipment arriving from the US
                is treated as an import and clears UK customs on arrival. In practice that means
                a customs declaration describing what is in the shipment and what it is worth.
              </p>
              <p>
                Import VAT, and duty where it applies, are charged by HMRC based on that
                declared value and the type of goods. Those charges are set by the UK
                government, not by us or the carrier. Our{" "}
                <a href="/resources/customs-duty" className="text-brand hover:underline">
                  customs duty guide
                </a>{" "}
                explains how the calculation generally works.
              </p>
              <p>
                Personal effects and used household goods are treated differently from new
                retail goods, and people relocating to the UK may be eligible for relief on
                belongings they have owned and used. Tell us it is a relocation when you book
                and we will make sure the paperwork reflects that.
              </p>
            </>
          ),
        },
        {
          heading: "What people usually send",
          body: (
            <>
              <p>
                Documents and small parcels are the most common — contracts, certificates,
                replacement items, gifts. These move on express services and are the simplest to
                clear.
              </p>
              <p>
                Larger consignments are typically people moving: boxes of personal effects,
                books, clothing and furniture. If you are relocating rather than sending a one
                off parcel,{" "}
                <a href="/services/international-relocation" className="text-brand hover:underline">
                  international relocation
                </a>{" "}
                covers how we handle full moves.
              </p>
              <p>
                Be aware that some things cannot be sent regardless of carrier — see{" "}
                <a href="/resources/prohibited-items" className="text-brand hover:underline">
                  prohibited items
                </a>{" "}
                before you pack.
              </p>
            </>
          ),
        },
        {
          heading: "How to keep the cost down",
          body: (
            <>
              <p>
                Shipments are priced on chargeable weight — the greater of actual weight and
                volumetric weight worked out from the box dimensions. A big, light box is billed
                on the space it takes up, so repacking into a smaller carton often costs less
                than the packing materials. Our{" "}
                <a href="/resources/volumetric-weight" className="text-brand hover:underline">
                  volumetric weight guide
                </a>{" "}
                shows how that is calculated.
              </p>
              <p>
                Consolidating several small parcels into one shipment is almost always cheaper
                than sending them separately, and economy services cost substantially less than
                express if the timing is flexible.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
