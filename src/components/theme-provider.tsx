"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Applies the `.dark` class to <html> (attribute="class"), defaulting to the
 * OS setting. Only the admin has a toggle today.
 *
 * PUBLIC SITE (Phase B) NOTE: this provider wraps the whole app, so once the
 * apex/public pages exist they will inherit the persisted theme. Decide then
 * whether the public marketing pages force light (forcedTheme="light" on a
 * nested provider or per-route) or get their own toggle — don't let them
 * silently render dark without a design pass.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
