// Real customer reviews from the TYS Global Logistics Google Business
// Profile, copied word for word on 2026-09-29 (source snapshot:
// 03_Website/design_review/google_reviews_2026-09-29.json).
//
// These replaced a set of made-up testimonials ("M. Alvarez, Small Business
// Owner" and others) that had been shown sitewide as if they were real. Only
// ever put genuine, verbatim reviews here: no edits to wording, no invented
// names, and keep the rating and count in step with Google. Presenting
// invented reviews as real is exactly what the FTC's 2024 rule on fake
// reviews prohibits.
//
// Relative dates ("a week ago") are deliberately not stored: they go stale
// the moment they're copied. Link to the live profile instead.

export type GoogleReview = {
  name: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** Google's own reviewer badge, shown as-is when present. */
  badge?: string;
};

export const GOOGLE_RATING = 4.5;
export const GOOGLE_REVIEW_COUNT = 6;

// Opens the business listing on Google Maps (the place's CID).
export const GOOGLE_PROFILE_URL = "https://maps.google.com/?cid=8999859939362281090";

export const GOOGLE_REVIEWS: readonly GoogleReview[] = [
  {
    name: "Jalak Pandya",
    badge: "Local Guide",
    stars: 5,
    text: "I used TYS Global Logistics for moving my entire 2-bedroom house. I spent over a month comparing different moving companies because I wanted a good rate without compromising on the service. TYS offered me the cheapest rates, along with flexible timing as per my availability. Their team handled my belongings carefully, and I received proper tracking updates throughout the shipment. The delivery was delayed by one day, but they informed me about it in advance and explained the reason properly. Overall, it was a good experience. I would definitely consider using their service again.",
  },
  {
    name: "Diti Kelaiya",
    stars: 5,
    text: "I used TYS Global Logistics to send my belongings and had a really smooth experience. The team was helpful and handled everything properly. My items arrived safely and the pricing was also good. Overall, I’m happy with the service.",
  },
  {
    name: "Dhvani Kanziya",
    stars: 5,
    text: "Overall, a good experience with TYS Global Logistics. Used their service to move some furniture and household items. The packing was done properly, and the team handled everything carefully. There was a small delay in delivery, but they kept me updated. Overall, good service and reasonable pricing.",
  },
  {
    name: "Nikita Singh",
    stars: 4,
    text: "Used TYS Global Logistics for moving my household items. Good service, reasonable pricing, and everything was handled carefully. Overall, it was a smooth and good experience. Special thanks to Krutik from their team for his support throughout the process.",
  },
  {
    name: "Hansaliya Prit",
    stars: 4,
    text: "Good experience with TYS Global Logistics. The team was helpful, the process was smooth, and everything was handled carefully.",
  },
  {
    name: "Kinjal Patel",
    stars: 4,
    text: "Affordable service",
  },
];
