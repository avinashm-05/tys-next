// The ONE source of truth for the Better Auth cookie prefix. auth.ts feeds it
// to Better Auth (advanced.cookiePrefix → "<prefix>.session_token", with
// __Secure- added on HTTPS); proxy.ts resolves the cookie via Better Auth's
// own getSessionCookie(request, { cookiePrefix }) so the two can never drift.
// Kept in its own module because proxy.ts must not import the full auth stack.
export const AUTH_COOKIE_PREFIX = "tys-admin";
