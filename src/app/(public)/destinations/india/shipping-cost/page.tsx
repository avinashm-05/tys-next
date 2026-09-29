import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceIntro, ServiceFaq } from "@/components/public/service-page-sections";
import {
  CardGrid,
  Checklist,
  CtaBand,
  PAD,
  PageBody,
  Prose,
  Section,
  SectionHead,
  SplitSection,
  Steps,
} from "@/components/public/page-kit";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  ArrowRightIcon,
  CubeIcon,
  EnvelopeSimpleIcon,
  HouseLineIcon,
  LaptopIcon,
  LightningIcon,
  MapPinIcon,
  PackageIcon,
  ReceiptIcon,
  RulerIcon,
  ScalesIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

// USA to India shipping cost (new 2026-09-29, SEO page under the India guide).
// Targets "usa to india shipping cost", "shipping cost per kg usa to india"
// and "cheapest way to ship to india". Deliberately NO prices, per-kg rates
// or transit times: carrier pricing changes often and a stale number on a
// public page is worse than none. The worked example uses the same divisors
// as /resources/volumetric-weight (139 for in/lb, 5000 for cm/kg):
// 24 x 18 x 16 = 6912 / 139 = 49.7 lb; 60 x 45 x 40 = 108000 / 5000 = 21.6 kg;
// 20 x 16 x 14 = 4480 / 139 = 32.2 lb.

const LINK = "font-medium text-brand hover:underline";
const QUOTE_IN = "/quotes?to_country=IN";

export const metadata: Metadata = pageMetadata({
  title: "USA to India Shipping Cost Explained | TYS Global Logistics",
  description:
    "What sets the USA to India shipping cost: chargeable weight, speed, carrier, PIN code, duty and GST. Tips to pay less, and a free, exact quote from real people.",
  path: "/destinations/india/shipping-cost",
});

