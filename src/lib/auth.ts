import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { AUTH_COOKIE_PREFIX } from "@/lib/auth-cookie";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import { generateUniqueUsername } from "@/lib/username";
import { HttpError, toErrorResponse } from "@/lib/validation/errors";

export const ADMIN_ROLES = ["super-admin", "admin"] as const;

const appUrl = () => (process.env.APP_URL ?? "").replace(/\/+$/, "");

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "mysql" }),
  // baseURL is the ADMIN host. The session cookie is host-only (we never set
  // crossSubDomainCookies), so a session set on one host never leaks to the
  // other (ARCHITECTURE §3): admins sign in on the admin host, customers on
  // the apex.
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  // /api/auth is served on BOTH hosts (proxy.ts SHARED prefix) since C1 —
  // customer auth posts from the apex origin, which must pass Better Auth's
  // origin check alongside baseURL.
  // Local dev only: a second `next dev` instance on another port (e.g. for
  // testing two logged-in roles side by side) is otherwise rejected with
  // "Invalid origin" the same way a stray www vs. apex mismatch is in
  // production — self-scoping since APP_URL is only ever a localhost URL in
  // dev, never in a real deployment.
  trustedOrigins: [
    appUrl(),
    ...(appUrl().startsWith("http://localhost") ? ["http://localhost:3001"] : []),
  ].filter(Boolean),
  emailAndPassword: {
    enabled: true,
    // C1: customer self-registration is OPEN — the database hook below forces
    // role "user" on every signup, so no signup path can yield an admin.
    // Admins are still created only via `npm run admin:create` (direct DB).
    disableSignUp: false,
    // C1: unverified users cannot sign in (Better Auth answers 403). Quote
    // visibility additionally re-checks emailVerified in the customer guards.
    requireEmailVerification: true,
    // Forgot-password flow: customers get the PUBLIC reset page on the apex;
    // admins keep the admin-host page. Role comes from the DB record (never
    // client input), so a customer can't obtain an admin-host reset link.
    sendResetPassword: async ({ user, token }) => {
      const role = (user as { role?: string | null }).role;
      const url = ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])
        ? `${process.env.BETTER_AUTH_URL}/reset-password?token=${token}`
        : `${appUrl()}/account/reset-password?token=${token}`;
      // Fire-and-forget for the same reason as the verification email
      // below — otherwise "check your inbox" waits on the email actually
      // being handed to the SMTP server first.
      void sendPasswordResetEmail(user.email, url).catch((err) => {
        console.error(
          "[auth] password reset email FAILED:",
          err instanceof Error ? `${err.name}: ${err.message}` : err,
        );
      });
    },
    // 60 minutes, explicit — Laravel parity; don't trust the library default.
    resetPasswordTokenExpiresIn: 3600,
    password: {
      hash: hashPassword, // new/reset passwords use Better Auth's scrypt
      // Existing users carry Laravel bcrypt hashes ($2y$), backfilled into
      // auth_accounts by scripts/backfill-auth.ts. bcryptjs treats $2y$ as
      // $2b$ (same algorithm); the prefix swap is belt-and-braces.
      verify: async ({ hash, password }) => {
        if (hash.startsWith("$2")) {
          return bcrypt.compare(password, hash.replace(/^\$2y\$/, "$2b$"));
        }
        return verifyPassword({ hash, password });
      },
    },
  },
  emailVerification: {
    // C1: the link must land on the APEX (customer world). Better Auth would
    // build it from baseURL (the admin host), so we build it ourselves from
    // the raw token; GET /api/auth/verify-email is served on the apex via the
    // shared proxy prefix, then redirects to the public login.
    sendVerificationEmail: async ({ user, token }) => {
      const url = `${appUrl()}/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(
        "/account/login?verified=1",
      )}`;
      // Fire-and-forget. Better Auth awaits this callback before answering
      // the browser, and requireEmailVerification means it runs on every
      // SIGN-IN ATTEMPT by an unverified account — so an awaited SMTP
      // round-trip to Hostinger's relay made "taking ages to log in" the
      // symptom of a 403 the server had already decided on (reported
      // 2026-09-14). `.catch`, not a bare await, so a failed send can't
      // become an unhandled rejection. Same reasoning as the quote route.
      void sendVerificationEmail(user.email, url).catch((err) => {
        console.error(
          "[auth] verification email FAILED:",
          err instanceof Error ? `${err.name}: ${err.message}` : err,
        );
      });
    },
    sendOnSignUp: true,
  },
  databaseHooks: {
    user: {
      create: {
        // SECURITY INVARIANT (C1): every user created through Better Auth's
        // API (i.e. public signup) is a CUSTOMER — role "user" + the "user"
        // user_type, regardless of anything in the request. `role` is also
        // input:false below, so it can't arrive from the client at all.
        // Admin creation never passes through here (admin:create is direct
        // Prisma) and is unaffected.
        // Usernames are assigned here, not chosen at signup — the form stays
        // Name/Email/Password. Derived from the name (falling back to the
        // email local part) and de-duplicated; users_username_unique is the
        // real guarantee if two signups race. displayUsername keeps the
        // same value since nothing user-typed produced it.
        before: async (user) => {
          const username = await generateUniqueUsername(
            "name" in user && typeof user.name === "string" ? user.name : null,
            "email" in user && typeof user.email === "string" ? user.email : null,
          );
          return {
            data: {
              ...user,
              role: "user",
              username,
              displayUsername: username,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };
        },
        // user_type_id stays Laravel's source of truth — set it via Prisma
        // directly (BigInt column; kept out of Better Auth's field model).
        after: async (user) => {
          const userType = await db.userType.findUnique({ where: { slug: "user" } });
          if (userType) {
            await db.user.update({
              where: { id: BigInt(user.id) },
              data: { userTypeId: userType.id },
            });
          }
        },
      },
    },
  },
  user: {
    // Prisma model `User` maps to the existing `users` table; field names
    // already match Better Auth's defaults (emailVerified, image, ...).
    additionalFields: {
      // Copy of user_types.slug: super-admin | admin | staff | user.
      // Backfilled by scripts/backfill-auth.ts; never client-writable.
      role: { type: "string", required: false, input: false },
      // C1 profile field; set only via PATCH /api/account/profile (never at signup).
      phone: { type: "string", required: false, input: false },
    },
  },
  advanced: {
    // Explicit cookie prefix shared with proxy.ts (src/lib/auth-cookie.ts) —
    // the proxy resolves the session cookie from this same constant.
    cookiePrefix: AUTH_COOKIE_PREFIX,
    database: {
      // All ids are MySQL AUTO_INCREMENT BIGINTs — let the DB generate them.
      generateId: "serial",
    },
  },
  // Better Auth's built-in limiter throttles sign-in earlier (3/10s) than the
  // Laravel contract allows. The route handler enforces Laravel's exact rule
  // instead: 5 per email+IP per minute, 422 body (R33/R15).
  rateLimit: { enabled: false },
  // `username` adds sign-in by handle (POST /api/auth/sign-in/username)
  // alongside the existing email path, and owns the username/displayUsername
  // columns. nextCookies() stays last — it has to observe the other plugins'
  // Set-Cookie headers.
  plugins: [username(), nextCookies()],
});

