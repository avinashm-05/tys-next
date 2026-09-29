import type { Metadata } from "next";
import Link from "next/link";
import {
  BatteryWarningIcon,
  BowlFoodIcon,
  CigaretteIcon,
  CrosshairIcon,
  CurrencyDollarIcon,
  DeviceMobileIcon,
  DiamondIcon,
  DropIcon,
  FileTextIcon,
  FireIcon,
  FlameIcon,
  GrainsIcon,
  HandHeartIcon,
  MoneyIcon,
  PawPrintIcon,
  PillIcon,
  PlantIcon,
  ProhibitIcon,
  ReceiptIcon,
  ScalesIcon,
  SealWarningIcon,
  SprayBottleIcon,
  WineIcon,
} from "@phosphor-icons/react/dist/ssr";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceFaq } from "@/components/public/service-page-sections";
import { TopicScroller } from "@/components/public/topic-scroller";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import type { Faq } from "@/lib/default-faqs";
import {
  CardGrid,
  Checklist,
  CtaBand,
  PAD,
  PageBody,
  Prose,
  Rail,
  SectionHead,
  SplitSection,
} from "@/components/public/page-kit";

export const metadata: Metadata = pageMetadata({
  title: "Prohibited Items for Shipping | TYS Global Logistics",
  description:
    "What you can't ship internationally from the US, what's allowed with conditions, and the extra rules for India, Canada and the UK. FedEx, UPS, DHL and USPS rules explained simply.",
  path: "/resources/prohibited-items",
});

// Updated 2026-09-29 from the carriers' own published lists (FedEx Service
// Guide and country lists, UPS, DHL US, USPS IMM) and official customs
// sources (CBIC India, CBSA, CFIA, gov.uk, trade.gov). Anything we couldn't
// verify from a primary source was left out. Rules change, so the page
// still ends every answer with "tell us and we'll check".
const FAQS: Faq[] = [
  {
    q: "Can I ship lithium batteries internationally?",
    a: "Yes, when the battery is inside the phone, laptop or camera it powers. Loose or spare lithium batteries are a different story: carriers treat them as dangerous goods, and we can't send them for you. Recalled or damaged batteries are refused everywhere.",
  },
  {
    q: "Can I ship alcohol?",
    a: "Not as a private person. Carriers only accept alcohol from licensed businesses shipping under a contract, and many countries restrict it on arrival too.",
  },
  {
    q: "Can I ship perfume or nail polish?",
    a: "They count as dangerous goods on planes because they're flammable, so they need a trained shipper and special paperwork. Most of the time the answer for a personal shipment is no. Ask us before you pack them.",
  },
  {
    q: "Can I ship food internationally?",
    a: "Sealed, shelf-stable food often can go. Anything that needs a fridge can't. Many countries also ban meat and dairy in personal parcels, the UK among them, so tell us what it is and where it's going.",
  },
  {
    q: "Can I ship medicines abroad?",
    a: "Sometimes. Many countries allow a personal amount with a prescription, and some ban certain medicines outright. Always declare them, and ask us first.",
  },
  {
    q: "Can I ship ashes or cremated remains?",
    a: "FedEx, UPS and DHL don't carry them. USPS does, on one service and only to countries that allow it. Call us and we'll explain your options gently and clearly.",
  },
  {
    q: "What happens if I ship a prohibited item?",
    a: "The shipment can be held, returned or destroyed, and extra charges or fines may apply. It's much easier to check before pickup.",
  },
];

