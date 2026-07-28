// Trustpilot's brand mark — a 5-pointed star in their signature green
// (#00B67A). Inline SVG — no asset file needed. Mirrors google-logo.tsx.
export function TrustpilotLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#00B67A"
        d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01z"
      />
    </svg>
  );
}

const STAR_PATH = "M10 1l2.42 5.21L18 7.03l-4.17 4.06.98 5.73L10 14.06l-4.81 2.76.98-5.73L2 7.03l5.58-.82z";

// One TrustBox-style rating square (green fill, white star). `half` splits
// the fill green/grey down the middle for a partial star, same visual
// convention as Trustpilot's own widget.
function RatingSquare({ half }: { half?: boolean }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden>
      {half ? (
        <>
          <rect width={10} height={20} fill="#00B67A" />
          <rect x={10} width={10} height={20} fill="#DCDCE6" />
        </>
      ) : (
        <rect width={20} height={20} fill="#00B67A" />
      )}
      <path fill="#FFFFFF" d={STAR_PATH} />
    </svg>
  );
}

// Full Trustpilot lockup — the TrustBox-style 4.5-star rating row (green
// squares, white stars) plus the wordmark, instead of just the bare star
// mark. `dark` swaps the wordmark for light text on a dark background.
export function TrustpilotFullLogo({ dark }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex gap-0.5">
        <RatingSquare />
        <RatingSquare />
        <RatingSquare />
        <RatingSquare />
        <RatingSquare half />
      </span>
      <span className={`text-base font-bold ${dark ? "text-white" : "text-[#191919]"}`}>
        Trustpilot
      </span>
    </span>
  );
}
