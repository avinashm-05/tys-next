import type { Metadata } from "next";

// The customer account area (login, register, the portal) is hidden from
// the public site for now. robots.txt blocks crawling it, but a blocked URL
// can still be indexed as a bare link, so every page here also says noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
