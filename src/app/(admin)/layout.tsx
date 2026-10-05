import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Admin-group layout: this is where Tailwind (globals.css) + the theme/toaster
// providers load, scoped to every /admin and auth route. The public site never
// pulls this in, so Tailwind's preflight can't fight the legacy site CSS.
// Staff login, 2-step setup and the whole admin panel: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Same type as the public site (2026-10-05): Inter for everything, the TYS
// Oldschool Grotesk for page titles. Set as CSS variables on :root (not a
// wrapper class) so dialogs and menus, which portal to <body>, match too.
const inter = Inter({ subsets: ["latin"], display: "swap" });
const grotesk = localFont({
  src: "../../../public/frontend/assets/fonts/OldschoolGrotesk-Regular.woff",
  display: "swap",
});
const FONT_CSS = `html:root{--font-geist-sans:${inter.style.fontFamily};--font-display:${grotesk.style.fontFamily}}
.text-h1,.text-h2,.text-display,main h1{font-family:var(--font-display);font-weight:400;letter-spacing:-0.01em}`;

export default function AdminGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <style>{FONT_CSS}</style>
      <div className={cn("flex min-h-full flex-col font-sans")}>{children}</div>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
