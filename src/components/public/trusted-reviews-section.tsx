import { TrustpilotFullLogo } from "@/components/public/trustpilot-logo";
import { ReviewsCarousel } from "@/components/public/reviews-carousel";

const REVIEWS = [
  {
    name: "M. Alvarez",
    role: "Small Business Owner",
    quote:
      "Our freight arrived faster than the original estimate and the team kept us updated the whole way. Booking again for our next shipment.",
  },
  {
    name: "J. Whitfield",
    role: "Relocating Customer",
    quote:
      "Moving overseas felt overwhelming until TYS took over. Door-to-door pickup, clear pricing, and everything arrived intact.",
  },
  {
    name: "R. Okafor",
    role: "E-commerce Retailer",
    quote:
      "Volume shipping rates saved us real money this quarter, and their support team answers fast whenever we have a question.",
  },
  {
    name: "D. Martins",
    role: "Auto Import Dealer",
    quote:
      "Shipped three vehicles across two continents without a single delay. Clear communication at every step of the process.",
  },
  {
    name: "S. Park",
    role: "Online Store Owner",
    quote:
      "Parcel shipping used to eat into our margins. TYS cut our rates and our customers still get tracking updates in real time.",
  },
];

// "See Our Trusted Reviews" block, reused wherever a page needs it below the
// main content (currently the /destinations pages) — mirrors the home page's
// reviews section, plus the Google rating bar underneath the carousel.
export function TrustedReviewsSection() {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-[2.25rem] sm:text-[2.75rem] md:text-[3rem] font-bold leading-[1.15] sm:leading-[1.2] tracking-[-0.5px] sm:tracking-[-1.2px] md:tracking-[-1.8px] text-black">
          See Our <span className="text-brand">Trusted</span> Reviews
        </h2>
        <p className="mt-3 text-ink-muted">
          Every shipment tells a story. Read what our customers have to say about their experience
          with TYS Global Logistics.
        </p>
      </div>
      <div className="mt-10">
        <ReviewsCarousel reviews={REVIEWS} />
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:px-8">
        <p className="font-semibold text-ink">Customer reviews on Trustpilot</p>
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="font-semibold text-ink">Excellent</span>
          <TrustpilotFullLogo />
        </div>
      </div>
    </section>
  );
}
