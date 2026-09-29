import type { Metadata } from "next";
import { ArrowsInIcon, CurrencyDollarIcon, PackageIcon, ProhibitIcon, ReceiptIcon, StackIcon } from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceFaq } from "@/components/public/service-page-sections";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import type { Faq } from "@/lib/default-faqs";
import { CardGrid, CtaBand, PAD, PageBody, Prose, Rail, Section, SectionHead, SplitSection } from "@/components/public/page-kit";
import { VolumetricCalculator } from "./volumetric-calculator";

export const metadata: Metadata = pageMetadata({
  title: "Volumetric Weight Calculator and Guide | TYS Global Logistics",
  description:
    "How volumetric (dimensional) weight is calculated, why it can decide your shipping rate, and a free calculator to work out the chargeable weight of your box.",
  path: "/resources/volumetric-weight",
});

const FAQS: Faq[] = [
  {
    q: "How do you calculate volumetric weight?",
    a: "Multiply the length, width and height of the box. In inches, divide by 139 to get pounds. In centimeters, divide by 5000 to get kilograms.",
  },
  {
    q: "What is chargeable weight?",
    a: "The weight you are billed for. It is whichever is greater: the actual weight on the scale or the volumetric weight worked out from the box size.",
  },
  {
    q: "Is volumetric weight the same as dimensional weight?",
    a: "Yes. Volumetric weight, dimensional weight and DIM weight all mean the same thing.",
  },
  {
    q: "Why was I charged for more than my box weighs?",
    a: "Because the box was billed on its volumetric weight. A large, light box takes up more space in a truck or plane than its weight suggests, so it is priced on the space it uses.",
  },
  {
    q: "How can I lower my volumetric weight?",
    a: "Use the smallest box that protects your item, trim empty space, and avoid bulky packaging where a snug fit will do.",
  },
];

// Worked examples. Numbers follow the formulas on this page exactly:
// 1728/139 = 12.43, 5184/139 = 37.29, 7776/139 = 55.94,
// 36000/5000 = 7.20, 96000/5000 = 19.20.
const EXAMPLES = [
  { box: "12 × 12 × 12 in", vol: "12.43 lb", actual: "15 lb", charged: "15 lb", by: "Actual" },
  { box: "18 × 18 × 16 in", vol: "37.29 lb", actual: "20 lb", charged: "37.29 lb", by: "Volumetric" },
  { box: "24 × 18 × 18 in", vol: "55.94 lb", actual: "30 lb", charged: "55.94 lb", by: "Volumetric" },
  { box: "40 × 30 × 30 cm", vol: "7.20 kg", actual: "9 kg", charged: "9 kg", by: "Actual" },
  { box: "60 × 40 × 40 cm", vol: "19.20 kg", actual: "12 kg", charged: "19.20 kg", by: "Volumetric" },
];

function Formula({ units, expr, result }: { units: string; expr: string; result: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
      <p className="text-[13px] font-medium text-ink-muted">{units}</p>
      <p className="mt-2 text-[1.35rem] leading-snug tracking-[-0.02em] text-ink sm:text-[1.5rem]" style={{ fontFamily: "var(--font-oldschool-grotesk)" }}>
        {expr} <span className="text-brand">= {result}</span>
      </p>
    </div>
  );
}

