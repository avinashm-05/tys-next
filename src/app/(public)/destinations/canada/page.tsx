import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to Canada from the USA | TYS Global Logistics",
  description:
    "Shipping to Canada from the USA: parcels, documents and personal effects collected from your door, tracked across the border, with help on customs.",
  path: "/destinations/canada",
});

export default function ShippingToCanadaPage() {
  return (
    <DestinationPage
      country="Canada"
      intro={
        <>
          <p>
            Shipping to Canada from the USA is the shortest international route we run, and often
            one of the cheapest. Ground services drive straight across the border, which makes
            Canada one of the few international destinations where sending something heavy by
            road is a genuinely good option.
          </p>
          <p>
            We collect from any US address and deliver to every Canadian province and territory,
            with tracking the whole way.
          </p>
        </>
      }
      sections={[
        {
          heading: "The border is still a customs border",
          body: (
            <>
              <p>
                It is easy to think of Canada as almost domestic. It isn&rsquo;t. A shipment from
                the US to Canada is a full international export and clears Canadian customs like
                any other, so it needs a proper declaration of what is inside and what it is worth.
              </p>
              <p>
                The Canada Border Services Agency (CBSA) assesses duty and taxes when the shipment
                arrives: GST, plus PST or HST depending on the province. Those rates are set by the
                federal and provincial governments, not by the carrier or by us.
              </p>
              <p>
                Goods that qualify under the USMCA rules of origin can come in with reduced or no
                duty, but only if they are declared correctly. Our{" "}
                <Link href="/resources/customs-duty">customs duty guide</Link> explains how duty is
                generally worked out.
              </p>
            </>
          ),
        },
        {
          heading: "Ground or air: which to pick",
          body: (
            <>
              <p>
                For heavier boxes with no tight deadline, ground is usually the best value on this
                route, because the shipment simply drives across the border.
              </p>
              <p>
                Air is the better choice for documents and anything urgent. It also makes sense for
                remote parts of the northern territories, where ground networks are thin and transit
                times get much longer.
              </p>
              <p>
                Not sure? Tell us the weight, the box size and when it needs to arrive, and we will
                quote both. See <Link href="/shipping-rates">how our rates work</Link> for what
                drives the price.
              </p>
            </>
          ),
        },
        {
          heading: "Moving to Canada",
          body: (
            <>
              <p>
                Relocating is different from sending a parcel. Personal effects you have owned and
                used are treated differently from new goods, and people settling in Canada may be
                able to bring their belongings in under specific relief rules.
              </p>
              <p>
                Tell us it is a move when you book, so the paperwork is right from the start. Our{" "}
                <Link href="/services/international-relocation">international relocation</Link>{" "}
                service covers the whole process, from packing to delivery at your new address.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