export type AppSession = typeof auth.$Infer.Session;

/**
 * DB-backed session for the current request (Route Handler / server
 * component). React-cached so layout + page can both guard (the A2 rule:
 * every admin page calls requireAdminPage) with ONE session lookup.
 */
export const getSession = cache(async (): Promise<AppSession | null> => {
  return auth.api.getSession({ headers: await headers() });
});

/** Mirrors Laravel's User::isAdmin() — slug ∈ {super-admin, admin}. */
export function isAdmin(session: AppSession | null): boolean {
  const role = (session?.user as { role?: string | null } | undefined)?.role;
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
}

/**
 * THE security boundary (CVE-2025-29927): enforced inside every admin Route
 * Handler and server component. Middleware/proxy only redirects (R19).
 */
export function requireAdmin(session: AppSession | null): AppSession {
  if (!session?.user) throw new HttpError(401, "Unauthenticated.");
  if (!isAdmin(session)) throw new HttpError(403, "This action is unauthorized.");
  return session;
}

/**
 * REQUIRED wrapper for every /api/admin/* Route Handler — makes the guard
 * un-forgettable:
 *
 *   export const GET = adminRoute(async (req, ctx, session) => { ... });
 *
 * Runs the session check, hands the verified session to the handler, and
 * converts thrown HttpError/ZodError into the Laravel-shaped responses.
 */
export function adminRoute<Ctx = unknown>(
  handler: (req: Request, ctx: Ctx, session: AppSession) => Promise<Response> | Response,
): (req: Request, ctx: Ctx) => Promise<Response> {
  return async (req, ctx) => {
    try {
      const session = requireAdmin(await getSession());
      return await handler(req, ctx, session);
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}

/**
 * REQUIRED guard for admin server components/layouts. Anonymous → /login;
 * authenticated non-admins get a 404 (hides the admin surface and avoids a
 * login redirect loop — the API layer still answers real 403s via adminRoute).
 */
export async function requireAdminPage(): Promise<AppSession> {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (!isAdmin(session)) notFound();
  return session;
}

// ── Customer guards (C1) — mirror the admin pattern ─────────────────────────
// The portal links data to quotes by VERIFIED email (quotes are anonymous, the
// denormalized contact email is the only join key), so both guards require an
// email-verified session and callers scope every query to session.user.email.

/**
 * Route-handler guard: logged-in AND email-verified. requireEmailVerification
 * already blocks unverified sign-in; this re-check is belt-and-braces (e.g. a
 * session predating verification-required, or a future email change).
 */
export function requireCustomer(session: AppSession | null): AppSession {
  if (!session?.user) throw new HttpError(401, "Unauthenticated.");
  if (!session.user.emailVerified) {
    throw new HttpError(403, "Please verify your email address first.");
  }
  return session;
}

/**
 * REQUIRED wrapper for every /api/account/* Route Handler:
 *   export const PATCH = customerRoute(async (req, ctx, session) => { ... });
 */
export function customerRoute<Ctx = unknown>(
  handler: (req: Request, ctx: Ctx, session: AppSession) => Promise<Response> | Response,
): (req: Request, ctx: Ctx) => Promise<Response> {
  return async (req, ctx) => {
    try {
      const session = requireCustomer(await getSession());
      return await handler(req, ctx, session);
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}

/**
 * REQUIRED guard for /account server components/layouts. Anonymous →
 * /account/login; unverified → /account/verify-email (can't see quotes until
 * the email that scopes them is proven theirs).
 */
export async function requireCustomerPage(): Promise<AppSession> {
  const session = await getSession();
  if (!session?.user) redirect("/account/login");
  if (!session.user.emailVerified) redirect("/account/verify-email");
  return session;
}
