import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { DestinationPage } from "@/components/public/destination-page";
import { CurrencyDollarIcon, EnvelopeSimpleIcon, HouseLineIcon, LaptopIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Shipping to India from the USA | TYS Global Logistics",
  description:
    "Shipping to India from the USA: parcels, gifts, documents and personal effects collected from your door, tracked to any PIN code, with help on customs.",
  path: "/destinations/india",
});

export default function ShippingToIndiaPage() {
  return (
    <DestinationPage
      country="India"
      guides={[
        { icon: <CurrencyDollarIcon size={22} />, title: "Shipping cost to India", body: "What sets the price, with a worked example, and how to pay less.", href: "/destinations/india/shipping-cost" },
        { icon: <EnvelopeSimpleIcon size={22} />, title: "Documents to India", body: "Passports, OCI and visa papers, property papers and certificates.", href: "/destinations/india/documents" },
        { icon: <LaptopIcon size={22} />, title: "Electronics to India", body: "Laptops, phones and TVs: batteries, BIS rules and customs duty.", href: "/destinations/india/electronics" },
        { icon: <HouseLineIcon size={22} />, title: "Moving to India", body: "Household goods, unaccompanied baggage and Transfer of Residence.", href: "/destinations/moving/india" },
      ]}
      intro={
        <>
          <p>
            We handle shipping to India from the USA for families, students and businesses, to the
            big metros and to smaller cities and towns. We collect from your US address
            and you can track the shipment all the way to the door.
          </p>
          <p>
            Indian customs are stricter about paperwork than many countries, so the declaration
            matters more on this route than on most. Before your shipment leaves, we tell you
            exactly what is needed for it.
          </p>
        </>
      }
      sections={[
        {
          heading: "Customs and documentation",
          body: (
            <>
              <p>
                Indian customs want a clear, itemized list of what is inside, with a value against
                each item. Vague descriptions like &ldquo;gift&rdquo; or &ldquo;personal
                items&rdquo; are one of the most common reasons shipments get held, so it is worth
                taking a few minutes to list things properly.
              </p>
              <p>
                Duty and GST are assessed by Indian customs on arrival, based on the declared value
                and the type of goods. These are government charges, separate from what you pay us
                for shipping. The recipient usually needs to be reachable to complete clearance, and
                for some shipments they may be asked for KYC identification.
              </p>
              <p>
                Remote and rural PIN codes can take longer than the metros, and a few areas sit
                outside carrier delivery networks altogether. If that affects your address, we will
                tell you when we quote.
              </p>
            </>
          ),
        },
        {
          heading: "Sending gifts and personal effects",
          body: (
            <>
              <p>
                Much of what goes to India is for family: clothes, medicines, documents, festival
                gifts, or belongings for someone moving home. All of that is routine, but each has
                its own declaration rules. Medicines in particular are restricted and must be
                declared accurately.
              </p>
              <p>
                Some things can&rsquo;t be shipped at all. Check our{" "}
                <Link href="/resources/prohibited-items">prohibited items guide</Link> before you
                pack, and ask us if you are unsure. It is far easier to sort out before pickup than
                after a shipment is held at customs.
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
                worth it for documents and anything time sensitive. Economy air costs a lot less and
                suits heavier shipments that aren&rsquo;t urgent, like household goods.
              </p>
              <p>
                Price comes down to chargeable weight, so a well packed box can save real money. Our{" "}
                <Link href="/resources/volumetric-weight">volumetric weight guide</Link> shows how
                that is worked out.
              </p>
              <p>
                Moving a whole household rather than sending a parcel? Our{" "}
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
