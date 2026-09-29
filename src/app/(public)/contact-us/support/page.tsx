import { permanentRedirect } from "next/navigation";

// The support message form was removed 2026-09-29 at the owner's request:
// call and email are the support channels, both on /contact-us. Old links
// and bookmarks land there instead of a 404.
export default function ContactSupportPage() {
  permanentRedirect("/contact-us");
}