export default function IndiaShippingCostPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: "Shipping to India", path: "/destinations/india" },
          { name: "Shipping cost", path: "/destinations/india/shipping-cost" },
        ]}
      />
      <PageHeroBand
        title="USA to India shipping cost,"
        accent="explained simply."
        subtitle="What you pay to send a box to India depends on a few clear things. Here is what they are, how to pay less, and how to get an exact price."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Shipping cost to India"
          heading="Why there is no one price for India"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-best-rates.svg", label: "Free", sub: "Exact quote for India" },
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "FedEx, DHL, UPS, USPS" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "Real people", sub: "Reply usually within 24 hours" },
          ]}
        >
          <p>
            Two boxes going from the same US city to India can cost very different amounts. One might
            be small and heavy, the other big and light. One might be going to Mumbai, the other to a
            small town. One might need to get there fast.
          </p>
          <p>
            So instead of a price list that goes out of date, we quote your actual box against current
            carrier pricing. This page explains what goes into that number. For everything else about
            the route, see our{" "}
            <Link href="/destinations/india" className={LINK}>
              guide to shipping to India
            </Link>
            .
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="What sets the price"
              title="Six things that decide"
              accent="your shipping cost to India."
              lead="Every quote we give you comes down to these."
            />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <ScalesIcon size={22} />,
                title: "Chargeable weight",
                body: "Carriers charge for the actual weight or the size of the box, whichever is higher. This matters more than anything else.",
              },
              {
                icon: <LightningIcon size={22} />,
                title: "How fast you need it",
                body: "Express costs more and arrives sooner. Economy costs less and suits heavier boxes that aren't urgent.",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "The carrier",
                body: "FedEx, DHL, UPS and USPS each price India differently. We compare them for your shipment.",
              },
              {
                icon: <MapPinIcon size={22} />,
                title: "The PIN code",
                body: "Big cities are the simplest. Some smaller towns and remote PIN codes cost more or take longer.",
              },
              {
                icon: <ReceiptIcon size={22} />,
                title: "Duty and GST",
                body: "Indian customs may charge these on arrival. They are government charges, separate from shipping.",
              },
              {
                icon: <CubeIcon size={22} />,
                title: "Packing",
                body: "A box that is too big for what's inside costs you money. A snug, sturdy box keeps the price down.",
              },
            ]}
          />
        </Section>

        <SplitSection
          id="chargeable-weight"
          kicker="Worked example"
          title="How chargeable weight"
          accent="is worked out."
          lead="This is the part that surprises most people. Here it is with real numbers."
        >
          <Prose>
            <p>
              Carriers look at two weights: what the box actually weighs on a scale, and its
              volumetric (or &ldquo;dimensional&rdquo;) weight, which is based on its size. You pay for
              whichever is higher. That higher number is the <strong>chargeable weight</strong>.
            </p>
            <h3>In inches and pounds</h3>
            <p>
              Multiply length by width by height, then divide by 139. A box 24 x 18 x 16 inches comes
              to 6,912 cubic inches. Divided by 139, that is about <strong>49.7 lb</strong>. If the box
              only weighs 30 lb on the scale, you are still charged for about 50 lb.
            </p>
            <h3>In centimeters and kilograms</h3>
            <p>
              Multiply length by width by height, then divide by 5,000. A box 60 x 45 x 40 cm comes to
              108,000 cubic centimeters. Divided by 5,000, that is <strong>21.6 kg</strong>. If it
              weighs 14 kg on the scale, the chargeable weight is still 21.6 kg.
            </p>
            <h3>What a smaller box does</h3>
            <p>
              Pack the same 30 lb of things into a 20 x 16 x 14 inch box and the volumetric weight
              drops to about 32.2 lb. That is close to the real weight, so you pay for far less empty
              air. Carriers also round up, so a little extra space can tip you into the next weight
              step.
            </p>
            <p>
              Try your own box with our{" "}
              <Link href="/resources/volumetric-weight">volumetric weight calculator</Link>.
            </p>
          </Prose>
        </SplitSection>

        <TopicScroller
          topics={[
            {
              id: "duty-and-gst",
              title: "Duty and GST: who pays",
              lead: "This is often the biggest surprise on a shipment to India, so decide it up front.",
              content: (
                <Prose>
                  <p>
                    Indian customs may charge import duty and GST on what you send. The amount depends
                    on what the items are and their declared value. These are government charges, not
                    part of what you pay us for shipping.
                  </p>
                  <p>There are two ways they get paid:</p>
                  <ul>
                    <li>
                      <strong>Duties unpaid</strong> (you may see this called DDU or DAP). The
                      receiver in India pays any duty and GST before delivery. This is the usual way.
                    </li>
                    <li>
                      <strong>Duties paid</strong> (DDP). The sender pays the duty and GST in the US,
                      so nothing is due at the door. Ask us if this is available for your shipment.
                    </li>
                  </ul>
                  <p>
                    Either way, tell your family in India to expect a call or message from the
                    carrier. Our <Link href="/resources/customs-duty">customs duty guide</Link> has
                    more on how duty works.
                  </p>
                </Prose>
              ),
            },
            {
              id: "cheapest-way-to-ship-to-india",
              title: "The cheapest way to ship to India",
              lead: "A few simple habits can bring the price down more than you might expect.",
              content: (
                <Checklist
                  items={[
                    <>
                      <strong className="font-semibold">Use the smallest sturdy box that fits.</strong>{" "}
                      Empty space is the most common reason people overpay.
                    </>,
                    <>
                      <strong className="font-semibold">Send one box instead of several small ones</strong>{" "}
                      when you can. Per-pound rates often drop as the weight goes up.
                    </>,
                    <>
                      <strong className="font-semibold">Choose economy if it isn&rsquo;t urgent.</strong>{" "}
                      Clothes and household things rarely need express.
                    </>,
                    <>
                      <strong className="font-semibold">Declare everything clearly.</strong> Vague lists
                      get shipments held, and storage while held can add cost.
                    </>,
                    <>
                      <strong className="font-semibold">Check the PIN code early.</strong> If it is
                      remote, we can tell you before you pack.
                    </>,
                    <>
                      <strong className="font-semibold">Leave out anything restricted.</strong> Check our{" "}
                      <Link href="/resources/prohibited-items" className={LINK}>
                        prohibited items guide
                      </Link>{" "}
                      so nothing has to come back.
                    </>,
                  ]}
                />
              ),
            },
            {
              id: "cost-per-kg",
              title: "Shipping cost per kg",
              lead: "People often ask for a per kg rate to India. Here is why it isn't that simple.",
              content: (
                <Prose>
                  <p>
                    Carriers price India in weight steps, not a flat rate per kg. The price per kg
                    usually changes as the weight goes up, and it differs between express and economy,
                    and between carriers.
                  </p>
                  <p>
                    Remember that the &ldquo;kg&rdquo; is the chargeable weight, not what the box
                    weighs on your bathroom scale. A light but bulky box is charged by its size.
                  </p>
                  <p>
                    The quickest way to know your real cost per kg is to get a quote with your box size
                    and weight. We show you the options side by side.
                  </p>
                </Prose>
              ),
            },
            {
              id: "remote-pin-codes",
              title: "Remote PIN codes",
              lead: "Where in India the box is going matters as well as how big it is.",
              content: (
                <Prose>
                  <p>
                    Big cities are well covered by every carrier. Some smaller towns and rural PIN
                    codes can carry an extra charge, take longer, or sit outside a carrier&rsquo;s
                    delivery area.
                  </p>
                  <p>
                    Give us the full address with the six-digit PIN code when you ask for a quote. If it
                    affects the price or the timing, we will tell you before anything is booked.
                  </p>
                </Prose>
              ),
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Your exact price"
              title="How to get an exact price"
              accent="for India."
              lead="It takes a few minutes, and a real person checks it."
              action={
                <Link href={QUOTE_IN} className="btn btn-primary btn-lg">
                  Get a free India quote <ArrowRightIcon size={15} />
                </Link>
              }
            />
          </div>
          <Steps
            steps={[
              {
                title: "Measure the box",
                body: "Length, width and height, in inches or centimeters. Round up to the next whole number.",
              },
              {
                title: "Weigh it",
                body: "A bathroom scale is fine. Weigh yourself holding the box, then subtract your own weight.",
              },
              {
                title: "Tell us what's inside",
                body: "A simple list with a value for each item, plus the full address and PIN code in India.",
              },
              {
                title: "Pick your option",
                body: "We come back with carriers and speeds to choose from. Then we book a pickup from your door.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Related guides" title="More on shipping" accent="to India." />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <PackageIcon size={22} />,
                title: "Shipping to India",
                body: "Our full guide to the route: customs, gifts, and choosing a service.",
                href: "/destinations/india",
              },
              {
                icon: <EnvelopeSimpleIcon size={22} />,
                title: "Documents to India",
                body: "Passports, certificates and legal papers, sent by express with tracking.",
                href: "/destinations/india/documents",
              },
              {
                icon: <LaptopIcon size={22} />,
                title: "Electronics to India",
                body: "Laptops, phones and TVs: batteries, BIS rules and duty.",
                href: "/destinations/india/electronics",
              },
              {
                icon: <HouseLineIcon size={22} />,
                title: "Moving to India",
                body: "Household goods and Transfer of Residence basics for a move home.",
                href: "/destinations/moving/india",
              },
              {
                icon: <RulerIcon size={22} />,
                title: "Volumetric weight",
                body: "Work out the chargeable weight of your own box in seconds.",
                href: "/resources/volumetric-weight",
              },
              {
                icon: <ReceiptIcon size={22} />,
                title: "Customs and duties",
                body: "What customs may charge on arrival, and how to avoid surprises.",
                href: "/resources/customs-duty",
              },
            ]}
          />
        </Section>

        <ServiceFaq
          title="USA to India shipping cost questions"
          faqs={[
            {
              q: "How much does it cost to ship a box from the USA to India?",
              a: "It depends on the box's chargeable weight, how fast you need it there, the carrier and the PIN code it is going to. Rather than publish prices that go out of date, we quote your actual box for free. Send us the size, weight and address and a real person replies, usually within 24 hours.",
            },
            {
              q: "What is the shipping cost per kg from the USA to India?",
              a: "There isn't one flat rate per kg. Carriers price India in weight steps, and the rate per kg usually changes as the weight goes up. It also differs between express and economy. The kg that counts is the chargeable weight, which can be higher than what the box weighs if it is large and light.",
            },
            {
              q: "What is the cheapest way to ship to India?",
              a: "Use the smallest sturdy box that fits, combine things into one box where you can, and choose economy if it isn't urgent. Declare everything clearly so the shipment isn't held. We compare FedEx, DHL, UPS and USPS for your shipment, so you can pick the best price for the speed you need.",
            },
            {
              q: "Who pays customs duty on a shipment to India?",
              a: "Usually the receiver pays any duty and GST in India before delivery. In some cases the sender can pay it upfront in the US, which is called duties paid or DDP. Ask us if that is available for your shipment. Duty is a government charge and is separate from the shipping price.",
            },
            {
              q: "Why is my box charged at a higher weight than it weighs?",
              a: "Carriers charge by volumetric weight when a box is large for its weight. In inches, multiply length by width by height and divide by 139 to get pounds. In centimeters, divide by 5,000 to get kilograms. You pay for whichever is higher, the real weight or the volumetric weight.",
            },
            {
              q: "Does it cost more to ship to a small town in India?",
              a: "It can. Some remote and rural PIN codes carry an extra charge or take longer, and a few are outside a carrier's delivery area. Give us the full address with the PIN code and we will tell you before anything is booked.",
            },
          ]}
        />

        <TrustedReviewsSection />
        <CtaBand
          title="Want the exact cost to India?"
          accent="Get a free quote."
          lead="Tell us the box size, weight and PIN code. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
