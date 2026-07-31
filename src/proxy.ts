import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { AUTH_COOKIE_PREFIX } from "@/lib/auth-cookie";

/**
 * Routing ONLY (ARCHITECTURE §3). This file redirects and rewrites —
 * it is NOT the security boundary. Every admin Route Handler and server
 * component re-checks the session via adminRoute/requireAdminPage
 * (CVE-2025-29927: middleware-only auth is bypassable via
 * x-middleware-subrequest).
 *
 * Two modes, selected by ADMIN_ROUTING:
 *   "host" (default) — admin.<domain> → admin surfaces; apex → public.
 *       Used in local dev and production (the intended architecture).
 *   "path"           — single domain: admin lives under /admin (+ /login,
 *       /forgot-password, /reset-password, /api/admin, /api/auth); everything
 *       else is public. For hosts that can't serve two subdomains on one app
 *       (e.g. the Hostinger managed-Node demo). No host checks, no subdomain
 *       redirects — but auth is still enforced inside every admin route.
 */

// Paths that belong to the admin world.
const ADMIN_PAGE_PREFIXES = ["/admin", "/login", "/forgot-password", "/reset-password"];
const ADMIN_API_PREFIXES = ["/api/admin"];
// Always served regardless of host. /api/auth is SHARED since C1: customers
// authenticate on the apex, admins on the admin host — sessions stay host-only
// (host-scoped cookies), and every surface re-checks role server-side.
const SHARED_PREFIXES = ["/up", "/_next", "/favicon.ico", "/api/auth"];

const startsWithAny = (path: string, prefixes: string[]) =>
  prefixes.some((p) => path === p || path.startsWith(p + "/"));

function isAdminHost(req: NextRequest): boolean {
  const hostname = (req.headers.get("host") ?? "").split(":")[0];
  const configured = process.env.ADMIN_HOST; // e.g. admin.tysgloballogistics.com
  return configured ? hostname === configured : hostname.startsWith("admin.");
}

function hasSessionCookie(req: NextRequest): boolean {
  // UX hint only — presence of the Better Auth cookie, never trusted as auth.
  // Resolved by Better Auth's own helper from the shared prefix constant
  // (auth.ts sets the same prefix), so the name can never drift from what
  // the auth config actually emits.
  return getSessionCookie(req, { cookiePrefix: AUTH_COOKIE_PREFIX }) !== null;
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Canonicalize off www before anything else. A request landing on
  // www.<domain> (browser autocomplete/history, an old cached search
  // snippet, etc.) renders identically — same app, no DNS distinction —
  // but its Origin header won't match BETTER_AUTH_URL/trustedOrigins
  // (apex-only), so every auth call silently fails with "Invalid origin".
  // 308 (not 301/302) so POST bodies survive the redirect.
  const hostname = (req.headers.get("host") ?? "").split(":")[0];
  if (hostname.startsWith("www.")) {
    const url = req.nextUrl.clone();
    url.host = hostname.slice(4);
    return NextResponse.redirect(url, 308);
  }

  if (startsWithAny(pathname, SHARED_PREFIXES)) return NextResponse.next();

  // ── Single-domain (path) mode ────────────────────────────────────────────
  // Admin and public share one host, split by path. No host comparison, no
  // subdomain redirects. Only the UX bounce for anonymous /admin remains.
  if (process.env.ADMIN_ROUTING === "path") {
    if (pathname.startsWith("/admin") && !hasSessionCookie(req)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Host mode (default) ───────────────────────────────────────────────────
  if (isAdminHost(req)) {
    // Root of the admin host → dashboard (or login).
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = hasSessionCookie(req) ? "/admin" : "/login";
      return NextResponse.redirect(url);
    }
    // Bounce anonymous /admin hits to /login (UX only — see header comment).
    if (pathname.startsWith("/admin") && !hasSessionCookie(req)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    // Public pages/API don't exist on the admin host.
    if (
      !startsWithAny(pathname, ADMIN_PAGE_PREFIXES) &&
      !startsWithAny(pathname, ADMIN_API_PREFIXES)
    ) {
      if (pathname.startsWith("/api")) {
        return new NextResponse(null, { status: 404 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Apex: admin surfaces don't exist here.
  if (startsWithAny(pathname, ADMIN_API_PREFIXES)) {
    return new NextResponse(null, { status: 404 });
  }
  if (startsWithAny(pathname, ADMIN_PAGE_PREFIXES)) {
    const adminHost = process.env.ADMIN_HOST;
    if (adminHost) {
      const url = req.nextUrl.clone();
      url.host = adminHost;
      return NextResponse.redirect(url);
    }
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};