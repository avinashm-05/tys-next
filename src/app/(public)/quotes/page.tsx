import { redirect } from "next/navigation";

// The single-page quote form used to live here; it's now embedded directly
// in the home page hero (id="get-quote", see page.tsx) so a visitor never
// has to leave the home page to submit one. This route stays as a redirect
// — not a hard 404 — for anyone with an old /quotes bookmark or inbound
// link. from_country/to_country prefill params aren't carried forward:
// nothing currently sends this route those params anymore (the mini-quote-
// form.tsx "Need a Quote" card links to /#get-quote too), and the embedded
// form doesn't read query params off the home page URL.
export default function QuotesPage() {
  redirect("/#get-quote");
}
