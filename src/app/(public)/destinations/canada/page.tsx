import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to Canada from the USA — TYS Global Logistics",
  description:
    "Ship parcels, documents and personal effects from the US to Canada. Door-to-door collection, full tracking and customs guidance. Free quote in minutes.",
  path: "/destinations/canada",
});

export default function ShippingToCanadaPage() {
  return (
    <DestinationPage
      country="Canada"
      intro={
        <>
          <p>
            Canada is the shortest international route we run, and often the cheapest. Ground
            services cross the border directly, which makes it one of the few destinations where
            sending something heavy overland is genuinely economical rather than a compromise.
          </p>
          <p>
            We collect anywhere in the US and deliver across all provinces and territories.
          </p>
        </>
      }
      sections={[
        {
          heading: "The border is still a customs border",
          body: (
            <>
              <p>
                Proximity misleads people here: a shipment from the US to Canada is a full
                international export and clears Canadian customs like any other. It needs a
                proper declaration of contents and value.
              </p>
              <p>
                The CBSA assesses duty and taxes on arrival — GST, and PST or HST depending on
                the destination province. Those rates are set by federal and provincial
                government, not by the carrier. Goods that qualify under the USMCA rules of
                origin may attract reduced or no duty, but they still have to be declared
                correctly to get that treatment.
              </p>
            </>
          ),
        },
        {
          heading: "Ground, air, and which to pick",
          body: (
            <>
              <p>
                Ground works well for Canada in a way it does not for overseas destinations,
                because the shipment simply drives across the border. For heavier boxes with no
                urgent deadline it is usually the best value on this route.
              </p>
              <p>
                Air remains the better choice for documents, urgent shipments, and for remote
                destinations in the northern territories where ground networks are limited and
                transit times stretch considerably.
              </p>
            </>
          ),
        },
        {
          heading: "Moving to Canada",
          body: (
            <>
              <p>
                If you are relocating rather than sending a parcel, personal effects you have
                owned and used are treated differently from newly purchased goods, and settlers
                moving to Canada may be able to bring belongings in under specific relief
                provisions. Tell us it is a move when you book so the documentation is prepared
                correctly from the start —{" "}
                <a href="/services/international-relocation" className="text-brand hover:underline">
                  international relocation
                </a>{" "}
                covers the full process.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
