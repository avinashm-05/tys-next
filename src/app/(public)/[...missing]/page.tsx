import { notFound } from "next/navigation";

// Any URL no other route matches lands here, so it gets the site's own 404
// page (../not-found.tsx, with the header and footer) instead of Next's
// bare default. Catch-alls rank below every real route, so this never
// shadows an actual page.
export default function Missing() {
  notFound();
}
