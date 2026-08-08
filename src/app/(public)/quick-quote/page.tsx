import { redirect } from "next/navigation";

// Retired as of the /quotes consolidation: the "call me back" UX (time slot,
// timezone, no route required) is now built directly into the single-page
// quote form itself, which saves a real Quote instead of a CallbackRequest
// so admin can still auto-rate it. That form now lives on the home page
// hero (id="get-quote") rather than its own /quotes route — see that
// route's own comment. This route stays as a redirect rather than a 404 so
// old links/bookmarks still land somewhere useful. The underlying
// CallbackRequestForm/CallbackRequest model/API route are kept working but
// unlinked — see feedback_deletion_permission memory (ask before deleting,
// even confirmed-unused code).
export default function QuickQuotePage() {
  redirect("/#get-quote");
}
