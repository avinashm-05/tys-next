import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { ServiceJsonLd } from "@/components/public/service-json-ld";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";
import { ServiceIntro, ServiceFaq } from "@/components/public/service-page-sections";
import { CardGrid, Checklist, CtaBand, PAD, PageBody, Section, SectionHead, SplitSection, Steps } from "@/components/public/page-kit";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import {
  BookOpenTextIcon,
  CarProfileIcon,
  ChatsCircleIcon,
  GlobeHemisphereWestIcon,
  HeadsetIcon,
  MapPinLineIcon,
  MusicNotesIcon,
  PackageIcon,
  TruckIcon,
  WarehouseIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = pageMetadata({
  title: "Domestic Moving Services Across the US | TYS Global Logistics",
  description:
    "Moving within the US? We survey, pack, load, transport and unpack your home, with one moving advisor on your side from the first quote to the last box.",
  path: "/services/domestic-moving",
});

// Renovated 2026-09-29 onto the page kit.
export default function DomesticMovingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Domestic Moving", path: "/services/domestic-moving" },
        ]}
      />
      <ServiceJsonLd name="Domestic Moving" description="A simpler way to move within the United States, from the first box packed to the last one delivered." slug="domestic-moving" domestic />
      <PageHeroBand
        title="Domestic moving from the first box"
        accent="to the last."
        subtitle="Moving within the United States, planned by one advisor and handled by a team that packs, loads, drives and unpacks for you."
      />

      <PageBody>
        <ServiceIntro
          eyebrow="Domestic moving"
          heading="A domestic move with one advisor from start to finish"
          highlights={[
            { icon: "/frontend/icons/redesign/badge-door-to-door.svg", label: "Door to door", sub: "Packed and delivered" },
            { icon: "/frontend/icons/redesign/badge-priority-support.svg", label: "1 advisor", sub: "For your whole move" },
            { icon: "/frontend/icons/redesign/badge-trusted-carriers.svg", label: "24/7", sub: "Expert support" },
          ]}
        >
          <p>
            Our domestic moving service covers moves within a state or across the country. From
            your first quote to the last box delivered, one moving advisor plans the details with
            you and keeps everyone on schedule.
          </p>
          <p>
            Studio apartment or family home, we look at what you have, give you a clear price, then
            pack it, move it and unpack it with care.
          </p>
        </ServiceIntro>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead
              kicker="Why TYS"
              title="Why people move with us"
              lead="Moving is stressful enough. We keep the moving part calm and predictable."
            />
          </div>
          <CardGrid
            columns={4}
            cards={[
              {
                icon: <HeadsetIcon size={22} />,
                title: "One moving advisor",
                body: "The same person from quote to delivery, so you never repeat yourself.",
              },
              {
                icon: <PackageIcon size={22} />,
                title: "Packing done for you",
                body: "We wrap, box and label your things, with extra care for fragile pieces.",
              },
              {
                icon: <MapPinLineIcon size={22} />,
                title: "Updates on the way",
                body: "You know where your belongings are and when they'll arrive.",
              },
              {
                icon: <WarehouseIcon size={22} />,
                title: "Storage if you need it",
                body: "New place not ready yet? We can store your things until it is.",
              },
            ]}
          />
        </Section>

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead title="How your move works" lead="Four stages, with your advisor in touch at every one." />
          </div>
          <Steps
            steps={[
              {
                title: "Free survey and quote",
                body: "Show us what's moving, in person or on a video call, and get an upfront quote.",
              },
              {
                title: "Plan with your advisor",
                body: "Agree the dates, the packing and anything that needs special handling.",
              },
              {
                title: "Packing and loading",
                body: "Our crew takes apart furniture, packs your belongings and loads the truck.",
              },
              {
                title: "Delivery and setup",
                body: "We unload, unpack and put your furniture back together in your new home.",
              },
            ]}
          />
        </Section>

        <SplitSection
          kicker="What's included"
          title="Everything a move needs,"
          accent="in one quote."
          lead="Every move is different, so your quote lists exactly what's covered. Most include:"
        >
          <Checklist
            items={[
              "A free survey, in person or by video",
              "Packing materials and packing of your household goods",
              "Furniture disassembly before the move and reassembly after",
              "Loading, transport and unloading at your new home",
              "Unpacking and removal of packing debris",
              "An inventory list and your insurance paperwork",
              "Storage in transit, if your dates don't line up",
            ]}
          />
        </SplitSection>

        <ServiceFaq
          title="Domestic moving questions"
          faqs={[
            {
              q: "Do you provide packing materials and help?",
              a: "Yes. We supply the materials, and our crew can take apart furniture and pack your household for you. You also get an inventory list and insurance paperwork.",
            },
            {
              q: "Will I have one point of contact for my move?",
              a: "Yes. One moving advisor looks after your move from the first quote to delivery day.",
            },
            {
              q: "Can I store my belongings if my new home isn't ready?",
              a: "Yes. Storage in transit is available, so your things can wait safely until you can move in.",
            },
            {
              q: "Do you handle both local and long-distance domestic moves?",
              a: "Yes. We coordinate moves within a state and across state lines, anywhere in the US.",
            },
            {
              q: "Can you move my vehicle along with my household goods?",
              a: "Yes. We can schedule auto transport for your car alongside your household move, so both arrive on one plan.",
            },
            {
              q: "Is insurance available for my belongings?",
              a: "Yes. Insurance options are set out in your move paperwork, so you know what's covered before moving day.",
            },
          ]}
        />

        <Section flush>
          <div className={`py-14 lg:py-16 ${PAD}`}>
            <SectionHead kicker="Keep reading" title="Moving more than furniture?" />
          </div>
          <CardGrid
            columns={3}
            cards={[
              {
                icon: <CarProfileIcon size={22} />,
                title: "Auto transport",
                body: "Ship your car or motorcycle to the new address on an open or enclosed carrier.",
                href: "/services/auto-transport",
              },
              {
                icon: <MusicNotesIcon size={22} />,
                title: "Piano moving",
                body: "Upright and grand pianos moved across town or across the US.",
                href: "/services/piano-moving",
              },
              {
                icon: <GlobeHemisphereWestIcon size={22} />,
                title: "International relocation",
                body: "Moving abroad instead? Your household packed and delivered to your new country.",
                href: "/services/international-relocation",
              },
              {
                icon: <TruckIcon size={22} />,
                title: "Domestic shipping",
                body: "Only a few boxes to send? Ship them with FedEx, UPS or USPS at discounted rates.",
                href: "/services/domestic-shipping",
              },
              {
                icon: <BookOpenTextIcon size={22} />,
                title: "Prohibited items guide",
                body: "What can't be shipped, and why. Worth a look before you pack chemicals, fuel or aerosols.",
                href: "/resources/prohibited-items",
              },
              {
                icon: <ChatsCircleIcon size={22} />,
                title: "Talk to a moving advisor",
                body: "Tell us about your move and we'll help you plan it.",
                href: "/contact-us",
              },
            ]}
          />
        </Section>

        <TrustedReviewsSection />
        <CtaBand title="Planning a move?" accent="Get a free quote." />
      </PageBody>
    </>
  );
}
