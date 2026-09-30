import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeroBand } from "@/components/public/page-hero-band";
import { TrustedReviewsSection } from "@/components/public/trusted-reviews-section";
import { ContactDetails } from "@/app/(public)/contact-us/contact-details";
import {
  CardGrid,
  CtaBand,
  PAD,
  PageBody,
  Prose,
  Section,
  SectionHead,
  SplitSection,
  StatRow,
  Steps,
} from "@/components/public/page-kit";
import { BriefcaseIcon, CubeIcon, GlobeHemisphereWestIcon, HouseLineIcon, MapPinIcon, TruckIcon } from "@phosphor-icons/react/dist/ssr";
import { BreadcrumbJsonLd } from "@/components/public/breadcrumb-json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Our Offices: Atlanta and Ahmedabad | TYS Global Logistics",
  description:
    "Offices in Atlanta, Georgia and Ahmedabad, India. We collect from homes and businesses in all 50 US states and ship door to door to 200+ countries.",
  path: "/locations",
});

// Locations page, 2026-09-29 renovation (page kit).
// Expanded from 262 words in the 2026-08-21 audit: local search is the one
// area a national freight-forwarding competitor can't structurally out-rank
// us, so the Atlanta base and the nationwide collection model both need to
// be stated in indexable body copy, not only in an address block. Every
// claim here is already true elsewhere on the site. The old line saying
// Hartsfield-Jackson "handles more international cargo than almost any other
// US airport" was softened: it couldn't be verified.
export default function LocationsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
        ]}
      />
      <PageHeroBand quote={false}
        title="Atlanta, Ahmedabad,"
        accent="and your front door."
        subtitle="Our US head office is in Atlanta, Georgia, and our India office is in Ahmedabad. We collect from homes and businesses in all 50 states, so most customers never need to visit."
      />

      <PageBody>
        <SplitSection
          kicker="Our offices"
          title="Atlanta and Ahmedabad,"
          accent="collecting nationwide."
          lead="Our US head office is in Atlanta, Georgia, and our India office is in Bodakdev, Ahmedabad. Call, write, or visit once you've called ahead."
        >
          <ContactDetails layout="stack" />
          <Prose className="mt-8">
            <p>
              Atlanta is one of the best-connected freight hubs in the United States.
              Hartsfield-Jackson is one of the busiest airports in the world, and the interstates
              that run through the city reach most of the Southeast within a day&rsquo;s drive.
              That&rsquo;s a big part of why we&rsquo;re here.
            </p>
            <p>
              Local to Atlanta and prefer to hand your shipment over in person? Or want to talk
              through a complex move face to face? Call ahead on{" "}
              <a href="tel:+14047938759">+1 (404) 793-8759</a> and we&rsquo;ll set a time.
            </p>
          </Prose>
        </SplitSection>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead
              kicker="Nationwide pickup"
              title="You don't need to be"
              accent="in Georgia."
              lead="We arrange collection from homes and businesses in all 50 states through our carrier partners. There's nothing to drop off and no need to visit us."
            />
          </div>
          <div className="-mb-px">
            <Steps
              steps={[
                { title: "Get a quote", body: "Tell us where it's coming from and where it's going. It takes about 30 seconds." },
                { title: "We book the pickup", body: "We book the collection with the carrier, so you don't have to." },
                { title: "The driver comes to you", body: "Your shipment is collected from your home or business address." },
                { title: "Tracked all the way", body: "It joins the carrier's network and you can follow it to delivery." },
              ]}
            />
          </div>
        </Section>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead kicker="Coverage" title="Two offices," accent="a worldwide reach." />
          </div>
          <div className="-mb-px">
            <StatRow
              stats={[
                { n: "50", label: "US states we collect from" },
                { n: "200", s: "+", label: "Countries we ship to" },
                { n: "24", s: "/7", label: "Expert support" },
              ]}
            />
          </div>
        </Section>

        <Section flush>
          <div className={`py-16 lg:py-20 ${PAD}`}>
            <SectionHead
              kicker="Where we ship"
              title="Where your shipment can go"
              lead="Parcels, documents, household goods, vehicles and commercial freight, collected and delivered door to door."
            />
          </div>
          <div className="-mb-px">
            <CardGrid
              columns={3}
              cards={[
                {
                  icon: <GlobeHemisphereWestIcon size={22} />,
                  title: "Worldwide destinations",
                  body: "Transit times and customs rules vary by country. Our destinations guide covers what to expect.",
                  href: "/destinations",
                },
                {
                  icon: <TruckIcon size={22} />,
                  title: "Domestic shipping",
                  body: "Parcels and freight anywhere in the United States, picked up and delivered.",
                  href: "/services/domestic-shipping",
                },
                {
                  icon: <HouseLineIcon size={22} />,
                  title: "Domestic moving",
                  body: "Moving within the US? We move your household door to door.",
                  href: "/services/domestic-moving",
                },
                {
                  icon: <MapPinIcon size={22} />,
                  title: "Shipping from Atlanta",
                  body: "International shipping for homes and businesses across Georgia.",
                  href: "/locations/atlanta",
                },
                {
                  icon: <BriefcaseIcon size={22} />,
                  title: "Small business shipping",
                  body: "Discounted carrier rates for Atlanta sellers and small businesses.",
                  href: "/services/small-business-shipping",
                },
                {
                  icon: <CubeIcon size={22} />,
                  title: "Ship boxes internationally",
                  body: "Send one box or many overseas, with packing and customs help.",
                  href: "/services/ship-boxes-internationally",
                },
              ]}
            />
          </div>
        </Section>

        <TrustedReviewsSection />
        <CtaBand />
      </PageBody>
    </>
  );
}
