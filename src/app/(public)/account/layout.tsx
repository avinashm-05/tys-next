import type { Metadata } from "next";

// The customer account area (login, register, the portal) is hidden from
// the public site for now. robots.txt blocks crawling it, but a blocked URL
// can still be indexed as a bare link, so every page here also says noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// data-clarity-mask: if Clarity was already loaded on a public page before
// the visitor navigated here, it masks all text in the account area
// (addresses, phones, shipments). See analytics-scripts.tsx.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <div data-clarity-mask="true" className="contents">{children}</div>;
}
