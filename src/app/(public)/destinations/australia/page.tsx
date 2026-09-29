import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to Australia from the USA | TYS Global Logistics",
  description:
    "Shipping to Australia from the USA: gifts, documents and personal belongings sent door to door, with help on biosecurity rules, GST and customs paperwork.",
  path: "/destinations/australia",
});

export default function ShippingToAustraliaPage() {
  return (
    <DestinationPage
      country="Australia"
      intro={
        <>
          <p>
            We handle shipping to Australia from the USA for families, friends and people moving
            there. We deliver to Sydney, Melbourne, Brisbane, Perth, Adelaide and towns right across
            the country. We collect from your US address and send it door to door with FedEx, DHL,
            UPS or USPS, at discounted rates, with tracking the whole way.
          </p>
          <p>
            Ask for a free quote and a real person will reply, usually within 24 hours. If you would
            rather talk it through, call us on +1 (404) 793-8759.
          </p>
        </>
      }
      sections={[
        {
          heading: "Australia's strict biosecurity rules",
          body: (
            <>
              <p>
                Australia is very careful about what comes into the country, to protect its farms
                and wildlife. Food, plants and seeds, wooden items and animal products get extra
                checks, and some are not allowed in at all.
              </p>
              <p>
                If your parcel has any of these, it must be declared clearly, with a proper
                description of what each item is and what it is made from. A word like
                &ldquo;gift&rdquo; is not enough. Items that don&rsquo;t meet the rules can be held,
                treated or refused.
              </p>
              <p>
                Pack in new, clean boxes, not ones that held fruit, vegetables or meat. If you are
                not sure about an item, ask us before you pack.
              </p>
            </>
          ),
        },
        {
          heading: "GST and customs",
          body: (
            <>
              <p>
                Australia charges GST, its goods and services tax, on imported goods, and some goods
                may also attract duty. How and when these are collected depends on the value and
                type of what you send. These are government charges, separate from what you pay us
                for shipping.
              </p>
              <p>
                Customs want a clear list of what is inside, with a value for each item. We help you
                fill in the paperwork. Some things can&rsquo;t be sent at all, so check our{" "}
                <Link href="/resources/prohibited-items">prohibited items guide</Link> before you
                pack.
              </p>
            </>
          ),
        },
        {
          heading: "Choosing a service",
          body: (
            <>
              <p>
                Express is the fastest option and has the most detailed tracking, which is usually
                worth it for documents and anything time sensitive. Economy costs less and suits
                heavier boxes that aren&rsquo;t urgent.
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
