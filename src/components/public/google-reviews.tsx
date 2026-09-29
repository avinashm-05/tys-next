import { ArrowUpRightIcon, StarIcon } from "@phosphor-icons/react/dist/ssr";
import { siGoogle } from "simple-icons";
import {
  GOOGLE_PROFILE_URL,
  GOOGLE_RATING,
} from "@/lib/google-reviews";

// Real Google reviews (verbatim, see lib/google-reviews.ts), shown as a
// rating summary on the left and the reviews on the right. Used on the home
// page and, through TrustedReviewsSection, on every page that had the old
// made-up testimonial carousel.

export function GoogleMark({ size = 16 }: { size?: number }) {
  // Simple Icons ships Google's G as a single-colour path; Google blue reads
  // clearly at these sizes.
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label="Google">
      <path d={siGoogle.path} fill="#4285F4" />
    </svg>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon size={size} weight="fill" className="absolute inset-0 text-[#DCE2EA]" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarIcon size={size} weight="fill" className="text-[#FBBC04]" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function GoogleRatingPill() {
  return (
    <a
      href={GOOGLE_PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 rounded-full border border-[#E1E6EE] bg-white py-1.5 pl-2 pr-3.5 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition hover:border-[#C9D3E2]"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F1F5FB]">
        <GoogleMark size={13} />
      </span>
      <span className="font-semibold text-ink">{GOOGLE_RATING}</span>
      <Stars value={GOOGLE_RATING} size={14} />
      <span className="text-ink-muted">
        Google reviews
      </span>
      <ArrowUpRightIcon size={13} className="text-[#A3ACBA] transition group-hover:text-ink" />
    </a>
  );
}