export default function ProhibitedItemsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Prohibited Items", path: "/resources/prohibited-items" },
        ]}
      />
      <PageHeroBand
        title="Prohibited shipping items,"
        accent="and why"
        subtitle="What carriers and customs won't accept, what needs extra care, and what to do when you're not sure about something."
      />

      <PageBody>
        <SplitSection kicker="The basics" title="Why some items can't be shipped">
          <Prose>
            <p>
              Every carrier and every country has rules about what can travel through its network.
              Some rules are about safety, like hazardous materials on aircraft. Some are legal, like
              controlled substances. And some depend on the destination, because each country
              decides what it lets in.
            </p>
            <p>
              We can&rsquo;t accept a shipment that breaks any of these rules. The list below covers
              the common prohibited shipping items. It is a guide, not the full rulebook, so if
              something isn&rsquo;t listed and you&rsquo;re unsure, ask us.
            </p>
          </Prose>
        </SplitSection>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead
                kicker="Never accepted"
                title="What we can't ship"
                accent="at all"
                lead="The carriers we use won't take these for international shipments, whatever the packaging or paperwork."
              />
            </div>
            <CardGrid
              columns={4}
              cards={[
                {
                  icon: <MoneyIcon size={22} />,
                  title: "Cash and money-like papers",
                  body: "Cash, coins, and cheques or bonds that work like cash.",
                },
                {
                  icon: <CrosshairIcon size={22} />,
                  title: "Firearms and weapons",
                  body: "Guns, ammunition and gun parts, plus anything that looks like a bomb or grenade, even a toy or prop.",
                },
                {
                  icon: <FireIcon size={22} />,
                  title: "Explosives and fireworks",
                  body: "Fireworks, flares, and anything else that can explode or ignite.",
                },
                {
                  icon: <FlameIcon size={22} />,
                  title: "Hazardous chemicals",
                  body: "Toxic, corrosive or poisonous substances, like pesticides and strong cleaning chemicals.",
                },
                {
                  icon: <CigaretteIcon size={22} />,
                  title: "Tobacco and vapes",
                  body: "Cigarettes, cigars, loose tobacco, hookah, vapes, e-cigarettes and their liquids, with or without nicotine.",
                },
                {
                  icon: <ProhibitIcon size={22} />,
                  title: "Cannabis and drugs",
                  body: "Marijuana, CBD and anything with THC, even if it's legal in your state. Illegal drugs and kratom too.",
                },
                {
                  icon: <BatteryWarningIcon size={22} />,
                  title: "Recalled or damaged batteries",
                  body: "Any battery that's been recalled, is swollen or damaged, or sits in a recalled device.",
                },
                {
                  icon: <SealWarningIcon size={22} />,
                  title: "Counterfeit goods",
                  body: "Fakes and knock-offs of branded goods.",
                },
                {
                  icon: <PawPrintIcon size={22} />,
                  title: "Live animals",
                  body: "Pets, insects and other live animals can't travel as parcels or in household moves.",
                },
                {
                  icon: <PlantIcon size={22} />,
                  title: "Plants and cut flowers",
                  body: "Live plants and fresh flowers, sent as ordinary parcels.",
                },
                {
                  icon: <HandHeartIcon size={22} />,
                  title: "Ashes and human remains",
                  body: "FedEx, UPS and DHL won't carry them. Call us and we'll explain the options.",
                },
                {
                  icon: <DropIcon size={22} />,
                  title: "Wet, leaking or smelly parcels",
                  body: "Carriers refuse any package that's damp, leaking or gives off a strong smell.",
                },
              ]}
            />
          </Rail>
        </section>

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead
                kicker="With conditions"
                title="Allowed, but"
                accent="ask us first"
                lead="These can sometimes go, with the right service, paperwork or limits. Tell us what you have and we'll check."
              />
            </div>
            <CardGrid
              columns={4}
              cards={[
                {
                  icon: <DeviceMobileIcon size={22} />,
                  title: "Phones, laptops, cameras",
                  body: "Fine with the battery inside the device. Loose or spare lithium batteries are something we can't send for you.",
                },
                {
                  icon: <SprayBottleIcon size={22} />,
                  title: "Perfume, nail polish, sprays",
                  body: "These count as dangerous goods on planes. For personal shipments the answer is often no.",
                },
                {
                  icon: <WineIcon size={22} />,
                  title: "Alcohol",
                  body: "Carriers only accept it from licensed businesses, not from individuals.",
                },
                {
                  icon: <DiamondIcon size={22} />,
                  title: "Jewelry, gold and watches",
                  body: "Carrier cover is usually capped at $1,000, and some carriers and countries refuse them outright.",
                },
                {
                  icon: <PillIcon size={22} />,
                  title: "Medicines",
                  body: "Some countries allow a personal amount with a prescription. Always declare them.",
                },
                {
                  icon: <BowlFoodIcon size={22} />,
                  title: "Food",
                  body: "Sealed, shelf-stable food only, nothing that needs a fridge. Each country sets its own limits.",
                },
                {
                  icon: <GrainsIcon size={22} />,
                  title: "Seeds, wood, animal products",
                  body: "Often need a permit or a health certificate from the sender's side.",
                },
                {
                  icon: <FileTextIcon size={22} />,
                  title: "Anything over $2,500",
                  body: "If one kind of item is worth more than $2,500, the US needs an export filing (EEI). We'll tell you what's needed.",
                },
              ]}
            />
          </Rail>
        </section>

        <TopicScroller
          topics={[
            {
              id: "prohibited-vs-restricted",
              title: "Prohibited or restricted?",
              content: (
                <Prose>
                  <p>
                    <strong>Prohibited</strong> means it can&rsquo;t be shipped at all, whatever the
                    packaging or paperwork. <strong>Restricted</strong> means it can go, but only
                    under conditions: special packaging, a particular service, a permit, or a limit
                    on quantity.
                  </p>
                  <p>
                    The same item can be restricted with one carrier and refused by another, or
                    allowed into one country and banned in the next. That is why we check each
                    shipment rather than rely on a single list.
                  </p>
                </Prose>
              ),
            },
            {
              id: "india",
              title: "Shipping to India",
              lead: "India's courier rules are strict about a few things US senders often don't expect.",
              content: (
                <>
                  <Checklist
                    items={[
                      "No gold, silver or jewelry by courier.",
                      "No drones. India doesn't allow drone imports.",
                      "No satellite phones without a license from India's telecom department.",
                      "No seeds.",
                      "Some electronics must carry India's BIS safety certification.",
                    ]}
                  />
                  <p className="mt-5 text-[15px] text-ink-muted">
                    More in our <Link href="/destinations/india" className="font-medium text-brand hover:underline">India shipping guide</Link>.
                  </p>
                </>
              ),
            },
            {
              id: "canada",
              title: "Shipping to Canada",
              lead: "Legal in the US doesn't mean legal at the Canadian border.",
              content: (
                <>
                  <Checklist
                    items={[
                      "No cannabis or CBD in any form, even from a legal US store.",
                      "Alcohol and tobacco can't go as personal shipments.",
                      "Food gifts containing meat are refused.",
                    ]}
                  />
                  <p className="mt-5 text-[15px] text-ink-muted">
                    More in our <Link href="/destinations/canada" className="font-medium text-brand hover:underline">Canada shipping guide</Link>.
                  </p>
                </>
              ),
            },
            {
              id: "uk",
              title: "Shipping to the UK",
              lead: "The UK is especially careful about food, plants and self-defense items.",
              content: (
                <>
                  <Checklist
                    items={[
                      "No meat or dairy in personal parcels. That includes jerky.",
                      "Most plants and seeds need a plant health certificate.",
                      "No pepper spray, flick knives or replica guns.",
                    ]}
                  />
                  <p className="mt-5 text-[15px] text-ink-muted">
                    More in our <Link href="/destinations/uk" className="font-medium text-brand hover:underline">UK shipping guide</Link>.
                  </p>
                </>
              ),
            },
            {
              id: "leaving-the-us",
              title: "Rules for leaving the US",
              content: (
                <Prose>
                  <p>
                    The US has export rules of its own. When any one kind of item in a shipment is
                    worth more than $2,500, or the item needs an export license, an Electronic
                    Export Information (EEI) filing is required before it leaves.
                  </p>
                  <p>
                    Shipments to countries under US sanctions need government approval, and most
                    can&rsquo;t go at all. Whatever the destination, describe every item truthfully
                    on the customs form. Vague or wrong descriptions are the most common reason
                    shipments get held.
                  </p>
                </Prose>
              ),
            },
            {
              id: "before-you-pack",
              title: "Quick checks before you pack",
              lead: "We'd much rather check upfront than have your shipment held or returned at customs.",
              content: (
                <Checklist
                  items={[
                    "Does it have a battery? Tell us the brand and model.",
                    "Is it a liquid, a spray, a powder or a magnet?",
                    "Is it food, a plant, seeds, or made from an animal?",
                    "Is any single item worth more than $1,000?",
                    "Where is it going? The destination's rules can change the answer.",
                    <>
                      Not sure? Call{" "}
                      <a href="tel:+14047938759" className="font-medium text-brand hover:underline">
                        +1 (404) 793-8759
                      </a>{" "}
                      or add a note to your quote request and we&rsquo;ll check before pickup.
                    </>,
                  ]}
                />
              ),
            },
          ]}
        />

        <ServiceFaq title="Questions about restricted items" faqs={FAQS} />

        <section>
          <Rail>
            <div className={`py-14 lg:py-16 ${PAD}`}>
              <SectionHead title="Related" accent="guides" />
            </div>
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: <ReceiptIcon size={22} />,
                  title: "Customs duty",
                  body: "Who pays duty and import tax, and how to avoid delays.",
                  href: "/resources/customs-duty",
                },
                {
                  icon: <ScalesIcon size={22} />,
                  title: "Volumetric weight",
                  body: "How box size affects what you pay, with a calculator.",
                  href: "/resources/volumetric-weight",
                },
                {
                  icon: <CurrencyDollarIcon size={22} />,
                  title: "Shipping rates",
                  body: "How we price a shipment and how to pay less.",
                  href: "/shipping-rates",
                },
              ]}
            />
          </Rail>
        </section>

        <TrustedReviewsSection />
        <CtaBand
          title="Checked your items?"
          accent="Get a free quote."
          lead="Tell us what you are sending and we will flag anything that needs attention before pickup."
        />
      </PageBody>
    </>
  );
}
