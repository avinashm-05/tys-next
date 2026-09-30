import type { Metadata } from "next";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Admin-group layout: this is where Tailwind (globals.css) + the theme/toaster
// providers load, scoped to every /admin and auth route. The public site never
// pulls this in, so Tailwind's preflight can't fight the legacy site CSS.
// Staff login, 2-step setup and the whole admin panel: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <div className={cn("flex min-h-full flex-col font-sans")}>{children}</div>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