export default function VolumetricWeightPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Volumetric Weight", path: "/resources/volumetric-weight" },
        ]}
      />
      <PageHeroBand
        title="Volumetric weight"
        accent="explained"
        subtitle="How dimensional weight is calculated, why it can decide your shipping rate, and a calculator to check your own box."
      />

      <PageBody>
        <SplitSection kicker="The basics" title="What volumetric weight is">
          <Prose>
            <p>
              Volumetric weight, also called dimensional or DIM weight, prices a shipment by the
              space it takes up rather than just how heavy it is. You get it by multiplying the
              box&rsquo;s length, width and height, then dividing by a set number called the
              divisor.
            </p>
            <p>
              It exists because space on a truck or plane is limited. A big box of pillows weighs
              very little but fills the same space as a box of books, so carriers charge for
              whichever is greater: the weight or the space.
            </p>
          </Prose>
        </SplitSection>

        <Section id="calculator">
          <SectionHead
            kicker="Calculator"
            title="Volumetric weight"
            accent="calculator"
            lead="Enter your box size and what it weighs. We'll show the volumetric weight and the weight you'd be charged for."
          />
          <div className="mt-10 max-w-4xl">
            <VolumetricCalculator />
          </div>
        </Section>

        <TopicScroller
          topics={[
            {
              id: "the-formula",
              title: "How TYS calculates it",
              lead: "Our quote tool uses the same formula for every shipment.",
              content: (
                <div className="grid gap-3">
                  <Formula units="Inches and pounds" expr="L × W × H ÷ 139" result="lb" />
                  <Formula units="Centimeters and kilograms" expr="L × W × H ÷ 5000" result="kg" />
                  <Prose className="mt-4">
                    <p>
                      For example, an 18 × 18 × 16 inch box has a volumetric weight of 18 × 18 × 16
                      ÷ 139, which is about <strong>37.29 lb</strong>. If it actually weighs 20 lb,
                      you are charged for 37.29 lb, because that is the greater number.
                    </p>
                  </Prose>
                </div>
              ),
            },
            {
              id: "chargeable-weight",
              title: "Chargeable weight: whichever is greater",
              content: (
                <Prose>
                  <p>
                    You are billed on chargeable weight, which is the greater of the actual weight
                    and the volumetric weight. That&rsquo;s why a large, light box can cost more to
                    ship than a small, heavy one.
                  </p>
                  <p>
                    Heavy, compact items like books or tools are usually billed on actual weight.
                    Bulky, light things like bedding, lampshades or clothes in a big box are usually
                    billed on volume. When you enter dimensions in our quote form, chargeable weight
                    is worked out for you.
                  </p>
                </Prose>
              ),
            },
            {
              id: "worked-examples",
              title: "Worked examples",
              lead: "The same formulas applied to a few common box sizes.",
              content: (
                <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-[13px] text-ink-muted">
                        <th scope="col" className="py-3 pr-4 font-medium">Box size</th>
                        <th scope="col" className="py-3 pr-4 font-medium">Volumetric weight</th>
                        <th scope="col" className="py-3 pr-4 font-medium">Actual weight</th>
                        <th scope="col" className="py-3 pr-4 font-medium">Charged for</th>
                        <th scope="col" className="py-3 font-medium">Billed on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EXAMPLES.map((e) => (
                        <tr key={e.box} className="border-b border-[var(--line)] last:border-0">
                          <td className="py-3.5 pr-4 font-medium text-ink">{e.box}</td>
                          <td className="py-3.5 pr-4 tabular-nums text-ink-muted">{e.vol}</td>
                          <td className="py-3.5 pr-4 tabular-nums text-ink-muted">{e.actual}</td>
                          <td className="py-3.5 pr-4 tabular-nums font-semibold text-ink">{e.charged}</td>
                          <td className="py-3.5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[13px] font-medium ${
                                e.by === "Volumetric" ? "bg-[#EEF4FF] text-brand" : "text-ink-muted"
                              }`}
                            >
                              {e.by}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ),
            },
          ]}
        />

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead title="How to keep it" accent="down" lead="Small packing choices make a real difference to what you pay." />
            </div>
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: <PackageIcon size={22} />,
                  title: "Right-size the box",
                  body: "A box much bigger than what's inside raises the volumetric weight and the price for no reason.",
                },
                {
                  icon: <ArrowsInIcon size={22} />,
                  title: "Pack snug, not bulky",
                  body: "Use enough padding to protect the item, but trim empty space and oversized fillers.",
                },
                {
                  icon: <StackIcon size={22} />,
                  title: "Combine small parcels",
                  body: "Several small items in one well packed box usually cost less than sending them separately.",
                },
              ]}
            />
          </Rail>
        </section>

        <ServiceFaq title="Volumetric weight questions" faqs={FAQS} />

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead title="Related" accent="guides" />
            </div>
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: <CurrencyDollarIcon size={22} />,
                  title: "Shipping rates",
                  body: "Everything else that affects your price, from speed to destination.",
                  href: "/shipping-rates",
                },
                {
                  icon: <ReceiptIcon size={22} />,
                  title: "Customs duty",
                  body: "Who pays duty and import tax, and what decides the amount.",
                  href: "/resources/customs-duty",
                },
                {
                  icon: <ProhibitIcon size={22} />,
                  title: "Prohibited items",
                  body: "What can't be shipped, and what needs extra paperwork.",
                  href: "/resources/prohibited-items",
                },
              ]}
            />
          </Rail>
        </section>

        <TrustedReviewsSection />
        <CtaBand
          title="Know your box size?"
          accent="Get a free quote."
          lead="Enter the dimensions and weight and we'll price it against current carrier rates. A real person replies, usually within 24 hours."
        />
      </PageBody>
    </>
  );
}
